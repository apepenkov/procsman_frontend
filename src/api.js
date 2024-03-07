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
            executable_not_executable: "Executable isn't executable",
            invalid_time_frame: 'Invalid time frame',
            invalid_limit: 'Invalid limit',
            text_required: 'Text required',
        },
        validators: {
            auto_restart_max_retries_invalid: 'Auto restart max retries invalid: must be an integer greater than 0 and less than 100',
            auto_restart_max_retries_frame_invalid: 'Auto restart max retries frame invalid: must be an integer greater than 0 and less than 1800',
            auto_restart_delay_invalid: 'Auto restart delay invalid: must be an integer greater than 0 and less than 180000',
            process_name_required: 'Process name required',
            group_name_required: 'Group name required',
            executable_required: 'Executable path required',
        },
        guide: {
            pinned_processes: "You can click on a pin icon to add process to the top of the dashboard. It's saved in your browser.",
            processes_no_group: 'Processes without a group will be shown here.',
            all_processes: 'All processes will be shown here.',
            group_name: 'You can select a group and click on it again to edit it.',
            search: 'You can search for a process by part of its name or command line. Processes, not matching the search, will be hidden.',
            add_process: 'You can add a new process by clicking this button.',
            settings: "You can change language and process mode (cards or table) in the settings.",
        },
        events: {
            UNKNOWN: "Unknown",
            START: "Start",
            STOP: "Stop",
            CRASH: "Crash",
            FULL_STOP: "Full stop",
            FULL_CRASH: "Full crash",
            MANUALLY_STOPPED: "Manually stopped",
            RESTART: "Restart",
        },
        status: {
            RUNNING: "Running",
            STOPPED: "Stopped",
            CRASHED: "Crashed",
            STARTING: "Starting",
            STOPPING: "Stopping",
            STOPPED_WILL_RESTART: "Stopped, will restart",
            CRASHED_WILL_RESTART: "Crashed, will restart",
            UNKNOWN: "Unknown",
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
        login: 'Login',
        pinned_processes: 'Pinned processes',
        no_pin_processes: 'No pinned processes',
        all_processes: 'All processes',
        no_group: 'No Group',
        all: 'All',
        group_name_required: 'Group name required',
        editing_group: 'Editing group: ',
        group_name: 'Group name',
        enter_group_name: 'Enter group name',
        group_color: 'Group color',
        default_configuration: 'Default configuration for processes within group',
        auto_restart_on_stop: 'Automatically restart when stopped (exit 0)',
        auto_restart_on_crash: 'Automatically restart when crashed (exit non-0)',
        max_retries: 'Max retries',
        restart_timeframe: "Retry Timeframe (seconds) - time window, within which \"Max Retries\" is counted. When 0, it's ignored.",
        restart_delay: 'Retry Delay (milliseconds) - time to wait before retrying',
        notify_on_crash: 'Notify on crash',
        notify_on_restart: 'Notify on restart',
        notify_on_start: 'Notify on start',
        notify_on_stop: 'Notify on stop',
        save: 'Save',
        notifications: 'Notifications',
        enable_disable_notifications: 'Enable/Disable notifications',
        enabled: 'Enabled',
        disabled: 'Disabled',
        telegram_bot_token: 'Telegram bot token',
        enter_bot_token: 'Enter bot token',
        chat_ids: 'Chat IDs',
        chat_id: 'Chat ID',
        remove: 'Remove',
        add_chat_id: 'Add chat id',
        dashboard: 'Dashboard',
        add_process: 'Add process',
        add_group: 'Add group',
        notification_settings: 'Notification settings',
        settings: 'Settings',
        logout: 'Logout',
        create_group: 'Create group',
        create: 'Create',
        process_name_required: 'Process name required',
        executable_path_required: 'Executable path required',
        the_process_will_not_stop_restarting: 'The process will never stop retrying, because it can retry {auto_restart_max_retries_within_timeframe} times within the timeframe of {timeframe} seconds with the delay of {auto_restart_delay} milliseconds. Click "Create" again to confirm.',
        new_process: 'New process',
        process_name: 'Process name',
        enter_process_name: 'Enter process name',
        process_status: 'Process status',
        executable_path: 'Executable path',
        enter_executable_path: 'Enter executable path',
        arguments: 'Arguments',
        enter_arguments: 'Enter arguments',
        working_directory: 'Working directory',
        enter_working_directory: 'Enter working directory',
        color: 'Color',
        group: 'Group',
        add_new: 'Add new',
        environment_variables: 'Environment variables',
        environment_variable: 'Environment variable',
        value: 'Value',
        add_variable: 'Add variable',
        configuration: 'Configuration',
        show_details: 'Show details',
        details_for: 'Details for',
        status_resources_events: 'Status, resources, events',
        logs: 'Logs',
        text_to_send_to_stdin: '> Text to send to stdin',
        send_to_stdin: 'Send to stdin',
        refresh_logs: 'Refresh logs',
        download_logs: 'Download logs',
        from: 'From',
        to: 'To',
        please_enter_valid_dt: 'Please enter a valid date and time.',
        search_logs: 'Search logs...',
        case_sensitive: 'Case sensitive',
        regex: 'Regex',
        collapse: 'Collapse',
        expand: 'Expand',
        full: 'Full',
        collapsed: 'Collapsed',
        timestamp: 'Timestamp',
        event_type: 'Event type',
        refresh: 'Refresh',
        events_last_30_days: 'Events (last 30): ',
        refresh_events: 'Refresh events',
        cpu_usage: 'CPU usage (% of whole system)',
        ram_usage: 'RAM usage (MB)',
        key: 'Key',
        search_placeholder: 'Search for process: part of process name or cmd line',
        guide_mode: 'Guide mode',
        process_cmd: 'Process cmd',
        process_enabled: 'Is enabled',
        process_actions: 'Actions',
        select_mode: 'Select mode',
        card_mode: 'Card mode',
        table_mode: 'Table mode',
        switch_theme: 'Switch theme',
        delete: 'Delete',
        record_stats: 'Record stats',
        store_logs: 'Store logs',
    },
    ru: {
        errors: {
            process_not_found: "Процесс не найден",
            error_getting_process: "Ошибка получения процесса",
            no_id_provided: "Не указан id",
            invalid_id: "Неверный id",
            invalid_request: "Неверный запрос",
            name_required: "Требуется имя",
            executable_required: "Требуется исполняемый файл",
            executable_not_found: "Исполняемый файл не найден",
            executable_not_file: "Исполняемый файл не является файлом",
            wd_not_found: "Рабочая директория не найдена",
            wd_not_dir: "Рабочая директория не является директорией",
            invalid_group: "Неверная группа",
            group_already_exists: "Группа уже существует",
            invalid_color: "Неверный цвет",
            could_not_create_process: "Не удалось создать процесс",
            process_not_running: "Процесс не запущен",
            internal_error: "Внутренняя ошибка",
            could_not_create_group: "Не удалось создать группу",
            group_not_found: "Группа не найдена",
            executable_not_executable: "Исполняемый файл не является исполняемым",
            invalid_time_frame: "Неверный временной промежуток",
            invalid_limit: "Неверный лимит",
            text_required: "Требуется текст"
        },
        validators: {
            auto_restart_max_retries_invalid: "Максимальное количество попыток перезапуска недопустимо: должно быть целым числом больше 0 и меньше 100",
            auto_restart_max_retries_frame_invalid: "Неверный временной промежуток для максимального количества попыток перезапуска: должен быть целым числом больше 0 и меньше 1800",
            auto_restart_delay_invalid: "Неверная задержка перезапуска: должна быть целым числом больше 0 и меньше 180000",
            process_name_required: "Требуется имя процесса",
            group_name_required: "Требуется имя группы",
            executable_required: "Требуется путь к исполняемому файлу"
        },
        guide: {
            pinned_processes: "Вы можете нажать на значок булавки, чтобы добавить процесс в верхнюю часть панели инструментов. Он сохраняется в вашем браузере.",
            processes_no_group: "Процессы без группы будут показаны здесь.",
            all_processes: "Все процессы будут показаны здесь.",
            group_name: "Вы можете выбрать группу и снова нажать на нее, чтобы отредактировать ее.",
            search: "Вы можете искать процесс по части его имени или командной строки. Процессы, не соответствующие поиску, будут скрыты.",
            add_process: "Вы можете добавить новый процесс, нажав эту кнопку.",
            settings: "Вы можете изменить язык и режим процесса (карточки или таблица) в настройках."
        },
        events: {
            UNKNOWN: "Неизвестно",
            START: "Запуск",
            STOP: "Остановка",
            CRASH: "Сбой",
            FULL_STOP: "Полная остановка",
            FULL_CRASH: "Полный сбой",
            MANUALLY_STOPPED: "Остановлен вручную",
            RESTART: "Перезапуск"
        },
        status: {
            RUNNING: "Запущен",
            STOPPED: "Остановлен",
            CRASHED: "Сбой",
            STARTING: "Запуск",
            STOPPING: "Остановка",
            STOPPED_WILL_RESTART: "Остановлен, будет перезапущен",
            CRASHED_WILL_RESTART: "Сбой, будет перезапущен",
            UNKNOWN: "Неизвестно",
        },
        close: "Закрыть",
        unknown_error: "Неизвестная ошибка, статус:",
        error_making_request: "Ошибка при выполнении запроса: ",
        auth_key: "Ключ аутентификации",
        invalid_auth_key: "Неверный ключ аутентификации",
        enter_auth_key: "Введите ключ авторизации",
        start: "Старт",
        stop: "Стоп",
        restart: "Перезапуск",
        na: "Н/Д",
        login: "Войти",
        pinned_processes: "Закрепленные процессы",
        no_pin_processes: "Нет закрепленных процессов",
        all_processes: "Все процессы",
        no_group: "Без группы",
        all: "Все",
        group_name_required: "Требуется имя группы",
        editing_group: "Редактирование группы: ",
        group_name: "Имя группы",
        enter_group_name: "Введите имя группы",
        group_color: "Цвет группы",
        default_configuration: "Конфигурация по умолчанию для процессов в группе",
        auto_restart_on_stop: "Автоматический перезапуск при остановке (выход 0)",
        auto_restart_on_crash: "Автоматический перезапуск при сбое (выход не 0)",
        max_retries: "Максимальное количество попыток",
        restart_timeframe: "Временной промежуток перезапуска (секунды) - временное окно, в течение которого учитывается 'Максимальное количество попыток'. Если 0, игнорируется.",
        restart_delay: "Задержка перед повторной попыткой (миллисекунды) - время ожидания перед повторным запуском",
        notify_on_crash: "Уведомлять при сбое",
        notify_on_restart: "Уведомлять при перезапуске",
        notify_on_start: "Уведомлять при запуске",
        notify_on_stop: "Уведомлять при остановке",
        save: "Сохранить",
        notifications: "Уведомления",
        enable_disable_notifications: "Включить/Отключить уведомления",
        enabled: "Включено",
        disabled: "Отключено",
        telegram_bot_token: "Токен бота Telegram",
        enter_bot_token: "Введите токен бота",
        chat_ids: "ID чатов",
        chat_id: "ID чата",
        remove: "Удалить",
        add_chat_id: "Добавить ID чата",
        dashboard: "Панель управления",
        add_process: "Добавить процесс",
        add_group: "Добавить группу",
        notification_settings: "Настройки уведомлений",
        settings: "Настройки",
        logout: "Выйти",
        create_group: "Создать группу",
        create: "Создать",
        process_name_required: "Требуется имя процесса",
        executable_path_required: "Требуется путь к исполняемому файлу",
        the_process_will_not_stop_restarting: "Процесс никогда не перестанет перезапускаться, потому что он может перезапускаться {auto_restart_max_retries_within_timeframe} раз в течение времени {timeframe} секунд с задержкой {auto_restart_delay} миллисекунд. Нажмите «Создать» еще раз, чтобы подтвердить.",
        new_process: "Новый процесс",
        process_name: "Имя процесса",
        enter_process_name: "Введите имя процесса",
        process_status: "Статус процесса",
        executable_path: "Путь к исполняемому файлу",
        enter_executable_path: "Введите путь к исполняемому файлу",
        arguments: "Аргументы",
        enter_arguments: "Введите аргументы",
        working_directory: "Рабочая директория",
        enter_working_directory: "Введите рабочую директорию",
        color: "Цвет",
        group: "Группа",
        add_new: "Добавить новое",
        environment_variables: "Переменные окружения",
        environment_variable: "Переменная окружения",
        value: "Значение",
        add_variable: "Добавить переменную",
        configuration: "Конфигурация",
        show_details: "Показать детали",
        details_for: "Детали для",
        status_resources_events: "Статус, ресурсы, события",
        logs: "Журналы",
        text_to_send_to_stdin: "> Текст для отправки в stdin",
        send_to_stdin: "Отправить в stdin",
        refresh_logs: "Обновить журналы",
        download_logs: "Скачать журналы",
        from: "От",
        to: "До",
        please_enter_valid_dt: "Пожалуйста, введите действительные дату и время.",
        search_logs: "Поиск в журналах...",
        case_sensitive: "С учетом регистра",
        regex: "Регулярное выражение",
        collapse: "Свернуть",
        expand: "Развернуть",
        full: "Полный",
        collapsed: "Свернутый",
        timestamp: "Временная метка",
        event_type: "Тип события",
        refresh: "Обновить",
        events_last_30_days: "События (последние 30): ",
        refresh_events: "Обновить события",
        cpu_usage: "Использование ЦПУ (% от всей системы)",
        ram_usage: "Использование ОЗУ (МБ)",
        key: "Ключ",
        search_placeholder: "поиск процесса: часть имени процесса или командной строки",
        guide_mode: "Режим помощи",
        process_cmd: "Команда процесса",
        process_enabled: "Включен",
        process_actions: "Действия",
        select_mode: "Выберите режим",
        card_mode: "Режим карточек",
        table_mode: "Режим таблицы",
        switch_theme: "Переключить тему",
        delete: "Удалить",
        record_stats: "Запись статистики",
        store_logs: "Хранение журналов",
    }
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

