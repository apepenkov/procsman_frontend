import React, {useState} from 'react';
import {Button, Form, Modal, Table} from 'react-bootstrap';
import {X} from 'react-bootstrap-icons'; // Importing icons
import api, {rgbaToHex, formatString} from '../api';
import {SketchPicker} from 'react-color';
import LoadingSpinner from '../loadingSpinner';

const NewProcessModal = ({show, handleClose, groups}) => {
    const [processColor, setProcessColor] = useState({
        r: 255,
        g: 255,
        b: 255,
        a: 0.8,
    });
    const [envVars, setEnvVars] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [doCreateGroup, setDoCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState({
        r: 255,
        g: 255,
        b: 255,
        a: 0.8,
    });
    const [formErrors, setFormErrors] = useState({});

    const removeFormError = (key) => {
        const newFormErrors = {...formErrors};
        delete newFormErrors[key];
        setFormErrors(newFormErrors);
    };

    const addFormError = (key, value) => {
        const newFormErrors = {...formErrors};
        newFormErrors[key] = value;
        setFormErrors(newFormErrors);
    };

    const [
        addProcessNewGroupColorPickerShown,
        setAddProcessNewGroupColorPickerShown,
    ] = useState(false);

    const [processColorPickerShown, setProcessColorPickerShown] = useState(false);

    const [processName, setProcessName] = useState('');
    const [executablePath, setExecutablePath] = useState('');
    const [workingDirectory, setWorkingDirectory] = useState('');
    const [programArguments, setProgramArguments] = useState('');
    const [enabled, setEnabled] = useState(true);

    // configuration
    const [autoRestartOnStop, setAutoRestartOnStop] = useState(
        api.getConfiguration('auto_restart_on_stop')
    );
    const [autoRestartOnCrash, setAutoRestartOnCrash] = useState(
        api.getConfiguration('auto_restart_on_crash')
    );
    const [autoRestartMaxRetries, setAutoRestartMaxRetries] = useState(
        api.getConfiguration('auto_restart_max_retries')
    );
    const [autoRestartMaxRetriesFrame, setAutoRestartMaxRetriesFrame] = useState(
        api.getConfiguration('auto_restart_max_retries_frame')
    );
    const [autoRestartDelay, setAutoRestartDelay] = useState(
        api.getConfiguration('auto_restart_delay')
    );
    const [notifyOnCrash, setNotifyOnCrash] = useState(
        api.getConfiguration('notify_on_crash')
    );
    const [notifyOnStop, setNotifyOnStop] = useState(
        api.getConfiguration('notify_on_stop')
    );
    const [notifyOnStart, setNotifyOnStart] = useState(
        api.getConfiguration('notify_on_start')
    );
    const [notifyOnRestart, setNotifyOnRestart] = useState(
        api.getConfiguration('notify_on_restart')
    );

    // UNUSED
    const [recordStats, setRecordStats] = useState(
        api.getConfiguration('record_stats')
    );
    const [storeLogs, setStoreLogs] = useState(
        api.getConfiguration('store_logs')
    );

    const [savingProcess, setSavingProcess] = useState(false);

    const handleEnvVarChange = (index, key, value) => {
        const newEnvVars = [...envVars];
        if (key !== undefined) {
            newEnvVars[index].key = key;
        } else if (value !== undefined) {
            newEnvVars[index].value = value;
        }
        setEnvVars(newEnvVars);
    };

    const addEnvVar = () => {
        setEnvVars([...envVars, {key: '', value: ''}]);
    };

    const removeEnvVar = (index) => {
        const newEnvVars = [...envVars];
        newEnvVars.splice(index, 1);
        setEnvVars(newEnvVars);
    };

    const CreateProcess = (doCreate = false) => {
        const NewProcessParams = {
            name: processName,
            executable_path: executablePath,
            arguments: programArguments,
            color: rgbaToHex(processColor),
            working_dir: workingDirectory,
            environment: envVars.reduce((acc, envVar) => {
                if (envVar.key && envVar.value) {
                    acc[envVar.key] = envVar.value;
                }
                return acc;
            }, {}),
            enabled: enabled,
            create_new_group: false,
            new_group: {},
            config: {
                auto_restart_on_stop: autoRestartOnStop,
                auto_restart_on_crash: autoRestartOnCrash,

                auto_restart_max_retries: parseInt(autoRestartMaxRetries),
                auto_restart_max_retries_frame: parseInt(autoRestartMaxRetriesFrame),
                auto_restart_delay: parseInt(autoRestartDelay),

                notify_on_start: notifyOnStart,
                notify_on_stop: notifyOnStop,
                notify_on_crash: notifyOnCrash,
                notify_on_restart: notifyOnRestart,

                record_stats: recordStats,
                store_logs: storeLogs,
            },
        };

        if (doCreateGroup) {
            NewProcessParams.new_group = {
                name: newGroupName,
                color: rgbaToHex(newGroupColor),
            };
            NewProcessParams.create_new_group = true;
            NewProcessParams.group_id = null;
        } else {
            NewProcessParams.group_id = selectedGroupId
                ? parseInt(selectedGroupId)
                : null;
        }

        const errors = {};
        // validation:
        if (!NewProcessParams.name) {
            errors.processName = api.loc("process_name_required");
        }

        if (!NewProcessParams.executable_path) {
            errors.executablePath = api.loc("executable_path_required");
        }

        const maxRetriesErr = api.validate(
            'configuration',
            'auto_restart_max_retries',
            NewProcessParams.config.auto_restart_max_retries
        );
        if (maxRetriesErr !== null) {
            errors.processRestartMaxRetries = maxRetriesErr;
        }

        const maxRetriesFrameErr = api.validate(
            'configuration',
            'auto_restart_max_retries_frame',
            NewProcessParams.config.auto_restart_max_retries_frame
        );
        if (maxRetriesFrameErr !== null) {
            errors.processRestartTimeFrame = maxRetriesFrameErr;
        }

        const maxRetriesDelayErr = api.validate(
            'configuration',
            'auto_restart_delay',
            NewProcessParams.config.auto_restart_delay
        );
        if (maxRetriesDelayErr !== null) {
            errors.processRestartDelay = maxRetriesDelayErr;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        // warn user, if the retry configuration will not ever stop
        const auto_restart_max_retries_within_timeframe = Math.floor(
            (NewProcessParams.config.auto_restart_max_retries_frame * 1000) /
            NewProcessParams.config.auto_restart_delay
        );
        const wasWarned =
            formErrors.warned_about_auto_restart_max_retries !== undefined;

        if (
            auto_restart_max_retries_within_timeframe <
            NewProcessParams.config.auto_restart_max_retries
        ) {
            if (!wasWarned) {
                errors.warned_about_auto_restart_max_retries = true;
                errors.processRestartMaxRetries = formatString(api.loc("the_process_will_not_stop_restarting"), {auto_restart_max_retries_within_timeframe: auto_restart_max_retries_within_timeframe, timeframe: NewProcessParams.config.auto_restart_max_retries_frame, auto_restart_delay: NewProcessParams.config.auto_restart_delay});
                setFormErrors(errors);
                return;
            }
        }

        setFormErrors({});

        setSavingProcess(true);
        if (doCreate) {
            api
                .createProcess(NewProcessParams)
                .then((r) => {
                    if (r !== null && r !== undefined && !r.isErr()) {
                        handleClose('newProcess')();
                        // reset form
                        setEnvVars([]);
                        setSelectedGroupId(null);
                        setDoCreateGroup(false);
                        setNewGroupName('');
                        setNewGroupColor({r: 255, g: 255, b: 255, a: 0.8});
                        setProcessColor({r: 255, g: 255, b: 255, a: 0.8});
                        setProcessName('');
                        setExecutablePath('');
                        setProgramArguments('');
                        setWorkingDirectory('');
                        setEnabled(true);
                        setAutoRestartOnStop(
                            api.getConfiguration('auto_restart_on_stop')
                        );
                        setAutoRestartOnCrash(
                            api.getConfiguration('auto_restart_on_crash')
                        );
                        setAutoRestartMaxRetries(
                            api.getConfiguration('auto_restart_max_retries')
                        );
                        setAutoRestartMaxRetriesFrame(
                            api.getConfiguration('auto_restart_max_retries_frame')
                        );
                        setAutoRestartDelay(api.getConfiguration('auto_restart_delay'));
                        setNotifyOnCrash(api.getConfiguration('notify_on_crash'));
                        setNotifyOnStop(api.getConfiguration('notify_on_stop'));
                        setNotifyOnStart(api.getConfiguration('notify_on_start'));
                        setNotifyOnRestart(api.getConfiguration('notify_on_restart'));
                        setRecordStats(api.getConfiguration('record_stats'));
                        setStoreLogs(api.getConfiguration('store_logs'));
                    } else {
                        // setFormErrors({processName: r.asApiError().details});
                    }
                })
                .finally(() => {
                    setSavingProcess(false);
                });
        }
    };

    return (
        <Modal show={show} onHide={handleClose('newProcess')}>
            <Modal.Header closeButton>
                <Modal.Title>{api.loc("new_process")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>{api.loc("process_name")}</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder={api.loc("enter_process_name")}
                        isInvalid={!!formErrors.processName}
                        value={processName}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate('process', 'name', val);
                            if (validationErr !== null) {
                                addFormError('processName', validationErr);
                            } else {
                                removeFormError('processName');
                            }

                            setProcessName(e.target.value);
                        }}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.processName}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Label>{api.loc("process_status")}</Form.Label>
                {/*enabled by default*/}
                <Form.Check
                    type='switch'
                    id='custom-switch'
                    label={enabled ? api.loc("enabled") : api.loc("disabled")}
                    checked={enabled}
                    onChange={
                        /* Change Enabled/Disabled label */
                        (e) => {
                            if (e.target.checked) {
                                e.target.labels[0].innerText = 'Enabled';
                            } else {
                                e.target.labels[0].innerText = 'Disabled';
                            }
                            setEnabled(e.target.checked);
                        }
                    }
                ></Form.Check>

                <Form.Group>
                    <Form.Label>{api.loc("executable_path")}</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder={api.loc("enter_executable_path")}
                        isInvalid={!!formErrors.executablePath}
                        value={executablePath}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate(
                                'process',
                                'executable_path',
                                val
                            );
                            if (validationErr !== null) {
                                addFormError('executablePath', validationErr);
                            } else {
                                removeFormError('executablePath');
                            }
                            setExecutablePath(e.target.value);
                        }}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.executablePath}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Label>{api.loc("arguments")}</Form.Label>
                <Form.Control
                    type='text'
                    placeholder={api.loc("enter_arguments")}
                    id={'Arguments'}
                    value={programArguments}
                    onChange={(e) => setProgramArguments(e.target.value)}
                />

                <Form.Label>{api.loc("working_directory")}</Form.Label>
                <Form.Control
                    type='text'
                    placeholder={api.loc("enter_working_directory")}
                    id={'WorkingDirectory'}
                    value={workingDirectory}
                    onChange={(e) => {
                        removeFormError('workingDirectory');
                        setWorkingDirectory(e.target.value);
                    }}
                />

                <Form.Label>{api.loc("color")}</Form.Label>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                    }}
                >
                    <Button
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: `rgba(${processColor.r}, ${processColor.g}, ${processColor.b}, ${processColor.a})`,
                            border: '1px solid #ddd',
                            marginRight: '1rem',
                        }}
                        onClick={() =>
                            setAddProcessNewGroupColorPickerShown(
                                !addProcessNewGroupColorPickerShown
                            )
                        }
                    />
                    {addProcessNewGroupColorPickerShown && (
                        <SketchPicker
                            color={processColor}
                            onChange={(color) => setProcessColor(color.rgb)}
                            disableAlpha={false}
                        />
                    )}
                </div>
                <Form.Group>
                    <Form.Label>{api.loc("group")}</Form.Label>
                    <Form.Control
                        as='select'
                        value={selectedGroupId || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedGroupId(value);
                            if (value !== 'addNew' && value !== null) {
                                const group = groups.find(
                                    (group) => group.id === parseInt(value)
                                );
                                setAutoRestartOnStop(
                                    api.getConfiguration('auto_restart_on_stop', value)
                                );
                                setAutoRestartOnCrash(
                                    api.getConfiguration('auto_restart_on_crash', value)
                                );
                                setAutoRestartMaxRetries(
                                    api.getConfiguration('auto_restart_max_retries', value)
                                );
                                setAutoRestartMaxRetriesFrame(
                                    api.getConfiguration('auto_restart_max_retries_frame', value)
                                );
                                setAutoRestartDelay(
                                    api.getConfiguration('auto_restart_delay', value)
                                );
                                setNotifyOnCrash(
                                    api.getConfiguration('notify_on_crash', value)
                                );
                                setNotifyOnStop(api.getConfiguration('notify_on_stop', value));
                                setNotifyOnStart(
                                    api.getConfiguration('notify_on_start', value)
                                );
                                setNotifyOnRestart(
                                    api.getConfiguration('notify_on_restart', value)
                                );
                                setRecordStats(api.getConfiguration('record_stats', value));
                                setStoreLogs(api.getConfiguration('store_logs', value));
                            }
                            setDoCreateGroup(value === 'addNew');
                        }}
                    >
                        <option value={null}>{api.loc("no_group")}</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                        <option value='addNew'>{api.loc("add_new")}</option>
                    </Form.Control>
                </Form.Group>

                {doCreateGroup && (
                    <>
                        <Form.Group>
                            <Form.Label>{api.loc("group_name")}</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder={api.loc("enter_group_name")}
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>{api.loc("group_color")}</Form.Label>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Button
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        backgroundColor: `rgba(${newGroupColor.r}, ${newGroupColor.g}, ${newGroupColor.b}, ${newGroupColor.a})`,
                                        marginRight: '1rem',
                                        border: '1px solid #ddd',
                                    }}
                                    onClick={() =>
                                        setProcessColorPickerShown(!processColorPickerShown)
                                    }
                                />
                                {processColorPickerShown && (
                                    <SketchPicker
                                        color={newGroupColor}
                                        onChange={(color) => setNewGroupColor(color.rgb)}
                                        disableAlpha={false}
                                    />
                                )}
                            </div>
                        </Form.Group>
                    </>
                )}

                <Form.Label>{api.loc("environment_variables")}</Form.Label>
                <Table bordered>
                    <thead>
                    <tr>
                        <th>{api.loc("environment_variable")}</th>
                        <th>{api.loc("value")}</th>
                        <th>{api.loc("remove")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {envVars.map((envVar, index) => (
                        <tr key={index}>
                            <td>
                                <Form.Control
                                    type='text'
                                    value={envVar.key}
                                    onChange={(e) => handleEnvVarChange(index, e.target.value)}
                                    placeholder={api.loc("key")}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    type='text'
                                    value={envVar.value}
                                    onChange={(e) =>
                                        handleEnvVarChange(index, undefined, e.target.value)
                                    }
                                    placeholder={api.loc("value")}
                                />
                            </td>
                            <td>
                                <Button variant='danger' onClick={() => removeEnvVar(index)}>
                                    <X style={{fontSize: '1.5rem'}}/>
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan='3'>
                            <Button onClick={addEnvVar}>{api.loc("add_variable")}</Button>
                        </td>
                    </tr>
                    </tbody>
                </Table>

                <Form.Label>{api.loc("configuration")}</Form.Label>

                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("auto_restart_on_stop")}
                        checked={autoRestartOnStop}
                        onChange={(e) => setAutoRestartOnStop(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("auto_restart_on_crash")}
                        checked={autoRestartOnCrash}
                        onChange={(e) => setAutoRestartOnCrash(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>{api.loc("max_retries")}</Form.Label>
                    <Form.Control
                        type='number'
                        value={autoRestartMaxRetries}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate(
                                'configuration',
                                'auto_restart_max_retries',
                                val
                            );
                            if (validationErr !== null) {
                                addFormError('processRestartMaxRetries', validationErr);
                            } else {
                                removeFormError('processRestartMaxRetries');
                            }

                            setAutoRestartMaxRetries(e.target.value);
                        }}
                        min='1'
                        max='100'
                        step='1'
                        isInvalid={!!formErrors.processRestartMaxRetries}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.processRestartMaxRetries}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Form.Label>
                        {api.loc("restart_timeframe")}
                    </Form.Label>
                    <Form.Control
                        type='number'
                        value={autoRestartMaxRetriesFrame}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate(
                                'configuration',
                                'auto_restart_max_retries_frame',
                                val
                            );
                            if (validationErr !== null) {
                                addFormError('processRestartTimeFrame', validationErr);
                            } else {
                                removeFormError('processRestartTimeFrame');
                            }

                            setAutoRestartMaxRetriesFrame(e.target.value);
                        }}
                        min='0'
                        max='1800'
                        step='1'
                        isInvalid={!!formErrors.processRestartTimeFrame}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.processRestartTimeFrame}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Form.Label>
                        {api.loc("restart_delay")}
                    </Form.Label>
                    <Form.Control
                        type='number'
                        value={autoRestartDelay}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate(
                                'configuration',
                                'auto_restart_delay',
                                val
                            );
                            if (validationErr !== null) {
                                addFormError('processRestartDelay', validationErr);
                            } else {
                                removeFormError('processRestartDelay');
                            }
                            setAutoRestartDelay(e.target.value);
                        }}
                        min='0'
                        max='180000'
                        step='500'
                        isInvalid={!!formErrors.processRestartDelay}
                    ></Form.Control>
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.processRestartDelay}
                    </Form.Control.Feedback>
                </Form.Group>
                {/* notify on crash; notify on stop; notify on start */}
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("notify_on_crash")}
                        checked={notifyOnCrash}
                        onChange={(e) => setNotifyOnCrash(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("notify_on_stop")}
                        checked={notifyOnStop}
                        onChange={(e) => setNotifyOnStop(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("notify_on_start")}
                        checked={notifyOnStart}
                        onChange={(e) => setNotifyOnStart(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("notify_on_restart")}
                        checked={notifyOnRestart}
                        onChange={(e) => setNotifyOnRestart(e.target.checked)}
                    />
                </Form.Group>
                {/*<Form.Group>*/}
                {/*    <Form.Check type='switch' label='Record stats'*/}
                {/*                checked={recordStats}*/}
                {/*                onChange={(e) => setRecordStats(e.target.checked)}*/}
                {/*    />*/}
                {/*</Form.Group>*/}
                {/*<Form.Group>*/}
                {/*    <Form.Check type='switch' label='Store logs'*/}
                {/*                checked={storeLogs}*/}
                {/*                onChange={(e) => setStoreLogs(e.target.checked)}*/}
                {/*    />*/}
                {/*</Form.Group>*/}
            </Modal.Body>

            <Modal.Footer>
                <Button variant='secondary' onClick={handleClose('newProcess')}>
                    {api.loc("close")}
                </Button>
                <Button
                    id='createProcessBtn'
                    variant='primary'
                    onClick={CreateProcess}
                    disabled={Object.keys(formErrors).length > 0 || savingProcess}
                >
                    {savingProcess ? (
                        LoadingSpinner()
                    ) : (
                        <div>
                            <X style={{fontSize: '1.5rem', rotate: '45deg'}}/> {api.loc("create")}
                        </div>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewProcessModal;
