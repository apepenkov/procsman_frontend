const locales = {
    en: {
        errors: {
            process_not_found: 'Process not found',
            error_getting_process: 'Error getting process',
            no_id_provided: 'No id provided',
            invalid_id: 'Invalid id',
            invalid_request: 'Invalid request',
            name_required: 'Name required',
            executable_required: 'Executable required',
            executable_not_found: 'Executable not found',
            executable_not_file: "Executable isn't a file",
            wd_not_found: 'Working directory not found',
            wd_not_dir: 'Working directory is not a directory',
            invalid_group: 'Invalid group',
            group_already_exists: 'Group already exists',
            invalid_color: 'Invalid color',
            could_not_create_process: 'Could not create process',
            process_not_running: 'Process not running',
            internal_error: 'Internal error',
            could_not_create_group: 'Could not create group',
            group_not_found: 'Group not found',
        },
        close: 'Close',
        unknown_error: 'Unknown error, status:',
        error_making_request: 'Error making request: ',
        auth_key: 'Authentification key',
        invalid_auth_key: 'Invalid authentification key',
        enter_auth_key: 'Enter authentification key:',
        start: 'Start',
        stop: 'Stop',
        restart: 'Restart',
        na: 'N/A',
    },
    ru: {
        errors: {
            process_not_found: 'Процесс не найден',
            error_getting_process: 'Ошибка получения процесса',
            no_id_provided: 'Не указан id',
            invalid_id: 'Неверный id',
            invalid_request: 'Неверный запрос',
            name_required: 'Требуется имя',
            executable_required: 'Требуется исполняемый файл',
            executable_not_found: 'Исполняемый файл не найден',
            executable_not_file: 'Исполняемый файл не является файлом',
            wd_not_found: 'Рабочая директория не найдена',
            wd_not_dir: 'Рабочая директория не является директорией',
            invalid_group: 'Неверная группа',
            group_already_exists: 'Группа уже существует',
            invalid_color: 'Неверный цвет',
            could_not_create_process: 'Не удалось создать процесс',
            process_not_running: 'Процесс не запущен',
            internal_error: 'Внутренняя ошибка',
            could_not_create_group: 'Не удалось создать группу',
            group_not_found: 'Группа не найдена',
        },
        close: 'Закрыть',
        unknown_error: 'Неизвестная ошибка, статус:',
        error_making_request: 'Ошибка при выполнении запроса: ',
        auth_key: 'Ключ аутентификации',
        invalid_auth_key: 'Неверный ключ аутентификации',
        enter_auth_key: 'Введите ключ авторизации',
        start: 'Старт',
        stop: 'Стоп',
        restart: 'Перезапуск',
        na: 'Н/Д',
    },
};

const validators = {
    // validator format: [func, localization_key]
    configuration: {
        auto_restart_max_retries: (value) => [
            Number.isInteger(parseInt(value)) && value > 0 && value < 100,
            'auto_restart_max_retries_invalid',
        ],
        auto_restart_max_retries_frame: (value) => [
            Number.isInteger(parseInt(value)) && value > 0 && value < 1800,
            'auto_restart_max_retries_frame_invalid',
        ],
        auto_restart_delay: (value) => [
            Number.isInteger(parseInt(value)) && value > 0 && value < 180000,
            'auto_restart_delay_invalid',
        ],
    },
    process: {
        name: (value) => [value.length > 0, 'process_name_required'],
        executable_path: (value) => [value.length > 0, 'executable_required'],
    },
    group: {
        name: (value) => [value.length > 0, 'group_name_required'],
    },
};

// ('RUNNING', 'STOPPED', 'CRASHED', 'STARTING', 'STOPPING', 'STOPPED_WILL_RESTART', 'CRASHED_WILL_RESTART', 'UNKNOWN');
const processStatusColors = {
    RUNNING: '#00FF00',
    STOPPED: '#fd9b12',
    CRASHED: '#ff0000',
    STARTING: '#c2fd12',
    STOPPING: '#fd9712',
    STOPPED_WILL_RESTART: '#fd12A0',
    CRASHED_WILL_RESTART: '#ff12A0',
    UNKNOWN: '#519041',
};

