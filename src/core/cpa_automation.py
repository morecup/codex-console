"""
CPA 401 清理与自动补号服务
"""

import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote

from curl_cffi import requests as cffi_requests
from pydantic import BaseModel, Field, field_validator, model_validator

from ..config.constants import AccountStatus, EmailServiceType
from ..database import crud
from ..database.models import Account, CpaService
from ..database.session import get_db

logger = logging.getLogger(__name__)

CPA_AUTOMATION_CONFIG_KEY = "cpa_automation.config"
CPA_AUTOMATION_CATEGORY = "cpa_automation"
CPA_AUTOMATION_INTERVAL_SECONDS = 3600
CPA_AUTOMATION_POLL_SECONDS = 60
DEFAULT_MGMT_UA = "codex_cli_rs/0.76.0 (Debian 13.0.0; x86_64) WindowsTerminal"


class CpaAutomationConfig(BaseModel):
    """CPA 自动化配置"""

    enabled: bool = False
    cpa_service_id: Optional[int] = None
    target_count: int = Field(default=0, ge=0)
    email_service_type: str = EmailServiceType.TEMPMAIL.value
    email_service_id: Optional[int] = Field(default=None, ge=1)
    proxy_id: Optional[int] = Field(default=None, ge=1)
    proxy: Optional[str] = None
    interval_min: int = Field(default=5, ge=0)
    interval_max: int = Field(default=30, ge=0)
    concurrency: int = Field(default=1, ge=1, le=50)
    mode: str = "pipeline"
    sync_local_invalid: bool = True
    replenish_enabled: bool = True

    @field_validator("email_service_type")
    @classmethod
    def validate_email_service_type(cls, value: str) -> str:
        try:
            return EmailServiceType(value).value
        except ValueError as exc:
            raise ValueError(f"不支持的邮箱服务类型: {value}") from exc

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, value: str) -> str:
        if value not in {"parallel", "pipeline"}:
            raise ValueError("mode 必须是 parallel 或 pipeline")
        return value

    @model_validator(mode="after")
    def validate_interval_range(self):
        if self.interval_max < self.interval_min:
            raise ValueError("最大间隔不能小于最小间隔")
        return self


def load_cpa_automation_config(db) -> CpaAutomationConfig:
    """从 settings 表加载 CPA 自动化配置"""

    setting = crud.get_setting(db, CPA_AUTOMATION_CONFIG_KEY)
    if not setting or not setting.value:
        return CpaAutomationConfig()

    try:
        raw_value = json.loads(setting.value)
        if not isinstance(raw_value, dict):
            raise ValueError("配置内容不是对象")
        return CpaAutomationConfig(**raw_value)
    except Exception as exc:
        logger.warning("读取 CPA 自动化配置失败，回退默认值: %s", exc)
        return CpaAutomationConfig()


def save_cpa_automation_config(db, config: CpaAutomationConfig) -> CpaAutomationConfig:
    """保存 CPA 自动化配置到 settings 表"""

    crud.set_setting(
        db,
        CPA_AUTOMATION_CONFIG_KEY,
        json.dumps(config.model_dump(mode="json"), ensure_ascii=False),
        description="CPA 401 清理与自动补号配置",
        category=CPA_AUTOMATION_CATEGORY,
    )
    return config


def _utcnow() -> datetime:
    return datetime.utcnow()


def _dt_to_iso(value: Optional[datetime]) -> Optional[str]:
    if not value:
        return None
    return value.isoformat() + "Z" if not value.tzinfo else value.isoformat()


def _safe_json(text: str) -> Dict[str, Any]:
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _management_headers(token: str, content_type: Optional[str] = None) -> Dict[str, str]:
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def _build_management_urls(api_url: str) -> Tuple[str, str]:
    normalized = (api_url or "").strip().rstrip("/")
    lower_url = normalized.lower()

    if not normalized:
        raise ValueError("CPA API URL 不能为空")

    if lower_url.endswith("/auth-files"):
        management_base = normalized[: -len("/auth-files")]
    elif lower_url.endswith("/v0/management") or lower_url.endswith("/management"):
        management_base = normalized
    elif lower_url.endswith("/v0"):
        management_base = f"{normalized}/management"
    else:
        management_base = f"{normalized}/v0/management"

    return f"{management_base}/auth-files", f"{management_base}/api-call"


