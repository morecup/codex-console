/**
 * 设置页面 JavaScript
 * 使用 utils.js 中的工具库
 */

// DOM 元素
const elements = {
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    registrationForm: document.getElementById('registration-settings-form'),
    backupBtn: document.getElementById('backup-btn'),
    cleanupBtn: document.getElementById('cleanup-btn'),
    addEmailServiceBtn: document.getElementById('add-email-service-btn'),
    addServiceModal: document.getElementById('add-service-modal'),
    addServiceForm: document.getElementById('add-service-form'),
    closeServiceModal: document.getElementById('close-service-modal'),
    cancelAddService: document.getElementById('cancel-add-service'),
    serviceType: document.getElementById('service-type'),
    serviceConfigFields: document.getElementById('service-config-fields'),
    emailServicesTable: document.getElementById('email-services-table'),
    // Outlook 导入
    toggleImportBtn: document.getElementById('toggle-import-btn'),
    outlookImportBody: document.getElementById('outlook-import-body'),
    outlookImportBtn: document.getElementById('outlook-import-btn'),
    clearImportBtn: document.getElementById('clear-import-btn'),
    outlookImportData: document.getElementById('outlook-import-data'),
    importResult: document.getElementById('import-result'),
    // 批量操作
    selectAllServices: document.getElementById('select-all-services'),
    // 代理列表
    proxiesTable: document.getElementById('proxies-table'),
    addProxyBtn: document.getElementById('add-proxy-btn'),
    testAllProxiesBtn: document.getElementById('test-all-proxies-btn'),
    addProxyModal: document.getElementById('add-proxy-modal'),
    proxyItemForm: document.getElementById('proxy-item-form'),
    closeProxyModal: document.getElementById('close-proxy-modal'),
    cancelProxyBtn: document.getElementById('cancel-proxy-btn'),
    proxyModalTitle: document.getElementById('proxy-modal-title'),
    // 动态代理设置
    dynamicProxyForm: document.getElementById('dynamic-proxy-form'),
    testDynamicProxyBtn: document.getElementById('test-dynamic-proxy-btn'),
    // CPA 服务管理
    addCpaServiceBtn: document.getElementById('add-cpa-service-btn'),
    cpaServicesTable: document.getElementById('cpa-services-table'),
    cpaServiceEditModal: document.getElementById('cpa-service-edit-modal'),
    closeCpaServiceModal: document.getElementById('close-cpa-service-modal'),
    cancelCpaServiceBtn: document.getElementById('cancel-cpa-service-btn'),
    cpaServiceForm: document.getElementById('cpa-service-form'),
    cpaServiceModalTitle: document.getElementById('cpa-service-modal-title'),
    testCpaServiceBtn: document.getElementById('test-cpa-service-btn'),
    // Sub2API 服务管理
    addSub2ApiServiceBtn: document.getElementById('add-sub2api-service-btn'),
    sub2ApiServicesTable: document.getElementById('sub2api-services-table'),
    sub2ApiServiceEditModal: document.getElementById('sub2api-service-edit-modal'),
    closeSub2ApiServiceModal: document.getElementById('close-sub2api-service-modal'),
    cancelSub2ApiServiceBtn: document.getElementById('cancel-sub2api-service-btn'),
    sub2ApiServiceForm: document.getElementById('sub2api-service-form'),
    sub2ApiServiceModalTitle: document.getElementById('sub2api-service-modal-title'),
    testSub2ApiServiceBtn: document.getElementById('test-sub2api-service-btn'),
    // Team Manager 服务管理
    addTmServiceBtn: document.getElementById('add-tm-service-btn'),
    tmServicesTable: document.getElementById('tm-services-table'),
    tmServiceEditModal: document.getElementById('tm-service-edit-modal'),
    closeTmServiceModal: document.getElementById('close-tm-service-modal'),
    cancelTmServiceBtn: document.getElementById('cancel-tm-service-btn'),
    tmServiceForm: document.getElementById('tm-service-form'),
    tmServiceModalTitle: document.getElementById('tm-service-modal-title'),
    testTmServiceBtn: document.getElementById('test-tm-service-btn'),
    // 验证码设置
    emailCodeForm: document.getElementById('email-code-form'),
    // Outlook 设置
    outlookSettingsForm: document.getElementById('outlook-settings-form'),
    // Web UI 访问控制
    webuiSettingsForm: document.getElementById('webui-settings-form'),
    // CPA 联动
    cpaAutomationForm: document.getElementById('cpa-automation-form'),
    cpaAutomationRunBtn: document.getElementById('cpa-automation-run-btn'),
    cpaAutomationRefreshBtn: document.getElementById('cpa-automation-refresh-btn'),
    cpaAutomationEmailServiceType: document.getElementById('cpa-automation-email-service-type'),
    cpaAutomationBatchMonitor: document.getElementById('cpa-automation-batch-monitor'),
    cpaAutomationBatchState: document.getElementById('cpa-automation-batch-state'),
    cpaAutomationBatchId: document.getElementById('cpa-automation-batch-id'),
    cpaAutomationBatchNote: document.getElementById('cpa-automation-batch-note'),
    cpaAutomationBatchProgress: document.getElementById('cpa-automation-batch-progress'),
    cpaAutomationBatchSuccess: document.getElementById('cpa-automation-batch-success'),
    cpaAutomationBatchFailed: document.getElementById('cpa-automation-batch-failed'),
    cpaAutomationBatchRemaining: document.getElementById('cpa-automation-batch-remaining'),
    cpaAutomationBatchProgressBar: document.getElementById('cpa-automation-batch-progress-bar'),
    cpaAutomationBatchProgressText: document.getElementById('cpa-automation-batch-progress-text'),
    cpaAutomationBatchLogs: document.getElementById('cpa-automation-batch-logs')
};

// 选中的服务 ID
let selectedServiceIds = new Set();
const cpaAutomationState = {
    cpaServices: [],
    emailServices: [],
    serviceTypes: [],
    proxies: [],
    selectedProxyId: '',
    legacyProxy: '',
    batchPollingTimer: null,
    batchPollingId: '',
    batchDisplayId: '',
    batchLastLogIndex: 0
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadSettings();
    loadCpaAutomationSection();
    loadEmailServices();
    loadDatabaseInfo();
    loadProxies();
    loadCpaServices();
    loadSub2ApiServices();
    loadTmServices();
    initEventListeners();
});

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
});