const fallbackConfiguration = new Map(
    Object.entries({
        auto_auto_restart_on_stop: true,
        auto_auto_restart_on_crash: true,

        auto_restart_max_retries: 3,
        auto_restart_max_retries_frame: 60,
        auto_restart_delay: 5000,

        notify_on_start: true,
        notify_on_stop: true,
        notify_on_crash: true,

        // UNUSED
        record_stats: true,
        store_logs: true,
    })
);

const defaultSeverConfiguration = new Map();

class ProcessInfo {
    constructor(data) {
        this.updateWith(data);
    }

    updateWith(data) {
        if (data === null) {
            this.placeholder = true;
            return;
        }
        if (data instanceof ProcessInfo) {
            this.placeholder = data.placeholder;
            this.id = data.id;
            this.name = data.name;
            this.process_group_id = data.process_group_id;
            this.color = data.color;
            this.enabled = data.enabled;
            this.executable_path = data.executable_path;
            this.arguments = data.arguments;
            this.working_directory = data.working_directory;
            this.environment = data.environment;
            this.status = data.status;
            // if it's already a map
            if (data.configuration instanceof Map) {
                this.configuration = data.configuration;
            } else {
                this.configuration = new Map(Object.entries(data.configuration));
            }
            this.pinned = data.pinned;
            return;
        }
        this.placeholder = false;
        this.id = data.id;
        this.name = data.name;
        this.process_group_id = data.process_group_id;
        this.color = data.color;
        this.enabled = data.enabled;
        this.executable_path = data.executable_path;
        this.arguments = data.arguments;
        this.working_directory = data.working_directory;
        this.environment = data.environment;
        this.status = data.status;
        this.configuration = new Map(Object.entries(data.configuration));
        this.pinned = null;
    }

    rgbaColor() {
        if (this.placeholder) {
            return 'rgba(0, 0, 0, 0)';
        }
        let color = this.color;
        if (color === undefined || color === null || color === '') {
            return 'rgba(0, 0, 0, 0)';
        }
        if (color.length === 7) {
            color += 'A0';
        }
        return color;
    }

    statusColor() {
        if (this.placeholder) {
            return processStatusColors['UNKNOWN'];
        }
        return processStatusColors[this.status] || processStatusColors['UNKNOWN'];
    }

    startOrStop() {
        if (!this.enabled) {
            return null;
        }
        if (this.placeholder) {
            return null;
        }
        if (this.status === 'RUNNING') {
            return 'stop';
        } else if (this.status === 'STOPPED' || this.status === 'CRASHED') {
            return 'start';
        } else {
            return null;
        }
    }

    startOrStopText() {
        const action = this.startOrStop();
        if (action === 'stop') {
            return api.loc('stop');
        } else if (action === 'start') {
            return api.loc('start');
        } else {
            return api.loc('na');
        }
    }

    canRestart() {
        if (!this.enabled) {
            return false;
        }
        if (this.placeholder) {
            return false;
        }
        return this.status !== 'STOPPING' && this.status !== 'STARTING';
    }

    isPinned() {
        if (this.pinned !== null) {
            return this.pinned;
        }
        let pinned = window.localStorage.getItem('pinnedProcesses');
        if (pinned === null) {
            this.pinned = false;
            return false;
        }
        pinned = JSON.parse(pinned);
        this.pinned = pinned.includes(this.id);
        return this.pinned;
    }

    togglePinned() {
        let pinned = window.localStorage.getItem('pinnedProcesses');
        if (pinned === null) {
            pinned = [];
        } else {
            pinned = JSON.parse(pinned);
        }

        const newPinned = !this.isPinned();
        const existingIndex = pinned.indexOf(this.id);
        if (newPinned) {
            if (existingIndex === -1) {
                pinned.push(this.id);
            }
        } else {
            if (existingIndex !== -1) {
                pinned.splice(existingIndex, 1);
            }
        }

        window.localStorage.setItem('pinnedProcesses', JSON.stringify(pinned));
        this.pinned = newPinned;
        this.rerender(true);
    }

    rerender(useLastCached = false) {
        api.mbCallback(useLastCached);
    }

    programName() {
        if (this.placeholder) {
            return '';
        }
        let path = this.executable_path;

        if (false) {
            let lastSlash = path.lastIndexOf('/');
            if (lastSlash === -1) {
                lastSlash = path.lastIndexOf('\\');
            }
            if (lastSlash === -1) {
                return path;
            }
            return path.substring(lastSlash + 1);
        }
        return path;
    }