def _extract_account_id(item: Dict[str, Any]) -> Optional[str]:
    for key in ("chatgpt_account_id", "chatgptAccountId", "account_id", "accountId"):
        value = item.get(key)
        if value:
            return str(value).strip()
    return None


def _extract_item_email(item: Dict[str, Any]) -> Optional[str]:
    email = str(item.get("email") or "").strip().lower()
    if email:
        return email

    name = str(item.get("name") or item.get("id") or "").strip()
    if not name:
        return None

    basename = name.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    if basename.lower().endswith(".json"):
        basename = basename[:-5]

    return basename.lower() if "@" in basename else None


def _get_item_type(item: Dict[str, Any]) -> str:
    return str(item.get("type") or item.get("typo") or "").strip().lower()


def _format_response_error(response, prefix: str) -> str:
    try:
        payload = response.json()
        if isinstance(payload, dict):
            message = payload.get("message") or payload.get("detail")
            if message:
                return f"{prefix}: {message}"
    except Exception:
        pass

    if response.status_code == 401:
        return f"{prefix}: API Token 无效"
    if response.status_code == 403:
        return f"{prefix}: 远程管理未启用或无权限"
    if response.status_code == 404:
        return f"{prefix}: 未找到 management 接口，请检查 CPA 地址"
    return f"{prefix}: HTTP {response.status_code} - {response.text[:200]}"


def _fetch_auth_files(service: CpaService) -> List[Dict[str, Any]]:
    auth_files_url, _ = _build_management_urls(service.api_url)
    response = cffi_requests.get(
        auth_files_url,
        headers=_management_headers(service.api_token),
        proxies=None,
        timeout=20,
        impersonate="chrome110",
    )
    if response.status_code != 200:
        raise RuntimeError(_format_response_error(response, "获取 CPA auth-files 失败"))

    payload = response.json()
    files = payload.get("files") if isinstance(payload, dict) else []
    return files if isinstance(files, list) else []


def _delete_auth_file(service: CpaService, name: str) -> Tuple[bool, str]:
    auth_files_url, _ = _build_management_urls(service.api_url)
    response = cffi_requests.delete(
        f"{auth_files_url}?name={quote(name, safe='')}",
        headers=_management_headers(service.api_token),
        proxies=None,
        timeout=20,
        impersonate="chrome110",
    )
    payload = _safe_json(response.text)
    success = response.status_code == 200 and payload.get("status") == "ok"
    if success:
        return True, "ok"
    return False, _format_response_error(response, f"删除远端文件失败({name})")


def _probe_auth_file_401(service: CpaService, item: Dict[str, Any]) -> Dict[str, Any]:
    _, api_call_url = _build_management_urls(service.api_url)
    auth_index = item.get("auth_index")
    name = str(item.get("name") or item.get("id") or "").strip()
    result = {
        "name": name,
        "email": _extract_item_email(item),
        "account_id": _extract_account_id(item),
        "invalid_401": False,
        "error": None,
    }

    if not auth_index:
        return result

    headers = {
        "Authorization": "Bearer $TOKEN$",
        "Content-Type": "application/json",
        "User-Agent": DEFAULT_MGMT_UA,
    }
    if result["account_id"]:
        headers["Chatgpt-Account-Id"] = result["account_id"]

    payload = {
        "authIndex": auth_index,
        "method": "GET",
        "url": "https://chatgpt.com/backend-api/wham/usage",
        "header": headers,
    }

    try:
        response = cffi_requests.post(
            api_call_url,
            headers=_management_headers(service.api_token, content_type="application/json"),
            json=payload,
            proxies=None,
            timeout=15,
            impersonate="chrome110",
        )
        if response.status_code >= 400:
            result["error"] = _format_response_error(response, f"探测 401 失败({name or auth_index})")
            return result

        payload = _safe_json(response.text)
        result["invalid_401"] = payload.get("status_code") == 401
        return result
    except Exception as exc:
        result["error"] = f"探测 401 异常({name or auth_index}): {exc}"
        return result