// 初始化标签页
function initTabs() {
    elements.tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            elements.tabs.forEach(b => b.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tab}-tab`).classList.add('active');
        });
    });
}

// 事件监听
function initEventListeners() {
    // 注册配置表单
    if (elements.registrationForm) {
        elements.registrationForm.addEventListener('submit', handleSaveRegistration);
    }

    // 备份数据库
    if (elements.backupBtn) {
        elements.backupBtn.addEventListener('click', handleBackup);
    }

    // 清理数据
    if (elements.cleanupBtn) {
        elements.cleanupBtn.addEventListener('click', handleCleanup);
    }

    // 添加邮箱服务
    if (elements.addEmailServiceBtn) {
        elements.addEmailServiceBtn.addEventListener('click', () => {
            elements.addServiceModal.classList.add('active');
            loadServiceConfigFields(elements.serviceType.value);
        });
    }

    if (elements.closeServiceModal) {
        elements.closeServiceModal.addEventListener('click', () => {
            elements.addServiceModal.classList.remove('active');
        });
    }

    if (elements.cancelAddService) {
        elements.cancelAddService.addEventListener('click', () => {
            elements.addServiceModal.classList.remove('active');
        });
    }

    if (elements.addServiceModal) {
        elements.addServiceModal.addEventListener('click', (e) => {
            if (e.target === elements.addServiceModal) {
                elements.addServiceModal.classList.remove('active');
            }
        });
    }

    // 服务类型切换
    if (elements.serviceType) {
        elements.serviceType.addEventListener('change', (e) => {
            loadServiceConfigFields(e.target.value);
        });
    }

    // 添加服务表单
    if (elements.addServiceForm) {
        elements.addServiceForm.addEventListener('submit', handleAddService);
    }

    // Outlook 批量导入展开/折叠
    if (elements.toggleImportBtn) {
        elements.toggleImportBtn.addEventListener('click', () => {
            const isHidden = elements.outlookImportBody.style.display === 'none';
            elements.outlookImportBody.style.display = isHidden ? 'block' : 'none';
            elements.toggleImportBtn.textContent = isHidden ? '收起' : '展开';
        });
    }

    // Outlook 批量导入
    if (elements.outlookImportBtn) {
        elements.outlookImportBtn.addEventListener('click', handleOutlookBatchImport);
    }

    // 清空导入数据
    if (elements.clearImportBtn) {
        elements.clearImportBtn.addEventListener('click', () => {
            elements.outlookImportData.value = '';
            elements.importResult.style.display = 'none';
        });
    }

    // 全选/取消全选
    if (elements.selectAllServices) {
        elements.selectAllServices.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.service-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateSelectedServices();
        });
    }

    // 代理列表相关
    if (elements.addProxyBtn) {
        elements.addProxyBtn.addEventListener('click', () => openProxyModal());
    }

    if (elements.testAllProxiesBtn) {
        elements.testAllProxiesBtn.addEventListener('click', handleTestAllProxies);
    }

    if (elements.closeProxyModal) {
        elements.closeProxyModal.addEventListener('click', closeProxyModal);
    }

    if (elements.cancelProxyBtn) {
        elements.cancelProxyBtn.addEventListener('click', closeProxyModal);
    }

    if (elements.addProxyModal) {
        elements.addProxyModal.addEventListener('click', (e) => {
            if (e.target === elements.addProxyModal) {
                closeProxyModal();
            }
        });
    }

    if (elements.proxyItemForm) {
        elements.proxyItemForm.addEventListener('submit', handleSaveProxyItem);
    }

    // 动态代理设置
    if (elements.dynamicProxyForm) {
        elements.dynamicProxyForm.addEventListener('submit', handleSaveDynamicProxy);
    }
    if (elements.testDynamicProxyBtn) {
        elements.testDynamicProxyBtn.addEventListener('click', handleTestDynamicProxy);
    }

    // 验证码设置
    if (elements.emailCodeForm) {
        elements.emailCodeForm.addEventListener('submit', handleSaveEmailCode);
    }

    // Outlook 设置
    if (elements.outlookSettingsForm) {
        elements.outlookSettingsForm.addEventListener('submit', handleSaveOutlookSettings);
    }

    if (elements.webuiSettingsForm) {
        elements.webuiSettingsForm.addEventListener('submit', handleSaveWebuiSettings);
    }
    if (elements.cpaAutomationForm) {
        elements.cpaAutomationForm.addEventListener('submit', handleSaveCpaAutomation);
    }
    if (elements.cpaAutomationRunBtn) {
        elements.cpaAutomationRunBtn.addEventListener('click', handleRunCpaAutomation);
    }
    if (elements.cpaAutomationRefreshBtn) {
        elements.cpaAutomationRefreshBtn.addEventListener('click', loadCpaAutomationSettings);
    }
    if (elements.cpaAutomationEmailServiceType) {
        elements.cpaAutomationEmailServiceType.addEventListener('change', () => {
            updateCpaAutomationEmailServiceOptions();
        });
    }
    // Team Manager 服务管理
    if (elements.addTmServiceBtn) {
        elements.addTmServiceBtn.addEventListener('click', () => openTmServiceModal());
    }
    if (elements.closeTmServiceModal) {
        elements.closeTmServiceModal.addEventListener('click', closeTmServiceModal);
    }
    if (elements.cancelTmServiceBtn) {
        elements.cancelTmServiceBtn.addEventListener('click', closeTmServiceModal);
    }
    if (elements.tmServiceEditModal) {
        elements.tmServiceEditModal.addEventListener('click', (e) => {
            if (e.target === elements.tmServiceEditModal) closeTmServiceModal();
        });
    }
    if (elements.tmServiceForm) {
        elements.tmServiceForm.addEventListener('submit', handleSaveTmService);
    }
    if (elements.testTmServiceBtn) {
        elements.testTmServiceBtn.addEventListener('click', handleTestTmService);
    }

    // CPA 服务管理
    if (elements.addCpaServiceBtn) {
        elements.addCpaServiceBtn.addEventListener('click', () => openCpaServiceModal());
    }
    if (elements.closeCpaServiceModal) {
        elements.closeCpaServiceModal.addEventListener('click', closeCpaServiceModal);
    }
    if (elements.cancelCpaServiceBtn) {
        elements.cancelCpaServiceBtn.addEventListener('click', closeCpaServiceModal);
    }
    if (elements.cpaServiceEditModal) {
        elements.cpaServiceEditModal.addEventListener('click', (e) => {
            if (e.target === elements.cpaServiceEditModal) closeCpaServiceModal();
        });
    }
    if (elements.cpaServiceForm) {
        elements.cpaServiceForm.addEventListener('submit', handleSaveCpaService);
    }
    if (elements.testCpaServiceBtn) {
        elements.testCpaServiceBtn.addEventListener('click', handleTestCpaService);
    }

    // Sub2API 服务管理
    if (elements.addSub2ApiServiceBtn) {
        elements.addSub2ApiServiceBtn.addEventListener('click', () => openSub2ApiServiceModal());
    }
    if (elements.closeSub2ApiServiceModal) {
        elements.closeSub2ApiServiceModal.addEventListener('click', closeSub2ApiServiceModal);
    }
    if (elements.cancelSub2ApiServiceBtn) {
        elements.cancelSub2ApiServiceBtn.addEventListener('click', closeSub2ApiServiceModal);
    }
    if (elements.sub2ApiServiceEditModal) {
        elements.sub2ApiServiceEditModal.addEventListener('click', (e) => {
            if (e.target === elements.sub2ApiServiceEditModal) closeSub2ApiServiceModal();
        });
    }
    if (elements.sub2ApiServiceForm) {
        elements.sub2ApiServiceForm.addEventListener('submit', handleSaveSub2ApiService);
    }
    if (elements.testSub2ApiServiceBtn) {
        elements.testSub2ApiServiceBtn.addEventListener('click', handleTestSub2ApiService);
    }
}

// 加载设置
async function loadSettings() {
    try {
        const data = await api.get('/settings');

        // 动态代理设置
        document.getElementById('dynamic-proxy-enabled').checked = data.proxy?.dynamic_enabled || false;
        document.getElementById('dynamic-proxy-api-url').value = data.proxy?.dynamic_api_url || '';
        document.getElementById('dynamic-proxy-api-key-header').value = data.proxy?.dynamic_api_key_header || 'X-API-Key';
        document.getElementById('dynamic-proxy-result-field').value = data.proxy?.dynamic_result_field || '';

        // 注册配置
        document.getElementById('max-retries').value = data.registration?.max_retries || 3;
        document.getElementById('timeout').value = data.registration?.timeout || 120;
        document.getElementById('password-length').value = data.registration?.default_password_length || 12;
        document.getElementById('sleep-min').value = data.registration?.sleep_min || 5;
        document.getElementById('sleep-max').value = data.registration?.sleep_max || 30;

        // 验证码等待配置
        if (data.email_code) {
            document.getElementById('email-code-timeout').value = data.email_code.timeout || 120;
            document.getElementById('email-code-poll-interval').value = data.email_code.poll_interval || 3;
        }

        // 加载 Outlook 设置
        loadOutlookSettings();

        // Web UI 访问密码提示
        if (data.webui?.has_access_password) {
            const input = document.getElementById('webui-access-password');
            if (input) {
                input.value = '';
                input.placeholder = '已配置，留空保持不变';
            }
        }

    } catch (error) {
        console.error('加载设置失败:', error);
        toast.error('加载设置失败');
    }
}

async function loadCpaAutomationSection() {
    await loadCpaAutomationOptions();
    await loadCpaAutomationSettings();
}

async function loadCpaAutomationOptions() {
    if (!elements.cpaAutomationForm) return;

    try {
        const currentServiceId = document.getElementById('cpa-automation-service-id')?.value || '';
        const currentType = document.getElementById('cpa-automation-email-service-type')?.value || 'tempmail';
        const currentEmailServiceId = document.getElementById('cpa-automation-email-service-id')?.value || '';
        const currentProxyId = document.getElementById('cpa-automation-proxy')?.value || cpaAutomationState.selectedProxyId || '';
        const [cpaServices, emailServices, serviceTypes] = await Promise.all([
            api.get('/cpa-services'),
            api.get('/email-services?enabled_only=true'),
            api.get('/email-services/types')
        ]);

        cpaAutomationState.cpaServices = Array.isArray(cpaServices) ? cpaServices : [];
        cpaAutomationState.emailServices = emailServices?.services || [];
        cpaAutomationState.serviceTypes = serviceTypes?.types || [];

        renderCpaAutomationServiceOptions(currentServiceId);
        renderCpaAutomationTypeOptions(currentType);
        updateCpaAutomationEmailServiceOptions(currentEmailServiceId);
        renderCpaAutomationProxyOptions(currentProxyId, cpaAutomationState.legacyProxy);
    } catch (error) {
        console.error('加载 CPA 联动选项失败:', error);
        toast.error('加载 CPA 联动选项失败');
    }
}

async function loadCpaAutomationSettings() {
    if (!elements.cpaAutomationForm) return;

    try {
        const data = await api.get('/settings/cpa-automation');
        applyCpaAutomationConfig(data.config || {});
        renderCpaAutomationStatus(data.status || {}, data.config || {});
        await syncCpaAutomationBatchMonitor(data.status || {});
    } catch (error) {
        console.error('加载 CPA 联动配置失败:', error);
        toast.error('加载 CPA 联动配置失败');
    }
}

function renderCpaAutomationServiceOptions(selectedValue = '') {
    const select = document.getElementById('cpa-automation-service-id');
    if (!select) return;

    const options = [
        '<option value="">请选择要维护的 CPA 服务</option>',
        ...cpaAutomationState.cpaServices.map(service => {
            const disabledText = service.enabled ? '' : '（已禁用）';
            const selected = String(service.id) === String(selectedValue) ? 'selected' : '';
            return `<option value="${service.id}" ${selected}>${escapeHtml(service.name)}${disabledText}</option>`;
        })
    ];
    select.innerHTML = options.join('');
}

function renderCpaAutomationTypeOptions(selectedValue = 'tempmail') {
    const select = document.getElementById('cpa-automation-email-service-type');
    if (!select) return;

    const allowedTypes = new Set(['tempmail', 'outlook', 'moe_mail', 'temp_mail', 'duck_mail', 'freemail', 'imap_mail']);
    const options = cpaAutomationState.serviceTypes
        .filter(type => allowedTypes.has(type.value))
        .map(type => {
            const selected = type.value === selectedValue ? 'selected' : '';
            return `<option value="${type.value}" ${selected}>${escapeHtml(type.label)}</option>`;
        });

    if (options.length === 0) {
        options.push('<option value="tempmail">Tempmail.lol</option>');
    }

    select.innerHTML = options.join('');
}

function updateCpaAutomationEmailServiceOptions(selectedValue = '') {
    const typeSelect = document.getElementById('cpa-automation-email-service-type');
    const serviceSelect = document.getElementById('cpa-automation-email-service-id');
    const hint = document.getElementById('cpa-automation-email-service-hint');
    if (!typeSelect || !serviceSelect) return;

    const selectedType = typeSelect.value || 'tempmail';

    if (selectedType === 'tempmail') {
        serviceSelect.innerHTML = '<option value="">Tempmail 无需额外配置</option>';
        serviceSelect.disabled = true;
        if (hint) {
            hint.textContent = 'Tempmail 模式不需要绑定具体邮箱服务';
        }
        return;
    }

    const filteredServices = cpaAutomationState.emailServices.filter(service => service.service_type === selectedType);
    const options = ['<option value="">自动选择可用服务</option>'];
    filteredServices.forEach(service => {
        const selected = String(service.id) === String(selectedValue) ? 'selected' : '';
        options.push(`<option value="${service.id}" ${selected}>${escapeHtml(service.name)}</option>`);
    });

    serviceSelect.innerHTML = options.join('');
    serviceSelect.disabled = false;

    if (hint) {
        hint.textContent = filteredServices.length > 0
            ? '留空时按现有注册逻辑自动选择该类型的可用服务'
            : '当前类型没有启用中的邮箱服务，留空时将交给后端自动尝试';
    }
}

function applyCpaAutomationConfig(config) {
    cpaAutomationState.selectedProxyId = config.proxy_id ? String(config.proxy_id) : '';
    cpaAutomationState.legacyProxy = config.proxy || '';
    document.getElementById('cpa-automation-enabled').checked = !!config.enabled;
    renderCpaAutomationServiceOptions(config.cpa_service_id || '');
    document.getElementById('cpa-automation-target-count').value = config.target_count ?? 0;
    renderCpaAutomationTypeOptions(config.email_service_type || 'tempmail');
    updateCpaAutomationEmailServiceOptions(config.email_service_id || '');
    document.getElementById('cpa-automation-concurrency').value = config.concurrency ?? 1;
    document.getElementById('cpa-automation-mode').value = config.mode || 'pipeline';
    renderCpaAutomationProxyOptions(cpaAutomationState.selectedProxyId, cpaAutomationState.legacyProxy);
    document.getElementById('cpa-automation-interval-min').value = config.interval_min ?? 5;
    document.getElementById('cpa-automation-interval-max').value = config.interval_max ?? 30;
    document.getElementById('cpa-automation-replenish-enabled').checked = config.replenish_enabled !== false;
    document.getElementById('cpa-automation-sync-local-invalid').checked = config.sync_local_invalid !== false;
}

function renderCpaAutomationProxyOptions(selectedValue = '', legacyProxy = '') {
    const select = document.getElementById('cpa-automation-proxy');
    if (!select) return;
    cpaAutomationState.selectedProxyId = selectedValue ? String(selectedValue) : '';

    const options = ['<option value="">留空使用系统代理策略</option>'];
    cpaAutomationState.proxies.forEach(proxy => {
        const label = `${escapeHtml(proxy.name)} (${proxy.type.toUpperCase()} ${escapeHtml(proxy.host)}:${proxy.port})`;
        const selected = String(proxy.id) === String(selectedValue) ? 'selected' : '';
        options.push(`<option value="${proxy.id}" ${selected}>${label}</option>`);
    });

    if (!selectedValue && legacyProxy) {
        options.push('<option value="" selected>已保存旧版自定义代理，重新保存后将改为系统策略</option>');
    }

    select.innerHTML = options.join('');
}

function renderCpaAutomationStatus(status = {}, config = {}) {
    const monitorBatchId = getCpaAutomationMonitorBatchId(status);
    document.getElementById('cpa-automation-status-scheduler').textContent = config.enabled
        ? (status.scheduler_running ? '已启用' : '等待启动')
        : '未启用';
    document.getElementById('cpa-automation-status-running').textContent = status.is_running ? '执行中' : '空闲';
    document.getElementById('cpa-automation-status-last-run').textContent = format.date(status.last_run_started_at);
    document.getElementById('cpa-automation-status-next-run').textContent = config.enabled
        ? format.date(status.next_run_at)
        : '已停用';
    document.getElementById('cpa-automation-status-trigger').textContent = status.last_trigger || '-';
    document.getElementById('cpa-automation-status-batch').textContent = monitorBatchId || status.last_batch_id || '-';

    const summary = document.getElementById('cpa-automation-summary');
    if (!summary) return;

    const lastSummary = status.last_summary;
    if (!lastSummary) {
        summary.classList.add('empty');
        summary.textContent = '尚未执行联动任务';
        return;
    }

    summary.classList.remove('empty');

    const replenishment = lastSummary.replenishment || {};
    const replenishText = replenishment.launched
        ? `已启动补号 ${replenishment.count || replenishment.requested || 0} 个`
        : (replenishment.reason || '本轮未触发补号');

    const errorLines = [];
    if (status.last_error) {
        errorLines.push(`最近错误：${status.last_error}`);
    }
    if ((lastSummary.probe_errors || []).length > 0) {
        errorLines.push(`探测异常 ${lastSummary.probe_errors.length} 条`);
    }
    if ((lastSummary.delete_errors || []).length > 0) {
        errorLines.push(`删除失败 ${lastSummary.delete_errors.length} 条`);
    }

    summary.innerHTML = `
        <div class="automation-summary-title">最近一次执行结果</div>
        <div class="automation-summary-text">
            远端剩余 <strong>${format.number(lastSummary.remaining_codex_count || 0)}</strong> 个 Codex 账号，
            识别 401 <strong>${format.number(lastSummary.invalid_401_count || 0)}</strong> 个，
            删除成功 <strong>${format.number(lastSummary.deleted_count || 0)}</strong> 个，
            本地同步失效 <strong>${format.number(lastSummary.local_invalidated_count || 0)}</strong> 个。
        </div>
        <div class="automation-summary-text" style="margin-top:8px;">
            目标值 <strong>${format.number(lastSummary.target_count || 0)}</strong>，
            需补号 <strong>${format.number(lastSummary.replenish_needed || 0)}</strong>，
            ${escapeHtml(replenishText)}
        </div>
        <div class="automation-summary-badges">
            <span class="automation-summary-badge">服务 <strong>${escapeHtml(lastSummary.service_name || '-')}</strong></span>
            <span class="automation-summary-badge">401 <strong>${format.number(lastSummary.invalid_401_count || 0)}</strong></span>
            <span class="automation-summary-badge">已删 <strong>${format.number(lastSummary.deleted_count || 0)}</strong></span>
            <span class="automation-summary-badge">剩余 <strong>${format.number(lastSummary.remaining_codex_count || 0)}</strong></span>
            <span class="automation-summary-badge">补号 <strong>${format.number(lastSummary.replenish_needed || 0)}</strong></span>
        </div>
        ${errorLines.length > 0 ? `<div class="automation-summary-text" style="margin-top:8px;color:var(--danger-color);">${escapeHtml(errorLines.join('；'))}</div>` : ''}
    `;
}

function getCpaAutomationMonitorBatchId(status = {}) {
    const replenishment = status.last_summary?.replenishment || null;
    if (replenishment) {
        return replenishment.batch_id || '';
    }
    return status.last_batch_id || '';
}

function getCpaAutomationBatchStatusMeta(status) {
    const mapping = {
        running: { text: '执行中', className: 'running' },
        completed: { text: '已完成', className: 'completed' },
        failed: { text: '失败', className: 'failed' },
        cancelled: { text: '已取消', className: 'disabled' },
        cancelling: { text: '取消中', className: 'warning' },
        pending: { text: '等待中', className: 'pending' }
    };

    return mapping[status] || { text: status || '未启动', className: 'pending' };
}

function inferCpaAutomationLogType(log) {
    if (typeof log !== 'string') return 'info';

    const lowerLog = log.toLowerCase();
    if (lowerLog.includes('error') || lowerLog.includes('失败') || lowerLog.includes('错误')) {
        return 'error';
    }
    if (lowerLog.includes('warning') || lowerLog.includes('警告') || lowerLog.includes('取消')) {
        return 'warning';
    }
    if (lowerLog.includes('success') || lowerLog.includes('成功') || lowerLog.includes('完成')) {
        return 'success';
    }
    return 'info';
}

function stopCpaAutomationBatchPolling({ clearDisplay = false } = {}) {
    if (cpaAutomationState.batchPollingTimer) {
        clearInterval(cpaAutomationState.batchPollingTimer);
        cpaAutomationState.batchPollingTimer = null;
    }
    cpaAutomationState.batchPollingId = '';

    if (clearDisplay) {
        cpaAutomationState.batchDisplayId = '';
        cpaAutomationState.batchLastLogIndex = 0;
    }
}

function resetCpaAutomationBatchLogView(batchId) {
    if (!elements.cpaAutomationBatchLogs) return;

    if (cpaAutomationState.batchDisplayId !== batchId) {
        cpaAutomationState.batchDisplayId = batchId;
        cpaAutomationState.batchLastLogIndex = 0;
        elements.cpaAutomationBatchLogs.innerHTML = '';
    }
}

function renderCpaAutomationBatchLogs(batchId, logs = []) {
    if (!elements.cpaAutomationBatchLogs) return;

    resetCpaAutomationBatchLogView(batchId);

    const newLogs = logs.slice(cpaAutomationState.batchLastLogIndex);
    if (newLogs.length === 0) {
        if (!elements.cpaAutomationBatchLogs.innerHTML.trim()) {
            elements.cpaAutomationBatchLogs.innerHTML = '<div class="log-line info">该补号批次暂时还没有输出日志</div>';
        }
        return;
    }

    newLogs.forEach(message => {
        const line = document.createElement('div');
        line.className = `log-line ${inferCpaAutomationLogType(message)}`;
        line.textContent = message;
        elements.cpaAutomationBatchLogs.appendChild(line);
    });

    cpaAutomationState.batchLastLogIndex = logs.length;
    elements.cpaAutomationBatchLogs.scrollTop = elements.cpaAutomationBatchLogs.scrollHeight;
}

function renderEmptyCpaAutomationBatchMonitor(status = {}) {
    if (!elements.cpaAutomationBatchMonitor) return;

    stopCpaAutomationBatchPolling({ clearDisplay: true });

    const replenishment = status.last_summary?.replenishment || {};
    const note = replenishment.reason || (status.last_summary ? '最近一次联动未触发补号任务' : '最近一次联动尚未触发补号任务');

    elements.cpaAutomationBatchState.textContent = '未启动';
    elements.cpaAutomationBatchState.className = 'status-badge pending';
    elements.cpaAutomationBatchId.textContent = '-';
    elements.cpaAutomationBatchNote.textContent = note;
    elements.cpaAutomationBatchProgress.textContent = '-';
    elements.cpaAutomationBatchSuccess.textContent = '0';
    elements.cpaAutomationBatchFailed.textContent = '0';
    elements.cpaAutomationBatchRemaining.textContent = '0';
    elements.cpaAutomationBatchProgressBar.style.width = '0%';
    elements.cpaAutomationBatchProgressBar.classList.remove('indeterminate');
    elements.cpaAutomationBatchProgressText.textContent = '0/0 (0%)';
    elements.cpaAutomationBatchLogs.innerHTML = '<div class="log-line info">最近一次补号日志会显示在这里</div>';
}

function renderCpaAutomationBatchMonitor(batch, status = {}) {
    if (!elements.cpaAutomationBatchMonitor || !batch) return;

    const batchId = batch.batch_id || '';
    const total = Number(batch.total || 0);
    const completed = Number(batch.completed || 0);
    const success = Number(batch.success || 0);
    const failed = Number(batch.failed || 0);
    const remaining = Math.max(total - completed, 0);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const statusMeta = getCpaAutomationBatchStatusMeta(batch.status);
    const replenishment = status.last_summary?.replenishment || {};

    let note = replenishment.reason || '正在跟踪最近一次补号批次';
    if (batch.status === 'running') {
        note = `已发起补号 ${format.number(replenishment.count || replenishment.requested || total)} 个，正在跟踪执行结果`;
    } else if (batch.status === 'completed') {
        note = failed > 0
            ? `本轮补号已结束，成功 ${success} 个、失败 ${failed} 个`
            : `本轮补号已顺利完成，共成功补入 ${success} 个账号`;
    } else if (batch.status === 'failed') {
        note = '补号批次执行失败，请查看下方日志定位原因';
    } else if (batch.status === 'cancelled' || batch.status === 'cancelling') {
        note = '补号批次已被取消，未完成的缺口会等下一轮巡检重新计算';
    }

    elements.cpaAutomationBatchState.textContent = statusMeta.text;
    elements.cpaAutomationBatchState.className = `status-badge ${statusMeta.className}`;
    elements.cpaAutomationBatchId.textContent = batchId || '-';
    elements.cpaAutomationBatchNote.textContent = note;
    elements.cpaAutomationBatchProgress.textContent = total > 0 ? `${completed}/${total}` : '-';
    elements.cpaAutomationBatchSuccess.textContent = format.number(success);
    elements.cpaAutomationBatchFailed.textContent = format.number(failed);
    elements.cpaAutomationBatchRemaining.textContent = format.number(remaining);
    elements.cpaAutomationBatchProgressBar.style.width = `${progress}%`;
    elements.cpaAutomationBatchProgressBar.classList.remove('indeterminate');
    elements.cpaAutomationBatchProgressText.textContent = `${completed}/${total} (${progress}%)`;

    renderCpaAutomationBatchLogs(batchId, batch.logs || []);

    if (!batch.finished && !['completed', 'failed', 'cancelled'].includes(batch.status)) {
        startCpaAutomationBatchPolling(batchId);
    } else {
        stopCpaAutomationBatchPolling();
    }
}

async function fetchAndRenderCpaAutomationBatch(batchId, status = {}) {
    if (!batchId) {
        renderEmptyCpaAutomationBatchMonitor(status);
        return null;
    }

    try {
        const batch = await api.get(`/registration/batch/${batchId}`);
        renderCpaAutomationBatchMonitor(batch, status);
        return batch;
    } catch (error) {
        console.error('加载 CPA 补号批次状态失败:', error);
        stopCpaAutomationBatchPolling({ clearDisplay: true });
        elements.cpaAutomationBatchState.textContent = '未知';
        elements.cpaAutomationBatchState.className = 'status-badge warning';
        elements.cpaAutomationBatchId.textContent = batchId;
        elements.cpaAutomationBatchNote.textContent = '补号批次状态已不可用，可能已被清理或服务刚重启';
        elements.cpaAutomationBatchProgress.textContent = '-';
        elements.cpaAutomationBatchProgressBar.style.width = '0%';
        elements.cpaAutomationBatchProgressBar.classList.remove('indeterminate');
        elements.cpaAutomationBatchProgressText.textContent = '0/0 (0%)';
        elements.cpaAutomationBatchLogs.innerHTML = `<div class="log-line warning">${escapeHtml(error.message || '无法读取补号批次状态')}</div>`;
        return null;
    }
}

function startCpaAutomationBatchPolling(batchId) {
    if (!batchId) return;
    if (cpaAutomationState.batchPollingTimer && cpaAutomationState.batchPollingId === batchId) {
        return;
    }

    stopCpaAutomationBatchPolling();
    cpaAutomationState.batchPollingId = batchId;
    cpaAutomationState.batchPollingTimer = window.setInterval(() => {
        fetchAndRenderCpaAutomationBatch(batchId).catch(error => {
            console.error('轮询 CPA 补号批次状态失败:', error);
        });
    }, 2000);
}

async function syncCpaAutomationBatchMonitor(status = {}) {
    const batchId = getCpaAutomationMonitorBatchId(status);
    if (!batchId) {
        renderEmptyCpaAutomationBatchMonitor(status);
        return;
    }

    await fetchAndRenderCpaAutomationBatch(batchId, status);
}

async function handleSaveCpaAutomation(e) {
    e.preventDefault();

    const payload = {
        enabled: document.getElementById('cpa-automation-enabled').checked,
        cpa_service_id: parseOptionalInt(document.getElementById('cpa-automation-service-id').value),
        target_count: parseInt(document.getElementById('cpa-automation-target-count').value || '0', 10),
        email_service_type: document.getElementById('cpa-automation-email-service-type').value,
        email_service_id: parseOptionalInt(document.getElementById('cpa-automation-email-service-id').value),
        proxy_id: parseOptionalInt(document.getElementById('cpa-automation-proxy').value),
        proxy: null,
        interval_min: parseInt(document.getElementById('cpa-automation-interval-min').value || '0', 10),
        interval_max: parseInt(document.getElementById('cpa-automation-interval-max').value || '0', 10),
        concurrency: parseInt(document.getElementById('cpa-automation-concurrency').value || '1', 10),
        mode: document.getElementById('cpa-automation-mode').value,
        sync_local_invalid: document.getElementById('cpa-automation-sync-local-invalid').checked,
        replenish_enabled: document.getElementById('cpa-automation-replenish-enabled').checked
    };

    if (payload.enabled && !payload.cpa_service_id) {
        toast.error('启用 CPA 联动前请先选择一个 CPA 服务');
        return;
    }
    if (payload.interval_max < payload.interval_min) {
        toast.error('最大补号间隔不能小于最小补号间隔');
        return;
    }

    try {
        await api.post('/settings/cpa-automation', payload);
        cpaAutomationState.selectedProxyId = payload.proxy_id ? String(payload.proxy_id) : '';
        cpaAutomationState.legacyProxy = '';
        toast.success('CPA 联动配置已保存');
        await loadCpaAutomationSettings();
    } catch (error) {
        toast.error('保存失败: ' + error.message);
    }
}

async function handleRunCpaAutomation() {
    if (!elements.cpaAutomationRunBtn) return;

    elements.cpaAutomationRunBtn.disabled = true;
    elements.cpaAutomationRunBtn.textContent = '执行中...';

    try {
        const result = await api.post('/settings/cpa-automation/run', {});
        if (result.success) {
            toast.success(result.message || 'CPA 联动执行完成');
        } else {
            toast.warning(result.message || 'CPA 联动未执行');
        }
        await loadCpaAutomationSettings();
    } catch (error) {
        toast.error('执行失败: ' + error.message);
    } finally {
        elements.cpaAutomationRunBtn.disabled = false;
        elements.cpaAutomationRunBtn.textContent = '▶ 立即执行一次';
    }
}

function parseOptionalInt(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

// 保存 Web UI 设置
async function handleSaveWebuiSettings(e) {
    e.preventDefault();

    const accessPassword = document.getElementById('webui-access-password').value;
    const payload = {
        access_password: accessPassword || null
    };

    try {
        await api.post('/settings/webui', payload);
        toast.success('Web UI 设置已更新');
        document.getElementById('webui-access-password').value = '';
    } catch (error) {
        console.error('保存 Web UI 设置失败:', error);
        toast.error('保存 Web UI 设置失败');
    }
}

// 加载邮箱服务
async function loadEmailServices() {
    // 检查元素是否存在
    if (!elements.emailServicesTable) return;

    try {
        const data = await api.get('/email-services');
        renderEmailServices(data.services);
        if (elements.cpaAutomationForm) {
            loadCpaAutomationOptions();
        }
    } catch (error) {
        console.error('加载邮箱服务失败:', error);
        if (elements.emailServicesTable) {
            elements.emailServicesTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <div class="empty-state-icon">❌</div>
                            <div class="empty-state-title">加载失败</div>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// 渲染邮箱服务
function renderEmailServices(services) {
    // 检查元素是否存在
    if (!elements.emailServicesTable) return;

    if (services.length === 0) {
        elements.emailServicesTable.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <div class="empty-state-title">暂无配置</div>
                        <div class="empty-state-description">点击上方"添加服务"按钮添加邮箱服务</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    elements.emailServicesTable.innerHTML = services.map(service => `
        <tr data-service-id="${service.id}">
            <td>
                <input type="checkbox" class="service-checkbox" data-id="${service.id}"
                    onchange="updateSelectedServices()">
            </td>
            <td>${escapeHtml(service.name)}</td>
            <td>${getServiceTypeText(service.service_type)}</td>
            <td title="${service.enabled ? '已启用' : '已禁用'}">${service.enabled ? '✅' : '⭕'}</td>
            <td>${service.priority}</td>
            <td>${format.date(service.last_used)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-ghost btn-sm" onclick="testService(${service.id})" title="测试">
                        🔌
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="toggleService(${service.id}, ${!service.enabled})" title="${service.enabled ? '禁用' : '启用'}">
                        ${service.enabled ? '🔒' : '🔓'}
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="deleteService(${service.id})" title="删除">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 加载数据库信息
async function loadDatabaseInfo() {
    try {
        const data = await api.get('/settings/database');

        document.getElementById('db-size').textContent = `${data.database_size_mb} MB`;
        document.getElementById('db-accounts').textContent = format.number(data.accounts_count);
        document.getElementById('db-services').textContent = format.number(data.email_services_count);
        document.getElementById('db-tasks').textContent = format.number(data.tasks_count);

    } catch (error) {
        console.error('加载数据库信息失败:', error);
    }
}

// 保存注册配置
async function handleSaveRegistration(e) {
    e.preventDefault();

    const data = {
        max_retries: parseInt(document.getElementById('max-retries').value),
        timeout: parseInt(document.getElementById('timeout').value),
        default_password_length: parseInt(document.getElementById('password-length').value),
        sleep_min: parseInt(document.getElementById('sleep-min').value),
        sleep_max: parseInt(document.getElementById('sleep-max').value),
    };

    try {
        await api.post('/settings/registration', data);
        toast.success('注册配置已保存');
    } catch (error) {
        toast.error('保存失败: ' + error.message);
    }
}

// 保存验证码等待配置
async function handleSaveEmailCode(e) {
    e.preventDefault();

    const timeout = parseInt(document.getElementById('email-code-timeout').value);
    const pollInterval = parseInt(document.getElementById('email-code-poll-interval').value);

    // 客户端验证
    if (timeout < 30 || timeout > 600) {
        toast.error('等待超时必须在 30-600 秒之间');
        return;
    }
    if (pollInterval < 1 || pollInterval > 30) {
        toast.error('轮询间隔必须在 1-30 秒之间');
        return;
    }

    const data = {
        timeout: timeout,
        poll_interval: pollInterval
    };

    try {
        await api.post('/settings/email-code', data);
        toast.success('验证码配置已保存');
    } catch (error) {
        toast.error('保存失败: ' + error.message);
    }
}

// 备份数据库
async function handleBackup() {
    elements.backupBtn.disabled = true;
    elements.backupBtn.innerHTML = '<span class="loading-spinner"></span> 备份中...';

    try {
        const data = await api.post('/settings/database/backup');
        toast.success(`备份成功: ${data.backup_path}`);
    } catch (error) {
        toast.error('备份失败: ' + error.message);
    } finally {
        elements.backupBtn.disabled = false;
        elements.backupBtn.textContent = '💾 备份数据库';
    }
}

// 清理数据
async function handleCleanup() {
    const confirmed = await confirm('确定要清理过期数据吗？此操作不可恢复。');
    if (!confirmed) return;

    elements.cleanupBtn.disabled = true;
    elements.cleanupBtn.innerHTML = '<span class="loading-spinner"></span> 清理中...';

    try {
        const data = await api.post('/settings/database/cleanup?days=30');
        toast.success(data.message);
        loadDatabaseInfo();
    } catch (error) {
        toast.error('清理失败: ' + error.message);
    } finally {
        elements.cleanupBtn.disabled = false;
        elements.cleanupBtn.textContent = '🧹 清理过期数据';
    }
}

// 加载服务配置字段
async function loadServiceConfigFields(serviceType) {
    try {
        const data = await api.get('/email-services/types');
        const typeInfo = data.types.find(t => t.value === serviceType);

        if (!typeInfo) {
            elements.serviceConfigFields.innerHTML = '';
            return;
        }

        elements.serviceConfigFields.innerHTML = typeInfo.config_fields.map(field => `
            <div class="form-group">
                <label for="config-${field.name}">${field.label}</label>
                <input type="${field.name.includes('password') || field.name.includes('token') ? 'password' : 'text'}"
                       id="config-${field.name}"
                       name="${field.name}"
                       value="${field.default || ''}"
                       placeholder="${field.label}"
                       ${field.required ? 'required' : ''}>
            </div>
        `).join('');

    } catch (error) {
        console.error('加载配置字段失败:', error);
    }
}

// 添加邮箱服务
async function handleAddService(e) {
    e.preventDefault();

    const formData = new FormData(elements.addServiceForm);
    const config = {};

    elements.serviceConfigFields.querySelectorAll('input').forEach(input => {
        config[input.name] = input.value;
    });

    const data = {
        service_type: formData.get('service_type'),
        name: formData.get('name'),
        config: config,
        enabled: true,
        priority: 0,
    };

    try {
        await api.post('/email-services', data);
        toast.success('邮箱服务已添加');
        elements.addServiceModal.classList.remove('active');
        elements.addServiceForm.reset();
        loadEmailServices();
    } catch (error) {
        toast.error('添加失败: ' + error.message);
    }
}

// 测试服务
async function testService(id) {
    try {
        const data = await api.post(`/email-services/${id}/test`);
        if (data.success) {
            toast.success('服务连接正常');
        } else {
            toast.warning('服务连接失败: ' + data.message);
        }
    } catch (error) {
        toast.error('测试失败: ' + error.message);
    }
}

// 切换服务状态
async function toggleService(id, enabled) {
    try {
        const endpoint = enabled ? 'enable' : 'disable';
        await api.post(`/email-services/${id}/${endpoint}`);
        toast.success(enabled ? '服务已启用' : '服务已禁用');
        loadEmailServices();
    } catch (error) {
        toast.error('操作失败: ' + error.message);
    }
}

// 删除服务
async function deleteService(id) {
    const confirmed = await confirm('确定要删除此邮箱服务配置吗？');
    if (!confirmed) return;

    try {
        await api.delete(`/email-services/${id}`);
        toast.success('服务已删除');
        loadEmailServices();
    } catch (error) {
        toast.error('删除失败: ' + error.message);
    }
}

// 更新选中的服务
function updateSelectedServices() {
    selectedServiceIds.clear();
    document.querySelectorAll('.service-checkbox:checked').forEach(cb => {
        selectedServiceIds.add(parseInt(cb.dataset.id));
    });
}

// Outlook 批量导入
async function handleOutlookBatchImport() {
    const data = elements.outlookImportData.value.trim();
    if (!data) {
        toast.warning('请输入要导入的数据');
        return;
    }

    const enabled = document.getElementById('outlook-import-enabled').checked;
    const priority = parseInt(document.getElementById('outlook-import-priority').value) || 0;

    // 解析数据
    const lines = data.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    const accounts = [];
    const errors = [];

    lines.forEach((line, index) => {
        const parts = line.split('----').map(p => p.trim());
        if (parts.length < 2) {
            errors.push(`第 ${index + 1} 行格式错误`);
            return;
        }

        const account = {
            email: parts[0],
            password: parts[1],
            client_id: parts[2] || null,
            refresh_token: parts[3] || null,
            enabled: enabled,
            priority: priority
        };

        if (!account.email.includes('@')) {
            errors.push(`第 ${index + 1} 行邮箱格式错误: ${account.email}`);
            return;
        }

        accounts.push(account);
    });

    if (errors.length > 0) {
        elements.importResult.style.display = 'block';
        elements.importResult.innerHTML = `
            <div class="import-errors">${errors.map(e => `<div>${e}</div>`).join('')}</div>
        `;
        return;
    }

    elements.outlookImportBtn.disabled = true;
    elements.outlookImportBtn.innerHTML = '<span class="loading-spinner"></span> 导入中...';

    let successCount = 0;
    let failCount = 0;

    try {
        for (const account of accounts) {
            try {
                await api.post('/email-services', {
                    service_type: 'outlook',
                    name: account.email,
                    config: {
                        email: account.email,
                        password: account.password,
                        client_id: account.client_id,
                        refresh_token: account.refresh_token
                    },
                    enabled: account.enabled,
                    priority: account.priority
                });
                successCount++;
            } catch {
                failCount++;
            }
        }

        elements.importResult.style.display = 'block';
        elements.importResult.innerHTML = `
            <div class="import-stats">
                <span>✅ 成功: ${successCount}</span>
                <span>❌ 失败: ${failCount}</span>
            </div>
        `;

        toast.success(`导入完成，成功 ${successCount} 个`);
        loadEmailServices();

    } catch (error) {
        toast.error('导入失败: ' + error.message);
    } finally {
        elements.outlookImportBtn.disabled = false;
        elements.outlookImportBtn.textContent = '📥 开始导入';
    }
}

// HTML 转义
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ============================================================================
// 代理列表管理
// ============================================================================

// 加载代理列表
async function loadProxies() {
    try {
        const data = await api.get('/settings/proxies');
        cpaAutomationState.proxies = data.proxies || [];
        renderProxies(data.proxies);
        if (elements.cpaAutomationForm) {
            renderCpaAutomationProxyOptions(
                document.getElementById('cpa-automation-proxy')?.value || cpaAutomationState.selectedProxyId || '',
                cpaAutomationState.legacyProxy
            );
        }
    } catch (error) {
        console.error('加载代理列表失败:', error);
        elements.proxiesTable.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <div class="empty-state-title">加载失败</div>
                    </div>
                </td>
            </tr>
        `;
    }
}

// 渲染代理列表
function renderProxies(proxies) {
    if (!proxies || proxies.length === 0) {
        elements.proxiesTable.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-state-icon">🌐</div>
                        <div class="empty-state-title">暂无代理</div>
                        <div class="empty-state-description">点击"添加代理"按钮添加代理服务器</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    elements.proxiesTable.innerHTML = proxies.map(proxy => `
        <tr data-proxy-id="${proxy.id}">
            <td>${proxy.id}</td>
            <td>${escapeHtml(proxy.name)}</td>
            <td><span class="badge">${proxy.type.toUpperCase()}</span></td>
            <td><code>${escapeHtml(proxy.host)}:${proxy.port}</code></td>
            <td>
                ${proxy.is_default
                    ? '<span class="status-badge active">默认</span>'
                    : `<button class="btn btn-ghost btn-sm" onclick="handleSetProxyDefault(${proxy.id})" title="设为默认">设默认</button>`
                }
            </td>
            <td title="${proxy.enabled ? '已启用' : '已禁用'}">${proxy.enabled ? '✅' : '⭕'}</td>
            <td>${format.date(proxy.last_used)}</td>
            <td>
                <div style="display:flex;gap:4px;align-items:center;white-space:nowrap;">
                    <button class="btn btn-secondary btn-sm" onclick="editProxyItem(${proxy.id})">编辑</button>
                    <div class="dropdown" style="position:relative;">
                        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();toggleSettingsMoreMenu(this)">更多</button>
                        <div class="dropdown-menu" style="min-width:80px;">
                            <a href="#" class="dropdown-item" onclick="event.preventDefault();closeSettingsMoreMenu(this);testProxyItem(${proxy.id})">测试</a>
                            <a href="#" class="dropdown-item" onclick="event.preventDefault();closeSettingsMoreMenu(this);toggleProxyItem(${proxy.id}, ${!proxy.enabled})">${proxy.enabled ? '禁用' : '启用'}</a>
                            ${!proxy.is_default ? `<a href="#" class="dropdown-item" onclick="event.preventDefault();closeSettingsMoreMenu(this);handleSetProxyDefault(${proxy.id})">设为默认</a>` : ''}
                        </div>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteProxyItem(${proxy.id})">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function toggleSettingsMoreMenu(btn) {
    const menu = btn.nextElementSibling;
    const isActive = menu.classList.contains('active');
    document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
    if (!isActive) menu.classList.add('active');
}

function closeSettingsMoreMenu(el) {
    const menu = el.closest('.dropdown-menu');
    if (menu) menu.classList.remove('active');
}

// 设为默认代理
async function handleSetProxyDefault(id) {
    try {
        await api.post(`/settings/proxies/${id}/set-default`);
        toast.success('已设为默认代理');
        loadProxies();
    } catch (error) {
        toast.error('操作失败: ' + error.message);
    }
}

// 打开代理模态框
function openProxyModal(proxy = null) {
    elements.proxyModalTitle.textContent = proxy ? '编辑代理' : '添加代理';
    elements.proxyItemForm.reset();

    document.getElementById('proxy-item-id').value = proxy ? proxy.id : '';

    if (proxy) {
        document.getElementById('proxy-item-name').value = proxy.name || '';
        document.getElementById('proxy-item-type').value = proxy.type || 'http';
        document.getElementById('proxy-item-host').value = proxy.host || '';
        document.getElementById('proxy-item-port').value = proxy.port || '';
        document.getElementById('proxy-item-username').value = proxy.username || '';
        document.getElementById('proxy-item-password').value = '';
    }

    elements.addProxyModal.classList.add('active');
}

// 关闭代理模态框
function closeProxyModal() {
    elements.addProxyModal.classList.remove('active');
    elements.proxyItemForm.reset();
}

// 保存代理
async function handleSaveProxyItem(e) {
    e.preventDefault();

    const proxyId = document.getElementById('proxy-item-id').value;
    const data = {
        name: document.getElementById('proxy-item-name').value,
        type: document.getElementById('proxy-item-type').value,
        host: document.getElementById('proxy-item-host').value,
        port: parseInt(document.getElementById('proxy-item-port').value),
        username: document.getElementById('proxy-item-username').value || null,
        password: document.getElementById('proxy-item-password').value || null,
        enabled: true
    };

    try {
        if (proxyId) {
            await api.patch(`/settings/proxies/${proxyId}`, data);
            toast.success('代理已更新');
        } else {
            await api.post('/settings/proxies', data);
            toast.success('代理已添加');
        }
        closeProxyModal();
        loadProxies();
    } catch (error) {
        toast.error('保存失败: ' + error.message);
    }
}

// 编辑代理
async function editProxyItem(id) {
    try {
        const proxy = await api.get(`/settings/proxies/${id}`);
        openProxyModal(proxy);
    } catch (error) {
        toast.error('获取代理信息失败');
    }
}

// 测试单个代理
async function testProxyItem(id) {
    try {
        const result = await api.post(`/settings/proxies/${id}/test`);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (error) {
        toast.error('测试失败: ' + error.message);
    }
}

// 切换代理状态
async function toggleProxyItem(id, enabled) {
    try {
        const endpoint = enabled ? 'enable' : 'disable';
        await api.post(`/settings/proxies/${id}/${endpoint}`);
        toast.success(enabled ? '代理已启用' : '代理已禁用');
        loadProxies();
    } catch (error) {
        toast.error('操作失败: ' + error.message);
    }
}

// 删除代理
async function deleteProxyItem(id) {
    const confirmed = await confirm('确定要删除此代理吗？');
    if (!confirmed) return;

    try {
        await api.delete(`/settings/proxies/${id}`);
        toast.success('代理已删除');
        loadProxies();
    } catch (error) {
        toast.error('删除失败: ' + error.message);
    }
}

// 测试所有代理
async function handleTestAllProxies() {
    elements.testAllProxiesBtn.disabled = true;
    elements.testAllProxiesBtn.innerHTML = '<span class="loading-spinner"></span> 测试中...';

    try {
        const result = await api.post('/settings/proxies/test-all');
        toast.info(`测试完成: 成功 ${result.success}, 失败 ${result.failed}`);
        loadProxies();
    } catch (error) {
        toast.error('测试失败: ' + error.message);
    } finally {
        elements.testAllProxiesBtn.disabled = false;
        elements.testAllProxiesBtn.textContent = '🔌 测试全部';
    }
}


// ============================================================================
// Outlook 设置管理
// ============================================================================

// 加载 Outlook 设置
async function loadOutlookSettings() {
    try {
        const data = await api.get('/settings/outlook');
        const el = document.getElementById('outlook-default-client-id');
        if (el) el.value = data.default_client_id || '';
    } catch (error) {
        console.error('加载 Outlook 设置失败:', error);
    }
}

// 保存 Outlook 设置
async function handleSaveOutlookSettings(e) {
    e.preventDefault();
    const data = {
        default_client_id: document.getElementById('outlook-default-client-id').value
    };
    try {
        await api.post('/settings/outlook', data);
        toast.success('Outlook 设置已保存');
    } catch (error) {
        toast.error('保存失败: ' + error.message);
    }
}

// ============== 动态代理设置 ==============

async function handleSaveDynamicProxy(e) {
    e.preventDefault();
    const data = {
        enabled: document.getElementById('dynamic-proxy-enabled').checked,
        api_url: document.getElementById('dynamic-proxy-api-url').value.trim(),
        api_key: document.getElementById('dynamic-proxy-api-key').value || null,
        api_key_header: document.getElementById('dynamic-proxy-api-key-header').value.trim() || 'X-API-Key',
        result_field: document.getElementById('dynamic-proxy-result-field').value.trim()
    };
    try {
        await api.post('/settings/proxy/dynamic', data);
        toast.success('动态代理设置已保存');
        document.getElementById('dynamic-proxy-api-key').value = '';
    } catch (error) {
        toast.error('保存失败: ' + error.message);
    }
}

async function handleTestDynamicProxy() {
    const apiUrl = document.getElementById('dynamic-proxy-api-url').value.trim();
    if (!apiUrl) {
        toast.warning('请先填写动态代理 API 地址');
        return;
    }
    const btn = elements.testDynamicProxyBtn;
    btn.disabled = true;
    btn.textContent = '测试中...';
    try {
        const result = await api.post('/settings/proxy/dynamic/test', {
            api_url: apiUrl,
            api_key: document.getElementById('dynamic-proxy-api-key').value || null,
            api_key_header: document.getElementById('dynamic-proxy-api-key-header').value.trim() || 'X-API-Key',
            result_field: document.getElementById('dynamic-proxy-result-field').value.trim()
        });
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (error) {
        toast.error('测试失败: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🔌 测试动态代理';
    }
}

// ============== Team Manager 服务管理 ==============

async function loadTmServices() {
    if (!elements.tmServicesTable) return;
    try {
        const services = await api.get('/tm-services');
        renderTmServicesTable(services);
    } catch (e) {
        elements.tmServicesTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger-color);">${e.message}</td></tr>`;
    }
}

function renderTmServicesTable(services) {
    if (!services || services.length === 0) {
        elements.tmServicesTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">暂无 Team Manager 服务，点击「添加服务」新增</td></tr>';
        return;
    }
    elements.tmServicesTable.innerHTML = services.map(s => `
        <tr>
            <td>${escapeHtml(s.name)}</td>
            <td style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(s.api_url)}</td>
            <td style="text-align:center;" title="${s.enabled ? '已启用' : '已禁用'}">${s.enabled ? '✅' : '⭕'}</td>
            <td style="text-align:center;">${s.priority}</td>
            <td style="white-space:nowrap;">
                <button class="btn btn-secondary btn-sm" onclick="editTmService(${s.id})">编辑</button>
                <button class="btn btn-secondary btn-sm" onclick="testTmServiceById(${s.id})">测试</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTmService(${s.id}, '${escapeHtml(s.name)}')">删除</button>
            </td>
        </tr>
    `).join('');
}

function openTmServiceModal(service = null) {
    document.getElementById('tm-service-id').value = service ? service.id : '';
    document.getElementById('tm-service-name').value = service ? service.name : '';
    document.getElementById('tm-service-url').value = service ? service.api_url : '';
    document.getElementById('tm-service-key').value = '';
    document.getElementById('tm-service-priority').value = service ? service.priority : 0;
    document.getElementById('tm-service-enabled').checked = service ? service.enabled : true;
    if (service) {
        document.getElementById('tm-service-key').placeholder = service.has_key ? '已配置，留空保持不变' : '请输入 API Key';
    } else {
        document.getElementById('tm-service-key').placeholder = '请输入 API Key';
    }
    elements.tmServiceModalTitle.textContent = service ? '编辑 Team Manager 服务' : '添加 Team Manager 服务';
    elements.tmServiceEditModal.classList.add('active');
}

function closeTmServiceModal() {
    elements.tmServiceEditModal.classList.remove('active');
}

async function editTmService(id) {
    try {
        const service = await api.get(`/tm-services/${id}`);
        openTmServiceModal(service);
    } catch (e) {
        toast.error('获取服务信息失败: ' + e.message);
    }
}

async function handleSaveTmService(e) {
    e.preventDefault();
    const id = document.getElementById('tm-service-id').value;
    const name = document.getElementById('tm-service-name').value.trim();
    const apiUrl = document.getElementById('tm-service-url').value.trim();
    const apiKey = document.getElementById('tm-service-key').value.trim();
    const priority = parseInt(document.getElementById('tm-service-priority').value) || 0;
    const enabled = document.getElementById('tm-service-enabled').checked;

    if (!name || !apiUrl) {
        toast.error('名称和 API URL 不能为空');
        return;
    }
    if (!id && !apiKey) {
        toast.error('新增服务时 API Key 不能为空');
        return;
    }

    try {
        const payload = { name, api_url: apiUrl, priority, enabled };
        if (apiKey) payload.api_key = apiKey;

        if (id) {
            await api.patch(`/tm-services/${id}`, payload);
            toast.success('服务已更新');
        } else {
            payload.api_key = apiKey;
            await api.post('/tm-services', payload);
            toast.success('服务已添加');
        }
        closeTmServiceModal();
        loadTmServices();
    } catch (e) {
        toast.error('保存失败: ' + e.message);
    }
}

async function deleteTmService(id, name) {
    const confirmed = await confirm(`确定要删除 Team Manager 服务「${name}」吗？`);
    if (!confirmed) return;
    try {
        await api.delete(`/tm-services/${id}`);
        toast.success('已删除');
        loadTmServices();
    } catch (e) {
        toast.error('删除失败: ' + e.message);
    }
}

async function testTmServiceById(id) {
    try {
        const result = await api.post(`/tm-services/${id}/test`);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (e) {
        toast.error('测试失败: ' + e.message);
    }
}

async function handleTestTmService() {
    const apiUrl = document.getElementById('tm-service-url').value.trim();
    const apiKey = document.getElementById('tm-service-key').value.trim();
    const id = document.getElementById('tm-service-id').value;

    if (!apiUrl) {
        toast.error('请先填写 API URL');
        return;
    }
    if (!id && !apiKey) {
        toast.error('请先填写 API Key');
        return;
    }

    elements.testTmServiceBtn.disabled = true;
    elements.testTmServiceBtn.textContent = '测试中...';

    try {
        let result;
        if (id && !apiKey) {
            result = await api.post(`/tm-services/${id}/test`);
        } else {
            result = await api.post('/tm-services/test-connection', { api_url: apiUrl, api_key: apiKey });
        }
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (e) {
        toast.error('测试失败: ' + e.message);
    } finally {
        elements.testTmServiceBtn.disabled = false;
        elements.testTmServiceBtn.textContent = '🔌 测试连接';
    }
}


// ============== CPA 服务管理 ==============

async function loadCpaServices() {
    if (!elements.cpaServicesTable) return;
    try {
        const services = await api.get('/cpa-services');
        renderCpaServicesTable(services);
        if (elements.cpaAutomationForm) {
            loadCpaAutomationOptions();
        }
    } catch (e) {
        elements.cpaServicesTable.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger-color);">${e.message}</td></tr>`;
    }
}

function renderCpaServicesTable(services) {
    if (!services || services.length === 0) {
        elements.cpaServicesTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">暂无 CPA 服务，点击「添加服务」新增</td></tr>';
        return;
    }
    elements.cpaServicesTable.innerHTML = services.map(s => `
        <tr>
            <td>${escapeHtml(s.name)}</td>
            <td style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(s.api_url)}</td>
            <td style="text-align:center;" title="${s.enabled ? '已启用' : '已禁用'}">${s.enabled ? '✅' : '⭕'}</td>
            <td style="text-align:center;">${s.priority}</td>
            <td style="white-space:nowrap;">
                <button class="btn btn-secondary btn-sm" onclick="editCpaService(${s.id})">编辑</button>
                <button class="btn btn-secondary btn-sm" onclick="testCpaServiceById(${s.id})">测试</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCpaService(${s.id}, '${escapeHtml(s.name)}')">删除</button>
            </td>
        </tr>
    `).join('');
}

function openCpaServiceModal(service = null) {
    document.getElementById('cpa-service-id').value = service ? service.id : '';
    document.getElementById('cpa-service-name').value = service ? service.name : '';
    document.getElementById('cpa-service-url').value = service ? service.api_url : '';
    document.getElementById('cpa-service-token').value = '';
    document.getElementById('cpa-service-priority').value = service ? service.priority : 0;
    document.getElementById('cpa-service-enabled').checked = service ? service.enabled : true;
    elements.cpaServiceModalTitle.textContent = service ? '编辑 CPA 服务' : '添加 CPA 服务';
    elements.cpaServiceEditModal.classList.add('active');
}

function closeCpaServiceModal() {
    elements.cpaServiceEditModal.classList.remove('active');
}

async function editCpaService(id) {
    try {
        const service = await api.get(`/cpa-services/${id}`);
        openCpaServiceModal(service);
    } catch (e) {
        toast.error('获取服务信息失败: ' + e.message);
    }
}

async function handleSaveCpaService(e) {
    e.preventDefault();
    const id = document.getElementById('cpa-service-id').value;
    const name = document.getElementById('cpa-service-name').value.trim();
    const apiUrl = document.getElementById('cpa-service-url').value.trim();
    const apiToken = document.getElementById('cpa-service-token').value.trim();
    const priority = parseInt(document.getElementById('cpa-service-priority').value) || 0;
    const enabled = document.getElementById('cpa-service-enabled').checked;

    if (!name || !apiUrl) {
        toast.error('名称和 API URL 不能为空');
        return;
    }
    if (!id && !apiToken) {
        toast.error('新增服务时 API Token 不能为空');
        return;
    }

    try {
        const payload = { name, api_url: apiUrl, priority, enabled };
        if (apiToken) payload.api_token = apiToken;

        if (id) {
            await api.patch(`/cpa-services/${id}`, payload);
            toast.success('服务已更新');
        } else {
            payload.api_token = apiToken;
            await api.post('/cpa-services', payload);
            toast.success('服务已添加');
        }
        closeCpaServiceModal();
        loadCpaServices();
    } catch (e) {
        toast.error('保存失败: ' + e.message);
    }
}

async function deleteCpaService(id, name) {
    const confirmed = await confirm(`确定要删除 CPA 服务「${name}」吗？`);
    if (!confirmed) return;
    try {
        await api.delete(`/cpa-services/${id}`);
        toast.success('已删除');
        loadCpaServices();
    } catch (e) {
        toast.error('删除失败: ' + e.message);
    }
}

async function testCpaServiceById(id) {
    try {
        const result = await api.post(`/cpa-services/${id}/test`);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (e) {
        toast.error('测试失败: ' + e.message);
    }
}

async function handleTestCpaService() {
    const apiUrl = document.getElementById('cpa-service-url').value.trim();
    const apiToken = document.getElementById('cpa-service-token').value.trim();
    const id = document.getElementById('cpa-service-id').value;

    if (!apiUrl) {
        toast.error('请先填写 API URL');
        return;
    }
    // 新增时必须有 token，编辑时 token 可为空（用已保存的）
    if (!id && !apiToken) {
        toast.error('请先填写 API Token');
        return;
    }

    elements.testCpaServiceBtn.disabled = true;
    elements.testCpaServiceBtn.textContent = '测试中...';

    try {
        let result;
        if (id && !apiToken) {
            // 编辑时未填 token，直接测试已保存的服务
            result = await api.post(`/cpa-services/${id}/test`);
        } else {
            result = await api.post('/cpa-services/test-connection', { api_url: apiUrl, api_token: apiToken });
        }
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (e) {
        toast.error('测试失败: ' + e.message);
    } finally {
        elements.testCpaServiceBtn.disabled = false;
        elements.testCpaServiceBtn.textContent = '🔌 测试连接';
    }
}

// ============================================================================
// Sub2API 服务管理
// ============================================================================

let _sub2apiEditingId = null;

async function loadSub2ApiServices() {
    try {
        const services = await api.get('/sub2api-services');
        renderSub2ApiServices(services);
    } catch (e) {
        if (elements.sub2ApiServicesTable) {
            elements.sub2ApiServicesTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">加载失败</td></tr>';
        }
    }
}

function renderSub2ApiServices(services) {
    if (!elements.sub2ApiServicesTable) return;
    if (!services || services.length === 0) {
        elements.sub2ApiServicesTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">暂无 Sub2API 服务，点击「添加服务」新增</td></tr>';
        return;
    }
    elements.sub2ApiServicesTable.innerHTML = services.map(s => `
        <tr>
            <td>${escapeHtml(s.name)}</td>
            <td style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(s.api_url)}</td>
            <td style="text-align:center;" title="${s.enabled ? '已启用' : '已禁用'}">${s.enabled ? '✅' : '⭕'}</td>
            <td style="text-align:center;">${s.priority}</td>
            <td style="white-space:nowrap;">
                <button class="btn btn-secondary btn-sm" onclick="editSub2ApiService(${s.id})">编辑</button>
                <button class="btn btn-secondary btn-sm" onclick="testSub2ApiServiceById(${s.id})">测试</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSub2ApiService(${s.id}, '${escapeHtml(s.name)}')">删除</button>
            </td>
        </tr>
    `).join('');
}

function openSub2ApiServiceModal(svc = null) {
    _sub2apiEditingId = svc ? svc.id : null;
    elements.sub2ApiServiceModalTitle.textContent = svc ? '编辑 Sub2API 服务' : '添加 Sub2API 服务';
    elements.sub2ApiServiceForm.reset();
    document.getElementById('sub2api-service-id').value = svc ? svc.id : '';
    if (svc) {
        document.getElementById('sub2api-service-name').value = svc.name || '';
        document.getElementById('sub2api-service-url').value = svc.api_url || '';
        document.getElementById('sub2api-service-priority').value = svc.priority ?? 0;
        document.getElementById('sub2api-service-enabled').checked = svc.enabled !== false;
        document.getElementById('sub2api-service-key').placeholder = svc.has_key ? '已配置，留空保持不变' : '请输入 API Key';
    }
    elements.sub2ApiServiceEditModal.classList.add('active');
}

function closeSub2ApiServiceModal() {
    elements.sub2ApiServiceEditModal.classList.remove('active');
    elements.sub2ApiServiceForm.reset();
    _sub2apiEditingId = null;
}

async function editSub2ApiService(id) {
    try {
        const svc = await api.get(`/sub2api-services/${id}`);
        openSub2ApiServiceModal(svc);
    } catch (e) {
        toast.error('加载失败: ' + e.message);
    }
}

async function deleteSub2ApiService(id, name) {
    if (!confirm(`确认删除 Sub2API 服务「${name}」？`)) return;
    try {
        await api.delete(`/sub2api-services/${id}`);
        toast.success('服务已删除');
        loadSub2ApiServices();
    } catch (e) {
        toast.error('删除失败: ' + e.message);
    }
}

async function handleSaveSub2ApiService(e) {
    e.preventDefault();
    const id = document.getElementById('sub2api-service-id').value;
    const data = {
        name: document.getElementById('sub2api-service-name').value,
        api_url: document.getElementById('sub2api-service-url').value,
        api_key: document.getElementById('sub2api-service-key').value || undefined,
        priority: parseInt(document.getElementById('sub2api-service-priority').value) || 0,
        enabled: document.getElementById('sub2api-service-enabled').checked,
    };
    if (!id && !data.api_key) {
        toast.error('请填写 API Key');
        return;
    }
    if (!data.api_key) delete data.api_key;

    try {
        if (id) {
            await api.patch(`/sub2api-services/${id}`, data);
            toast.success('服务已更新');
        } else {
            await api.post('/sub2api-services', data);
            toast.success('服务已添加');
        }
        closeSub2ApiServiceModal();
        loadSub2ApiServices();
    } catch (e) {
        toast.error('保存失败: ' + e.message);
    }
}

async function testSub2ApiServiceById(id) {
    try {
        const result = await api.post(`/sub2api-services/${id}/test`);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (e) {
        toast.error('测试失败: ' + e.message);
    }
}

async function handleTestSub2ApiService() {
    const apiUrl = document.getElementById('sub2api-service-url').value.trim();
    const apiKey = document.getElementById('sub2api-service-key').value.trim();
    const id = document.getElementById('sub2api-service-id').value;

    if (!apiUrl) {
        toast.error('请先填写 API URL');
        return;
    }
    if (!id && !apiKey) {
        toast.error('请先填写 API Key');
        return;
    }

    elements.testSub2ApiServiceBtn.disabled = true;
    elements.testSub2ApiServiceBtn.textContent = '测试中...';

    try {
        let result;
        if (id && !apiKey) {
            result = await api.post(`/sub2api-services/${id}/test`);
        } else {
            result = await api.post('/sub2api-services/test-connection', { api_url: apiUrl, api_key: apiKey });
        }
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    } catch (e) {
        toast.error('测试失败: ' + e.message);
    } finally {
        elements.testSub2ApiServiceBtn.disabled = false;
        elements.testSub2ApiServiceBtn.textContent = '🔌 测试连接';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