    cmdLine() {
        if (this.placeholder) {
            return '';
        }
        let cmdLine = this.programName();
        if (this.arguments) {
            cmdLine += ' ' + this.arguments;
        }
        return cmdLine;
    }

    getConfiguration(key) {
        if (this.configuration === null) {
            return api.getConfiguration(key, this.process_group_id);
        }
        return (
            this.configuration.get(key) ||
            api.getConfiguration(key, this.process_group_id)
        );
    }
}

class GroupInfo {
    constructor(data) {
        if (data === null) {
            this.placeholder = true;
            return;
        }
        if (data instanceof GroupInfo) {
            this.placeholder = data.placeholder;
            this.id = data.id;
            this.name = data.name;
            this.color = data.color;
            this.scripts_configuration = data.scripts_configuration;
            return;
        }
        this.placeholder = false;
        this.id = data.id;
        this.name = data.name;
        this.color = data.color;
        this.scripts_configuration = new Map(
            Object.entries(data.scripts_configuration)
        );
    }

    rgbaColor() {
        if (this.placeholder) {
            return 'rgba(0, 0, 0, 0)';
        }
        let color = this.color;
        if (color === undefined || color === null || color === '') {
            return 'rgba(0, 0, 0, 0)';
        }
        if (color.length === 7) {
            color += 'A0';
        }
        return color;
    }
}

class ApiError extends Error {
    constructor(data) {
        super(data.message_default);
        this.message_default = data.message_default;
        this.details = data.details;
        this.code = data.message_code;
    }

    localedMessage() {
        return api.errLoc(this.code) || this.message_default;
    }

    withDetails() {
        return this.localedMessage() + ' : ' + this.details;
    }
}

class ApiResponse {
    constructor() {
        this.json = null;
        this.text = null;
        this.status = null;
        this.response = null;
    }

    static async create(response, consume = true) {
        const apiResponse = new ApiResponse();
        apiResponse.status = response.status;

        apiResponse.response = response;
        // if request is non-consume, it will still be consumed if it's an error
        if (consume || response.status >= 400) {
            if (
                (response.headers.get('Content-Type') || '')
                    .toLowerCase()
                    .includes('application/json')
            ) {
                try {
                    apiResponse.json = await response.json();
                    apiResponse.text = JSON.stringify(apiResponse.json);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                try {
                    apiResponse.text = await response.text();
                    // Only set `json` if you have a specific need to parse text as JSON here,
                    // otherwise, it might be better to leave it as null or handle accordingly.
                } catch (error) {
                    console.error('Error reading text:', error);
                }
            }
        }

        return apiResponse;
    }

    isErr() {
        return this.status < 200 || this.status >= 400;
    }

    asApiError() {
        if (this.isErr()) {
            if (this.json !== null && this.json.message_code) {
                return new ApiError(this.json);
            }
            return new ApiError({
                message_code: 'unknown_error',
                message_default: 'Unknown error',
                details: this.text,
            });
        }
        return null;
    }
}

const defaultApiConfig = {
    showPopup: true,
    raise_for_status: true,
    do_throw: false,
    consume: true, // if request is non-consume, it will still be consumed if it's an error
};

const configPopupAndThrow = {
    ...defaultApiConfig,
    do_throw: true,
};

class ApiInterface {
    constructor() {
        // this.url = 'http://apepenkov-pc.lan:25812';
        this.url = 'http://localhost:25812';
        this.localeKey = window.localStorage.getItem('locale') || 'en';
        this.authToken = window.localStorage.getItem('authToken');
        this.popUpCallback = null;
        this.cardsChangedCallbackDashboard = null;
        this.cardsChangedCallbackNavbar = null;
        this.groupsChangedProcessEditCallback = null;
        this.lastGroupedProcesses = null;

        this.ticker();
    }