def _scan_invalid_auth_files(service: CpaService, files: List[Dict[str, Any]]) -> Dict[str, Any]:
    candidates = [item for item in files if _get_item_type(item) == "codex"]
    if not candidates:
        return {
            "remote_codex_count": 0,
            "invalid_items": [],
            "errors": [],
        }

    invalid_items: List[Dict[str, Any]] = []
    errors: List[str] = []
    max_workers = min(10, max(1, len(candidates)))

    with ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="cpa_probe") as executor:
        futures = [executor.submit(_probe_auth_file_401, service, item) for item in candidates]
        for future in as_completed(futures):
            result = future.result()
            if result.get("invalid_401"):
                invalid_items.append(result)
            if result.get("error"):
                errors.append(result["error"])

    invalid_items.sort(key=lambda item: item.get("name") or "")
    return {
        "remote_codex_count": len(candidates),
        "invalid_items": invalid_items,
        "errors": errors,
    }


def _mark_local_accounts_invalid(
    service: CpaService,
    invalid_items: List[Dict[str, Any]],
) -> Dict[str, Any]:
    if not invalid_items:
        return {"count": 0, "accounts": []}

    updated_accounts: List[Dict[str, Any]] = []
    updated_ids = set()
    now = _utcnow().isoformat()

    with get_db() as db:
        for item in invalid_items:
            account = None
            account_id = item.get("account_id")
            email = item.get("email")

            if account_id:
                account = db.query(Account).filter(Account.account_id == account_id).first()
            if not account and email:
                account = db.query(Account).filter(Account.email == email).first()

            if not account or account.id in updated_ids:
                continue

            account.status = AccountStatus.EXPIRED.value
            account.cpa_uploaded = False
            account.cpa_uploaded_at = None

            extra_data = dict(account.extra_data or {})
            extra_data["cpa_automation"] = {
                "last_401_at": now,
                "service_id": service.id,
                "service_name": service.name,
                "remote_name": item.get("name"),
            }
            account.extra_data = extra_data

            updated_ids.add(account.id)
            updated_accounts.append({
                "id": account.id,
                "email": account.email,
            })

        db.commit()

    return {
        "count": len(updated_accounts),
        "accounts": updated_accounts[:20],
    }