function formatString(template, values) {
    return template.replace(/\{(\w+)\}/g, (placeholder, key) => {
        return typeof values[key] !== 'undefined' ? values[key] : placeholder;
    });
}

// ('RUNNING', 'STOPPED', 'CRASHED', 'STARTING', 'STOPPING', 'STOPPED_WILL_RESTART', 'CRASHED_WILL_RESTART', 'UNKNOWN');
const processStatusColors = {
    RUNNING: '#71ab71',
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
        auto_restart_on_stop: true,
        auto_restart_on_crash: true,

        auto_restart_max_retries: 3,
        auto_restart_max_retries_frame: 60,
        auto_restart_delay: 5000,

        notify_on_start: true,
        notify_on_stop: true,
        notify_on_crash: true,
        notify_on_restart: true,

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

    localizedStatus() {
        return api.loc('status', this.status);
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
        if (this.configuration.get(key) === undefined) {
            return api.getConfiguration(key, this.process_group_id);
        }
        return this.configuration.get(key);
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
        this.url = process.env.REACT_APP_API_ENDPOINT;
        this.localeKey = window.localStorage.getItem('locale') || 'en';
        this.authToken = window.localStorage.getItem('authToken');
        const savedCardMode = window.localStorage.getItem('cardMode');
        if (savedCardMode === null) {
            // if we're on mobile, set card mode, on desktop, set table mode
            this.isCardMode = window.innerWidth < 768;
        } else {
            this.isCardMode = savedCardMode !== 'false';
        }
        this.theme = window.localStorage.getItem('theme') || 'dark';
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

    cardMode() {
        return this.isCardMode;
    }

    setCardMode(cardMode) {
        this.isCardMode = cardMode;
        window.localStorage.setItem('cardMode', cardMode);
        this.mbCallback();
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
            path += arguments[i] + '.';
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
            showPopup: false,
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
        window.localStorage.setItem('cardMode', this.isCardMode);
        window.localStorage.setItem('theme', this.theme);
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

    async editGroup(groupId, groupData) {
        try {
            const res = await this.request(
                'PATCH',
                '/groups/by_id/' + groupId,
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
                {
                    ...defaultApiConfig,
                    raise_for_status: false,
                    showPopup: false,
                }
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
        if (groupConfig.get(key) === undefined) {
            return this._internalGetConfigurationWithFallback(key);
        }
        return groupConfig.get(key);
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

    async getNotificationConfig() {
        try {
            return await this.request('GET', '/notification_config');
        } catch (e) {
            return null;
        }
    }

    async setNotificationConfig(config) {
        try {
            return await this.request(
                'PATCH',
                '/notification_config',
                configPopupAndThrow,
                config
            );
        } catch (e) {
            return null;
        }
    }

    async deleteGroup(groupId) {
        try {
            const res = await this.request(
                'DELETE',
                '/groups/by_id/' + groupId,
                configPopupAndThrow
            );
            await this.mbCallback();
            return res;
        } catch (e) {
            return null;
        }
    }

    async deleteProcess(processId) {
        try {
            const res = await this.request(
                'DELETE',
                '/processes/by_id/' + processId,
                configPopupAndThrow
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

export {ProcessInfo, buildGradient, GroupInfo, rgbaToHex, hexToRgba, formatString};
