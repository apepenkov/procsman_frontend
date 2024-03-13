import React, {useEffect, useState} from 'react';
import {Button, Container, Form, Table} from 'react-bootstrap';
import {Pencil, X, Trash} from 'react-bootstrap-icons'; // Importing icons
import {SketchPicker} from 'react-color';
import api, {formatString, hexToRgba, rgbaToHex} from '../api';
import LoadingSpinner from '../loadingSpinner';

function ProcessCardEdit({
                             process,
                             selectedTab,
                             showDetails,
                             setShowDetails,
                         }) {
    const [groups, setGroups] = useState([]);

    const fetchGroups = async () => {
        const data = await api.getGroupedProcesses(true);
        setGroups(Object.values(data.groups));
    };

    useEffect(() => {
        api.setGroupsChangedProcessEditCallback(handleGroupsChanged);

        fetchGroups();

        return () => {
            api.setGroupsChangedProcessEditCallback(null);
        };
    }, []);

    const handleGroupsChanged = (newData) => {
        if (newData === null) {
            return;
        }
        setGroups((prevGroups) => {
            const newGroupsMap = Object.entries(newData.groups).reduce(
                (acc, [id, groupInfo]) => {
                    acc[id] = groupInfo;
                    return acc;
                },
                {}
            );

            // Create an updated array of groups, merging new data into existing groups
            const updatedGroups = prevGroups.map((group) => {
                if (newGroupsMap[group.id]) {
                    // For existing groups, update with new data
                    return {...group, ...newGroupsMap[group.id]};
                }
                return group;
            });

            // Add new groups that didn't exist before
            Object.keys(newGroupsMap).forEach((groupId) => {
                if (!updatedGroups.some((group) => group.id.toString() === groupId)) {
                    updatedGroups.push(newGroupsMap[groupId]);
                }
            });

            // Filter out any groups that no longer exist in newData
            return updatedGroups.filter((group) =>
                newGroupsMap.hasOwnProperty(group.id.toString())
            );
        });
    };

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
    const [enabled, setEnabled] = useState(false);

    // configuration
    const [autoRestartOnStop, setAutoRestartOnStop] = useState(
        process.getConfiguration('auto_restart_on_stop')
    );
    const [autoRestartOnCrash, setAutoRestartOnCrash] = useState(
        process.getConfiguration('auto_restart_on_crash')
    );
    const [autoRestartMaxRetries, setAutoRestartMaxRetries] = useState(
        process.getConfiguration('auto_restart_max_retries')
    );
    const [autoRestartMaxRetriesFrame, setAutoRestartMaxRetriesFrame] = useState(
        process.getConfiguration('auto_restart_max_retries_frame')
    );
    const [autoRestartDelay, setAutoRestartDelay] = useState(
        process.getConfiguration('auto_restart_delay')
    );
    const [notifyOnCrash, setNotifyOnCrash] = useState(
        process.getConfiguration('notify_on_crash')
    );
    const [notifyOnStop, setNotifyOnStop] = useState(
        process.getConfiguration('notify_on_stop')
    );
    const [notifyOnStart, setNotifyOnStart] = useState(
        process.getConfiguration('notify_on_start')
    );
    const [notifyOnRestart, setNotifyOnRestart] = useState(
        process.getConfiguration('notify_on_restart')
    );

    // UNUSED
    const [recordStats, setRecordStats] = useState(
        process.getConfiguration('record_stats')
    );
    const [storeLogs, setStoreLogs] = useState(
        process.getConfiguration('store_logs')
    );

    const [updatingProcess, setUpdatingProcess] = useState(false);

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

    const refreshFromProcess = () => {
        setProcessColor(hexToRgba(process.color));

        let newEnvVars = [];
        for (const key in process.environment) {
            newEnvVars.push({key: key, value: process.environment[key]});
        }
        setEnvVars(newEnvVars);
        api.mbCallback(true);

        setProcessName(process.name);
        setSelectedGroupId(process.process_group_id);
        setProcessName(process.name);
        setExecutablePath(process.executable_path);
        setWorkingDirectory(process.working_directory);
        setProgramArguments(process.arguments);
        setEnabled(process.enabled);

        setAutoRestartOnStop(process.getConfiguration('auto_restart_on_stop'));
        setAutoRestartOnCrash(
            process.getConfiguration('auto_restart_on_crash')
        );
        setAutoRestartMaxRetries(
            process.getConfiguration('auto_restart_max_retries')
        );
        setAutoRestartMaxRetriesFrame(
            process.getConfiguration('auto_restart_max_retries_frame')
        );
        setAutoRestartDelay(process.getConfiguration('auto_restart_delay'));
        setNotifyOnCrash(process.getConfiguration('notify_on_crash'));
        setNotifyOnStop(process.getConfiguration('notify_on_stop'));
        setNotifyOnStart(process.getConfiguration('notify_on_start'));
        setNotifyOnRestart(process.getConfiguration('notify_on_restart'));

        setRecordStats(process.getConfiguration('record_stats'));
        setStoreLogs(process.getConfiguration('store_logs'));
    };

    // 1st render
    useEffect(() => {
        refreshFromProcess();
    }, [process]);

    const editProcess = (do_ = false) => {
        const patchProcessParams = {
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
            patchProcessParams.new_group = {
                name: newGroupName,
                color: rgbaToHex(newGroupColor),
            };
            patchProcessParams.create_new_group = true;
            patchProcessParams.group_id = null;
        } else {
            patchProcessParams.group_id = selectedGroupId
                ? parseInt(selectedGroupId)
                : null;
        }

        const errors = {};
        // validation:
        if (!patchProcessParams.name) {
            errors.processName = 'Process name is required';
        }

        if (!patchProcessParams.executable_path) {
            errors.executablePath = 'Executable path is required';
        }

        const maxRetriesErr = api.validate(
            'configuration',
            'auto_restart_max_retries',
            patchProcessParams.config.auto_restart_max_retries
        );
        if (maxRetriesErr !== null) {
            errors.processRestartMaxRetries = maxRetriesErr;
        }

        const maxRetriesFrameErr = api.validate(
            'configuration',
            'auto_restart_max_retries_frame',
            patchProcessParams.config.auto_restart_max_retries_frame
        );
        if (maxRetriesFrameErr !== null) {
            errors.processRestartTimeFrame = maxRetriesFrameErr;
        }

        const maxRetriesDelayErr = api.validate(
            'configuration',
            'auto_restart_delay',
            patchProcessParams.config.auto_restart_delay
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
            (patchProcessParams.config.auto_restart_max_retries_frame * 1000) /
            patchProcessParams.config.auto_restart_delay
        );
        const wasWarned =
            formErrors.warned_about_auto_restart_max_retries !== undefined;

        if (
            auto_restart_max_retries_within_timeframe <
            patchProcessParams.config.auto_restart_max_retries
        ) {
            if (!wasWarned) {
                errors.warned_about_auto_restart_max_retries = true;
                errors.processRestartMaxRetries = formatString(api.loc("the_process_will_not_stop_restarting"), {auto_restart_max_retries_within_timeframe: auto_restart_max_retries_within_timeframe, timeframe: patchProcessParams.config.auto_restart_max_retries_frame, auto_restart_delay: patchProcessParams.config.auto_restart_delay});
                setFormErrors(errors);
                return;
            }
        }

        setFormErrors({});

        console.log(patchProcessParams);
        setUpdatingProcess(true);
        if (do_) {
            api
                .editProcess(process.id, patchProcessParams)
                .then((r) => {
                    if (r !== null && r !== undefined && !r.isErr()) {
                        process.updateWith(r.json);
                        // setShowDetails(false);
                    } else {
                        // setFormErrors({processName: r.asApiError().details});
                    }
                })
                .finally(() => {
                    setUpdatingProcess(false);
                });
        }
    };

    return (
        <Container>
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
                    value={selectedGroupId}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSelectedGroupId(value);
                        if (value !== 'addNew' && value !== null) {
                            setAutoRestartOnStop(
                                process.getConfiguration('auto_restart_on_stop', value)
                            );
                            setAutoRestartOnCrash(
                                process.getConfiguration('auto_restart_on_crash', value)
                            );
                            setAutoRestartMaxRetries(
                                process.getConfiguration('auto_restart_max_retries', value)
                            );
                            setAutoRestartMaxRetriesFrame(
                                process.getConfiguration('auto_restart_max_retries_frame', value)
                            );
                            setAutoRestartDelay(
                                process.getConfiguration('auto_restart_delay', value)
                            );
                            setNotifyOnCrash(process.getConfiguration('notify_on_crash', value));
                            setNotifyOnStop(process.getConfiguration('notify_on_stop', value));
                            setNotifyOnStart(process.getConfiguration('notify_on_start', value));
                            setNotifyOnRestart(process.getConfiguration('notify_on_restart', value));
                            setRecordStats(process.getConfiguration('record_stats', value));
                            setStoreLogs(process.getConfiguration('store_logs', value));
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
                        <Button onClick={addEnvVar}>
                            <X style={{fontSize: '1.5rem', rotate: '45deg'}}/>
                            {api.loc("add_variable")}
                        </Button>
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
            <Form.Group>
                <Form.Check type='switch' label={api.loc("record_stats")}
                            checked={recordStats}
                            onChange={(e) => setRecordStats(e.target.checked)}
                />
            </Form.Group>
            <Form.Group>
                <Form.Check type='switch' label={api.loc("store_logs")}
                            checked={storeLogs}
                            onChange={(e) => setStoreLogs(e.target.checked)}
                />
            </Form.Group>

            {/*stick to right*/}

            <Button
                id='updateProcessBtn'
                onClick={() => editProcess(true)}
                disabled={updatingProcess}
                variant={'success'}
                style={{float: 'right'}}
            >
                {updatingProcess ? (
                    LoadingSpinner()
                ) : (
                    <div>
                        <Pencil style={{marginBottom: '2px'}}/> {api.loc("save")}
                    </div>
                )}
            </Button>
        </Container>
    );
}

export default ProcessCardEdit;