class CpaAutomationService:
    """CPA 自动化后台服务"""

    def __init__(self):
        self._scheduler_task: Optional[asyncio.Task] = None
        self._run_lock: Optional[asyncio.Lock] = None
        self._status: Dict[str, Any] = {
            "scheduler_running": False,
            "is_running": False,
            "last_trigger": None,
            "last_run_started_at": None,
            "last_run_finished_at": None,
            "next_run_at": None,
            "last_error": None,
            "last_summary": None,
            "last_batch_id": None,
        }

    def _ensure_lock(self):
        if self._run_lock is None:
            self._run_lock = asyncio.Lock()

    async def start(self):
        """启动后台调度循环"""

        self._ensure_lock()
        if self._scheduler_task and not self._scheduler_task.done():
            return

        self._status["scheduler_running"] = True
        self._scheduler_task = asyncio.create_task(
            self._scheduler_loop(),
            name="cpa-automation-scheduler",
        )
        logger.info("CPA 自动化调度器已启动")

    async def stop(self):
        """停止后台调度循环"""

        task = self._scheduler_task
        self._scheduler_task = None
        self._status["scheduler_running"] = False
        self._status["next_run_at"] = None

        if task:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        logger.info("CPA 自动化调度器已停止")

    async def _scheduler_loop(self):
        while True:
            try:
                await self._scheduler_tick()
                await asyncio.sleep(CPA_AUTOMATION_POLL_SECONDS)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                logger.exception("CPA 自动化调度循环异常: %s", exc)
                self._status["last_error"] = str(exc)
                await asyncio.sleep(CPA_AUTOMATION_POLL_SECONDS)

    async def _scheduler_tick(self):
        with get_db() as db:
            config = load_cpa_automation_config(db)

        if not config.enabled:
            self._status["next_run_at"] = None
            return

        last_started = self._status["last_run_started_at"]
        if last_started:
            self._status["next_run_at"] = last_started + timedelta(seconds=CPA_AUTOMATION_INTERVAL_SECONDS)

        now = _utcnow()
        if not last_started:
            await self.run_once(trigger="scheduler", config=config)
            return

        elapsed_seconds = (now - last_started).total_seconds()
        if elapsed_seconds >= CPA_AUTOMATION_INTERVAL_SECONDS:
            await self.run_once(trigger="scheduler", config=config)

    def get_status(self) -> Dict[str, Any]:
        return {
            "scheduler_running": self._status["scheduler_running"],
            "is_running": self._status["is_running"],
            "last_trigger": self._status["last_trigger"],
            "last_run_started_at": _dt_to_iso(self._status["last_run_started_at"]),
            "last_run_finished_at": _dt_to_iso(self._status["last_run_finished_at"]),
            "next_run_at": _dt_to_iso(self._status["next_run_at"]),
            "last_error": self._status["last_error"],
            "last_summary": self._status["last_summary"],
            "last_batch_id": self._status["last_batch_id"],
            "interval_hours": CPA_AUTOMATION_INTERVAL_SECONDS // 3600,
        }

    async def run_once(
        self,
        trigger: str = "manual",
        config: Optional[CpaAutomationConfig] = None,
    ) -> Dict[str, Any]:
        """执行一次 CPA 清理与补号流程"""

        self._ensure_lock()
        if self._run_lock is None:
            raise RuntimeError("CPA 自动化锁初始化失败")

        if self._run_lock.locked():
            return {
                "success": False,
                "message": "CPA 自动化任务正在执行中，请稍后再试",
                "status": self.get_status(),
            }

        async with self._run_lock:
            if config is None:
                with get_db() as db:
                    config = load_cpa_automation_config(db)

            started_at = _utcnow()
            self._status["is_running"] = True
            self._status["last_trigger"] = trigger
            self._status["last_run_started_at"] = started_at
            self._status["last_run_finished_at"] = None
            self._status["last_error"] = None
            self._status["next_run_at"] = started_at + timedelta(seconds=CPA_AUTOMATION_INTERVAL_SECONDS)

            try:
                summary = await asyncio.to_thread(self._sweep_and_plan_sync, config)
                replenishment = await self._launch_replenishment_if_needed(config, summary["replenish_needed"])
                summary["replenishment"] = replenishment
                self._status["last_summary"] = summary
                if replenishment.get("batch_id"):
                    self._status["last_batch_id"] = replenishment["batch_id"]

                message = "CPA 联动执行完成"
                if replenishment.get("launched"):
                    message = f"{message}，已启动补号任务"

                return {
                    "success": True,
                    "message": message,
                    "summary": summary,
                    "status": self.get_status(),
                }
            except Exception as exc:
                logger.exception("CPA 自动化执行失败: %s", exc)
                self._status["last_error"] = str(exc)
                return {
                    "success": False,
                    "message": f"CPA 联动执行失败: {exc}",
                    "status": self.get_status(),
                }
            finally:
                finished_at = _utcnow()
                self._status["is_running"] = False
                self._status["last_run_finished_at"] = finished_at
                if config.enabled:
                    self._status["next_run_at"] = started_at + timedelta(seconds=CPA_AUTOMATION_INTERVAL_SECONDS)
                else:
                    self._status["next_run_at"] = None

    def _sweep_and_plan_sync(self, config: CpaAutomationConfig) -> Dict[str, Any]:
        if not config.cpa_service_id:
            raise ValueError("请先选择要联动的 CPA 服务")

        with get_db() as db:
            service = crud.get_cpa_service_by_id(db, config.cpa_service_id)

        if not service:
            raise ValueError("所选 CPA 服务不存在")

        if config.enabled and not service.enabled:
            raise ValueError("所选 CPA 服务已禁用，请先启用后再开启自动联动")

        remote_files_before = _fetch_auth_files(service)
        scan_result = _scan_invalid_auth_files(service, remote_files_before)
        invalid_items = scan_result["invalid_items"]

        deleted_names = []
        delete_errors = []
        for item in invalid_items:
            name = item.get("name")
            if not name:
                continue
            success, message = _delete_auth_file(service, name)
            if success:
                deleted_names.append(name)
            else:
                delete_errors.append(message)

        local_update = {"count": 0, "accounts": []}
        if config.sync_local_invalid and invalid_items:
            local_update = _mark_local_accounts_invalid(service, invalid_items)

        remote_files_after = _fetch_auth_files(service)
        remaining_codex_count = sum(1 for item in remote_files_after if _get_item_type(item) == "codex")
        replenish_needed = 0
        if config.replenish_enabled and config.target_count > 0:
            replenish_needed = max(config.target_count - remaining_codex_count, 0)

        return {
            "service_id": service.id,
            "service_name": service.name,
            "remote_total_before": len(remote_files_before),
            "remote_codex_before": scan_result["remote_codex_count"],
            "invalid_401_count": len(invalid_items),
            "deleted_count": len(deleted_names),
            "delete_failed_count": len(delete_errors),
            "remaining_codex_count": remaining_codex_count,
            "target_count": config.target_count,
            "replenish_needed": replenish_needed,
            "local_invalidated_count": local_update["count"],
            "local_invalidated_accounts": local_update["accounts"],
            "invalid_remote_names": [item.get("name") for item in invalid_items[:20] if item.get("name")],
            "probe_errors": scan_result["errors"][:20],
            "delete_errors": delete_errors[:20],
        }

    async def _launch_replenishment_if_needed(
        self,
        config: CpaAutomationConfig,
        replenish_needed: int,
    ) -> Dict[str, Any]:
        if not config.replenish_enabled:
            return {
                "requested": replenish_needed,
                "launched": False,
                "reason": "自动补号已关闭",
            }

        if replenish_needed <= 0:
            return {
                "requested": 0,
                "launched": False,
                "reason": "当前 CPA 账号数已达到目标值",
            }

        from ..web.routes.registration import (
            BatchRegistrationRequest,
            batch_tasks,
            launch_batch_registration,
        )

        last_batch_id = self._status.get("last_batch_id")
        if last_batch_id:
            batch = batch_tasks.get(last_batch_id)
            if batch and not batch.get("finished"):
                return {
                    "requested": replenish_needed,
                    "launched": False,
                    "batch_id": last_batch_id,
                    "reason": "上一轮自动补号任务仍在运行，本次先跳过重复补号",
                }

        proxy_value = config.proxy or None
        if config.proxy_id is not None:
            with get_db() as db:
                proxy_model = crud.get_proxy_by_id(db, config.proxy_id)
                if not proxy_model:
                    return {
                        "requested": replenish_needed,
                        "launched": False,
                        "reason": "所选代理不存在，无法启动自动补号",
                    }
                proxy_value = proxy_model.proxy_url

        request = BatchRegistrationRequest(
            count=replenish_needed,
            email_service_type=config.email_service_type,
            proxy=proxy_value,
            email_service_id=config.email_service_id,
            interval_min=config.interval_min,
            interval_max=config.interval_max,
            concurrency=config.concurrency,
            mode=config.mode,
            auto_upload_cpa=True,
            cpa_service_ids=[config.cpa_service_id],
        )
        response = await launch_batch_registration(request)

        return {
            "requested": replenish_needed,
            "launched": True,
            "batch_id": response.batch_id,
            "count": response.count,
            "reason": "已启动自动补号批次",
        }


cpa_automation_service = CpaAutomationService()