    // a ticker that calls this.mbCallback() every 10 seconds
    ticker() {
        if (
            this.cardsChangedCallbackDashboard ||
            this.cardsChangedCallbackNavbar ||
            this.groupsChangedProcessEditCallback
        ) {
            this.mbCallbackAsync().finally(() => {
                setTimeout(() => {
                    this.ticker();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                this.ticker();
            }, 1000);
        }
    }

    setPopUpCallback(callback) {
        this.popUpCallback = callback;
    }

    showPopUp(message) {
        this.popUpCallback(message, this.loc('close'), 'danger');
    }

    loc() {
        if (arguments.length === 0) {
            throw new Error('No arguments');
        }
        // any amount of arguments
        let curr = locales[this.localeKey] || locales['en'];
        let path = '';
        for (let i = 0; i < arguments.length; i++) {
            path += [arguments][i] + '.';
        }
        path = path.substring(0, path.length - 1);
        for (let i = 0; i < arguments.length; i++) {
            curr = curr[arguments[i]];
            if (curr === undefined) {
                return '#missing_locale#' + path;
            }
        }
        if (typeof curr === 'string') {
            return curr;
        }
        throw new Error('Invalid locale');
    }

    errLoc(key) {
        return this.loc('errors', key);
    }

    valLoc(key) {
        return this.loc('validators', key);
    }

    // TODO: allow for params
    async request(
        method,
        path,
        requestConfig = defaultApiConfig,
        json = null,
        params = null
    ) {
        if (json === undefined) {
            json = null;
        }
        const headers = {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
        };
        if (this.authToken) {
            headers['X-Auth-Key'] = this.authToken;
        }
        if (json !== null) {
            headers['Content-Type'] = 'application/json';
        }

        let response;

        const fullUrl = new URL(this.url + path);
        if (params) {
            Object.keys(params).forEach((key) =>
                fullUrl.searchParams.append(key, params[key])
            );
        }

        try {
            response = await fetch(fullUrl, {
                mode: 'cors',
                method: method,
                headers: headers,
                body: json ? JSON.stringify(json) : null,
            });
        } catch (e) {
            console.log('Error making request: ' + e);
            requestConfig.showPopup &&
            this.showPopUp(this.loc('error_making_request') + e.toString());
            if (requestConfig.do_throw) {
                throw new Error(e);
            } else {
                return null;
            }
        }

        let apiResponse;
        try {
            apiResponse = await ApiResponse.create(response, requestConfig.consume);
        } catch (e) {
            console.error('Error creating ApiResponse:', e);
            requestConfig.showPopup &&
            this.showPopUp(this.loc('error_making_request') + e.toString());
            if (requestConfig.do_throw) {
                throw new Error(e);
            } else {
                return null;
            }
        }

        if (
            !requestConfig.raise_for_status ||
            (200 <= response.status && response.status < 400)
        ) {
            return apiResponse;
        } else {
            try {
                requestConfig.showPopup &&
                this.showPopUp(apiResponse.asApiError().withDetails());
            } catch (e) {
                requestConfig.showPopup &&
                this.showPopUp(this.loc('unknown_error') + apiResponse.text);
            }

            if (requestConfig.do_throw) {
                if (apiResponse.isErr() && apiResponse.asApiError() !== null) {
                    throw apiResponse.asApiError();
                } else {
                    throw new Error(response.status + ' ' + response.statusText);
                }
            }
        }
    }

    async checkAuth() {
        let res = await this.request('GET', '/check_auth', {
            ...defaultApiConfig,
            raise_for_status: false,
        });
        if (res === null) {
            return null;
        }
        if (res.status === 200) {
            return true;
        } else if (res.status === 401) {
            return false;
        }
        this.showPopUp(this.loc('unknown_error') + res.status + ' ' + res.text);
        return null;
    }

    save() {
        window.localStorage.setItem('authToken', this.authToken);
        window.localStorage.setItem('locale', this.localeKey);
    }

    async getProcesses() {
        let res = await this.request('GET', '/processes');
        if (res === null) {
            return null;
        }
        return res.json;
    }

    async getGroups() {
        let res = await this.request('GET', '/groups');
        if (res === null) {
            return null;
        }
        return res.json;
    }

    async getGroupedProcesses(useCache = false) {
        if (useCache === true && this.lastGroupedProcesses !== null) {
            return this.lastGroupedProcesses;
        }
        let taskProcesses = this.getProcesses();
        let taskGroups = this.getGroups();

        let processes, groups;
        [processes, groups] = await Promise.all([taskProcesses, taskGroups]);

        if (processes === null || groups === null) {
            return null;
        }
        processes = processes.processes;
        let groupsDict = {};
        for (let group of groups) {
            groupsDict[group.id] = new GroupInfo(group);
        }
        this.lastGroupedProcesses = {
            processes: processes.map((p) => new ProcessInfo(p)),
            groups: groupsDict,
        };
        return this.lastGroupedProcesses;
    }

    setCardsChangedCallbackDashboard(callback) {
        this.cardsChangedCallbackDashboard = callback;
    }

    setCardsChangedCallbackNavbar(callback) {
        this.cardsChangedCallbackNavbar = callback;
    }

    setGroupsChangedProcessEditCallback(callback) {
        this.groupsChangedProcessEditCallback = callback;
    }

    async mbCallbackAsync(useLastCached = false) {
        if (useLastCached) {
            if (this.lastGroupedProcesses !== null) {
                this.cardsChangedCallbackDashboard !== null &&
                this.cardsChangedCallbackDashboard(this.lastGroupedProcesses);
                this.cardsChangedCallbackNavbar !== null &&
                this.cardsChangedCallbackNavbar(this.lastGroupedProcesses);
                this.groupsChangedProcessEditCallback !== null &&
                this.groupsChangedProcessEditCallback(this.lastGroupedProcesses);
            }
        } else {
            const data = await this.getGroupedProcesses();
            this.cardsChangedCallbackDashboard !== null &&
            this.cardsChangedCallbackDashboard(data);
            this.cardsChangedCallbackNavbar !== null &&
            this.cardsChangedCallbackNavbar(data);
            this.groupsChangedProcessEditCallback !== null &&
            this.groupsChangedProcessEditCallback(data);
        }
    }

    mbCallback(useLastCached = false) {
        if (useLastCached) {
            if (this.lastGroupedProcesses !== null) {
                this.cardsChangedCallbackDashboard !== null &&
                this.cardsChangedCallbackDashboard(this.lastGroupedProcesses);
                this.cardsChangedCallbackNavbar !== null &&
                this.cardsChangedCallbackNavbar(this.lastGroupedProcesses);
                this.groupsChangedProcessEditCallback !== null &&
                this.groupsChangedProcessEditCallback(this.lastGroupedProcesses);
            }
        } else {
            this.getGroupedProcesses().then((data) => {
                this.cardsChangedCallbackDashboard !== null &&
                this.cardsChangedCallbackDashboard(data);
                this.cardsChangedCallbackNavbar !== null &&
                this.cardsChangedCallbackNavbar(data);
                this.groupsChangedProcessEditCallback !== null &&
                this.groupsChangedProcessEditCallback(data);
            });
        }
    }

    async createProcess(processData) {
        try {
            const res = await this.request(
                'POST',
                '/processes',
                configPopupAndThrow,
                processData
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }

    async createGroup(groupData) {
        try {
            const res = await this.request(
                'POST',
                '/groups',
                configPopupAndThrow,
                groupData
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }

    async startProcess(processId) {
        try {
            const res = await this.request(
                'POST',
                '/processes/by_id/' + processId + '/start',
                configPopupAndThrow
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }

    async stopProcess(processId) {
        try {
            const res = await this.request(
                'POST',
                '/processes/by_id/' + processId + '/stop',
                configPopupAndThrow
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }

    async restartProcess(processId) {
        try {
            const res = await this.request(
                'POST',
                '/processes/by_id/' + processId + '/restart',
                configPopupAndThrow
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }

    async getProcessStats(processId, from = null, to = null) {
        let url = '/processes/by_id/' + processId + '/stats';
        const params = {};
        if (from) {
            params.from = from.toISOString();
        }
        if (to) {
            params.to = to.toISOString();
        }
        try {
            return await this.request('GET', url, configPopupAndThrow, null, params);
        } catch (e) {
            return null;
        }
    }

    async getProcessEvents(processId, from = null, to = null, limit = 30) {
        let url = '/processes/by_id/' + processId + '/events';
        const params = {};
        if (from) {
            params.from = from.toISOString();
        }
        if (to) {
            params.to = to.toISOString();
        }
        params.limit = limit;
        try {
            return await this.request('GET', url, configPopupAndThrow, null, params);
        } catch (e) {
            return null;
        }
    }

    async fetchDefaultConfiguration() {
        try {
            const res = await this.request(
                'GET',
                '/default_config',
                configPopupAndThrow
            );
            defaultSeverConfiguration.clear();
            for (const [key, value] of Object.entries(res.json)) {
                defaultSeverConfiguration.set(key, value);
            }
        } catch (e) {
            return null;
        }
    }

    _internalGetConfigurationWithFallback = (key) => {
        return defaultSeverConfiguration.get(key) || fallbackConfiguration.get(key);
    };

    getConfiguration(key, targetGroup = null) {
        if (targetGroup === null || this.lastGroupedProcesses === null) {
            return this._internalGetConfigurationWithFallback(key);
        }

        // It's expected that cache is already built.
        let foundGroup = null;
        for (const [groupId, group] of Object.entries(
            this.lastGroupedProcesses.groups
        )) {
            // noinspection EqualityComparisonWithCoercionJS
            if (groupId == targetGroup) {
                foundGroup = group;
                break;
            }
        }

        if (foundGroup === null) {
            return this._internalGetConfigurationWithFallback(key);
        }

        let groupConfig = foundGroup.scripts_configuration;
        if (groupConfig === null) {
            return this._internalGetConfigurationWithFallback(key);
        }

        return (
            groupConfig.get(key) || this._internalGetConfigurationWithFallback(key)
        );
    }

    validate(where, what, value) {
        if (validators[where] === undefined) {
            throw new Error('Invalid where');
        }
        if (validators[where][what] === undefined) {
            throw new Error('Invalid what');
        }
        if (validators[where][what](value)[0] === false) {
            return this.valLoc(validators[where][what](value)[1]);
        }
        return null;
    }

    async getProcessLogs(processId, from = null, to = null) {
        let url = '/processes/by_id/' + processId + '/logs';
        const params = {};
        if (from) {
            params.from = from.toISOString();
        }
        if (to) {
            params.to = to.toISOString();
        }
        try {
            return await this.request('GET', url, configPopupAndThrow, null, params);
        } catch (e) {
            return null;
        }
    }

    async putStdin(processId, data) {
        try {
            return await this.request(
                'PUT',
                '/processes/by_id/' + processId + '/stdin',
                configPopupAndThrow,
                {
                    text: data,
                }
            );
        } catch (e) {
            return null;
        }
    }

    async downloadLogsZipFile(processId, from = null, to = null) {
        let url = '/processes/by_id/' + processId + '/export_logs';
        const params = {};
        if (from) {
            params.from = from.toISOString();
        }
        if (to) {
            params.to = to.toISOString();
        }
        try {
            return await this.request(
                'GET',
                url,
                {...configPopupAndThrow, consume: false},
                null,
                params
            );
        } catch (e) {
            return null;
        }
    }

    async editProcess(processId, processData) {
        try {
            const res = await this.request(
                'PATCH',
                '/processes/by_id/' + processId,
                configPopupAndThrow,
                processData
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }
}

function adjustBrightnessWithAlpha(hex, percent) {
    // Ensure hex is a string and remove any non-hex characters
    hex = String(hex).replace(/[^0-9a-f]/gi, '');

    // Extract RGBA components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    let a = parseInt(hex.substring(6, 8), 16);

    // Calculate the adjustment for RGB components (not adjusting alpha)
    const difference = Math.round(percent * 255);
    r = Math.max(0, Math.min(255, r + difference));
    g = Math.max(0, Math.min(255, g + difference));
    b = Math.max(0, Math.min(255, b + difference));

    // Convert adjusted components back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');
    a = a.toString(16).padStart(2, '0'); // Keep alpha unchanged

    return `#${r}${g}${b}${a}`;
}

function buildGradient(from, percent = -0.2) {
    let to;
    if (
        from === undefined ||
        from === null ||
        from === '' ||
        from === '#00000000'
    ) {
        // return a solid color
        to = '#00000000';
        from = '#00000000';
    } else {
        to = adjustBrightnessWithAlpha(from, percent);
    }
    return `linear-gradient(135deg, ${from}, ${to})`;
}

const rgbaToHex = (rgba) => {
    const {r, g, b, a} = rgba;
    // we also must prefix the hex value with a '#' symbol
    // and each component with a 2 digit zero-padded hex value
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}${Math.round(
        a * 255
    )
        .toString(16)
        .padStart(2, '0')}`;
};

const hexToRgba = (hex) => {
    // we remove the '#' symbol if it exists
    hex = hex.replace('#', '');
    // we separate the RGB components
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = parseInt(hex.substring(6, 8), 16) / 255;
    return {r, g, b, a};
};

const api = new ApiInterface();
export default api;
window.api = api;

export {ProcessInfo, buildGradient, GroupInfo, rgbaToHex, hexToRgba};