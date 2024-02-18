import React, {useState} from 'react';
import {
    Modal,
    Button,
    Form,
    Table,
} from 'react-bootstrap';
import {
    X,
} from 'react-bootstrap-icons'; // Importing icons
import api, {rgbaToHex} from '../api';
import {SketchPicker} from 'react-color';

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
    }

    const addFormError = (key, value) => {
        const newFormErrors = {...formErrors};
        newFormErrors[key] = value;
        setFormErrors(newFormErrors);
    }

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
    const [autoRestartOnStop, setAutoRestartOnStop] = useState(api.getConfiguration('auto_restart_on_stop'));
    const [autoRestartOnCrash, setAutoRestartOnCrash] = useState(api.getConfiguration('auto_restart_on_crash'));
    const [autoRestartMaxRetries, setAutoRestartMaxRetries] = useState(api.getConfiguration('auto_restart_max_retries'));
    const [autoRestartMaxRetriesFrame, setAutoRestartMaxRetriesFrame] = useState(api.getConfiguration('auto_restart_max_retries_frame'));
    const [autoRestartDelay, setAutoRestartDelay] = useState(api.getConfiguration('auto_restart_delay'));
    const [notifyOnCrash, setNotifyOnCrash] = useState(api.getConfiguration('notify_on_crash'));
    const [notifyOnStop, setNotifyOnStop] = useState(api.getConfiguration('notify_on_stop'));
    const [notifyOnStart, setNotifyOnStart] = useState(api.getConfiguration('notify_on_start'));

    // UNUSED
    const [recordStats, setRecordStats] = useState(api.getConfiguration('record_stats'));
    const [storeLogs, setStoreLogs] = useState(api.getConfiguration('store_logs'));

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
            configuration: {
                restart_on_stop: autoRestartOnStop,
                restart_on_crash: autoRestartOnCrash,
                max_retries: parseInt(autoRestartMaxRetries),
                retry_timeframe: parseInt(autoRestartMaxRetriesFrame),
                retry_delay: parseInt(autoRestartDelay),
                notify_on_crash: notifyOnCrash,
                notify_on_stop: notifyOnStop,
                notify_on_start: notifyOnStop,
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
            errors.processName = 'Process name is required';
        }

        if (!NewProcessParams.executable_path) {
            errors.executablePath = 'Executable path is required';
        }

        const maxRetriesErr = api.validate("configuration", "auto_restart_max_retries", NewProcessParams.configuration.max_retries);
        if (maxRetriesErr !== null) {
            errors.processRestartMaxRetries = maxRetriesErr;
        }

        const maxRetriesFrameErr = api.validate("configuration", "auto_restart_max_retries_frame", NewProcessParams.configuration.retry_timeframe);
        if (maxRetriesFrameErr !== null) {
            errors.processRestartTimeFrame = maxRetriesFrameErr;
        }

        const maxRetriesDelayErr = api.validate("configuration", "auto_restart_delay", NewProcessParams.configuration.retry_delay);
        if (maxRetriesDelayErr !== null) {
            errors.processRestartDelay = maxRetriesDelayErr;
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        // warn user, if the retry configuration will not ever stop
        const max_retries_within_timeframe = Math.floor(
            (NewProcessParams.configuration.retry_timeframe * 1000) /
            NewProcessParams.configuration.retry_delay
        );
        const wasWarned = formErrors.warned_about_max_retries !== undefined;

        if (
            max_retries_within_timeframe < NewProcessParams.configuration.max_retries
        ) {
            if (!wasWarned) {
                errors.warned_about_max_retries = true;
                errors.processRestartMaxRetries = `The process will never stop retrying, because it can retry ${max_retries_within_timeframe} times within the timeframe of ${NewProcessParams.configuration.retry_timeframe} seconds with the delay of ${NewProcessParams.configuration.retry_delay} milliseconds. Click "Create" again to confirm.`;
                setFormErrors(errors);
                return;
            }
        }

        setFormErrors({});

        console.log(NewProcessParams);
        const wasHtml = document.getElementById('createProcessBtn').innerHTML;
        document.getElementById('createProcessBtn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        if (doCreate) {
            api.createProcess(NewProcessParams).then((r) => {
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
                    setAutoRestartOnStop(api.getConfiguration('auto_restart_on_stop'));
                    setAutoRestartOnCrash(api.getConfiguration('auto_restart_on_crash'));
                    setAutoRestartMaxRetries(api.getConfiguration('auto_restart_max_retries'));
                    setAutoRestartMaxRetriesFrame(api.getConfiguration('auto_restart_max_retries_frame'));
                    setAutoRestartDelay(api.getConfiguration('auto_restart_delay'));
                    setNotifyOnCrash(api.getConfiguration('notify_on_crash'));
                    setNotifyOnStop(api.getConfiguration('notify_on_stop'));
                    setNotifyOnStart(api.getConfiguration('notify_on_start'));
                    setRecordStats(api.getConfiguration('record_stats'));
                    setStoreLogs(api.getConfiguration('store_logs'));

                } else {
                    // setFormErrors({processName: r.asApiError().details});
                }
            }).finally(() => {
                document.getElementById('createProcessBtn').innerHTML = wasHtml;
            });
        }
    };


    return (
        <Modal show={show} onHide={handleClose('newProcess')}>
            <Modal.Header closeButton>
                <Modal.Title>New Process</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Process Name</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter process name'
                        isInvalid={!!formErrors.processName}
                        value={processName}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate("process", "name", val);
                            if (validationErr !== null) {
                                addFormError("processName", validationErr);
                            } else {
                                removeFormError("processName");
                            }

                            setProcessName(e.target.value)
                        }}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.processName}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Label>Process status:</Form.Label>
                {/*enabled by default*/}
                <Form.Check
                    type='switch'
                    id='custom-switch'
                    label='Enabled'
                    defaultChecked={enabled}
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
                    <Form.Label>Executable Path</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter executable path'
                        isInvalid={!!formErrors.executablePath}
                        value={executablePath}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate("process", "executable_path", val);
                            if (validationErr !== null) {
                                addFormError("executablePath", validationErr);
                            } else {
                                removeFormError("executablePath");
                            }
                            setExecutablePath(e.target.value)
                        }}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.executablePath}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Label>Arguments</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Enter arguments'
                    id={'Arguments'}
                    value={programArguments}
                    onChange={(e) => setProgramArguments(e.target.value)}
                />

                <Form.Label>Working Directory</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Enter working directory'
                    id={'WorkingDirectory'}
                    value={workingDirectory}
                    onChange={(e) => {
                        removeFormError("workingDirectory");
                        setWorkingDirectory(e.target.value)
                    }}
                />

                <Form.Label>Color</Form.Label>
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
                    <Form.Label>Group</Form.Label>
                    <Form.Control
                        as='select'
                        value={selectedGroupId || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedGroupId(value);
                            if (value !== 'addNew' && value !== null) {
                                setAutoRestartOnStop(api.getConfiguration('auto_restart_on_stop', value));
                                setAutoRestartOnCrash(api.getConfiguration('auto_restart_on_crash', value));
                                setAutoRestartMaxRetries(api.getConfiguration('auto_restart_max_retries', value));
                                setAutoRestartMaxRetriesFrame(api.getConfiguration('auto_restart_max_retries_frame', value));
                                setAutoRestartDelay(api.getConfiguration('auto_restart_delay', value));
                                setNotifyOnCrash(api.getConfiguration('notify_on_crash', value));
                                setNotifyOnStop(api.getConfiguration('notify_on_stop', value));
                                setNotifyOnStart(api.getConfiguration('notify_on_start', value));
                                setRecordStats(api.getConfiguration('record_stats', value));
                                setStoreLogs(api.getConfiguration('store_logs', value));
                            }
                            setDoCreateGroup(value === 'addNew');
                        }}
                    >
                        <option value={null}>No Group</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                        <option value='addNew'>Add Group</option>
                    </Form.Control>
                </Form.Group>

                {doCreateGroup && (
                    <>
                        <Form.Group>
                            <Form.Label>Group Name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter new group name'
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Group Color</Form.Label>
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
                                        onChange={(color) =>
                                            setNewGroupColor(color.rgb)
                                        }
                                        disableAlpha={false}
                                    />
                                )}
                            </div>
                        </Form.Group>
                    </>
                )}

                <Form.Label>Environment Variables</Form.Label>
                <Table bordered>
                    <thead>
                    <tr>
                        <th>Environmental Variable</th>
                        <th>Value</th>
                        <th>Remove</th>
                    </tr>
                    </thead>
                    <tbody>
                    {envVars.map((envVar, index) => (
                        <tr key={index}>
                            <td>
                                <Form.Control
                                    type='text'
                                    value={envVar.key}
                                    onChange={(e) =>
                                        handleEnvVarChange(index, e.target.value)
                                    }
                                    placeholder='Key'
                                />
                            </td>
                            <td>
                                <Form.Control
                                    type='text'
                                    value={envVar.value}
                                    onChange={(e) =>
                                        handleEnvVarChange(index, undefined, e.target.value)
                                    }
                                    placeholder='Value'
                                />
                            </td>
                            <td>
                                <Button
                                    variant='danger'
                                    onClick={() => removeEnvVar(index)}
                                >
                                    <X style={{fontSize: '1.5rem'}}/>
                                </Button>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan='3'>
                            <Button onClick={addEnvVar}>Add Variable</Button>
                        </td>
                    </tr>
                    </tbody>
                </Table>

                <Form.Label>Configuration</Form.Label>

                <Form.Group>
                    <Form.Check
                        type='switch'
                        label='Automatically restart when stopped (exit 0)'
                        defaultChecked={autoRestartOnStop}
                        onChange={(e) => setAutoRestartOnStop(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label='Automatically restart when crashed (exit non-0)'
                        defaultChecked={autoRestartOnCrash}
                        onChange={(e) => setAutoRestartOnCrash(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max Retries</Form.Label>
                    <Form.Control
                        type='number'
                        defaultValue={autoRestartMaxRetries}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate("configuration", "auto_restart_max_retries", val);
                            if (validationErr !== null) {
                                addFormError("processRestartMaxRetries", validationErr);
                            } else {
                                removeFormError("processRestartMaxRetries");
                            }

                            setAutoRestartMaxRetries(e.target.value)
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
                        Retry Timeframe (seconds) - time window, within which "Max
                        Retries" is counted. When 0, it's ignored
                    </Form.Label>
                    <Form.Control
                        type='number'
                        defaultValue={autoRestartMaxRetriesFrame}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate("configuration", "auto_restart_max_retries_frame", val);
                            if (validationErr !== null) {
                                addFormError("processRestartTimeFrame", validationErr);
                            } else {
                                removeFormError("processRestartTimeFrame");
                            }

                            setAutoRestartMaxRetriesFrame(e.target.value)
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
                        Retry Delay (milliseconds) - time to wait before retrying
                    </Form.Label>
                    <Form.Control
                        type='number'
                        defaultValue={autoRestartDelay}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate("configuration", "auto_restart_delay", val);
                            if (validationErr !== null) {
                                addFormError("processRestartDelay", validationErr);
                            } else {
                                removeFormError("processRestartDelay");
                            }
                            setAutoRestartDelay(e.target.value)
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
                        type='switch' label='Notify on crash'
                        defaultChecked={notifyOnCrash}
                        onChange={(e) => setNotifyOnCrash(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch' label='Notify on stop'
                        defaultChecked={notifyOnStop}
                        onChange={(e) => setNotifyOnStop(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check type='switch' label='Notify on start'
                                defaultChecked={notifyOnStart}
                                onChange={(e) => setNotifyOnStart(e.target.checked)}
                    />
                </Form.Group>
                {/*<Form.Group>*/}
                {/*    <Form.Check type='switch' label='Record stats'*/}
                {/*                defaultChecked={recordStats}*/}
                {/*                onChange={(e) => setRecordStats(e.target.checked)}*/}
                {/*    />*/}
                {/*</Form.Group>*/}
                {/*<Form.Group>*/}
                {/*    <Form.Check type='switch' label='Store logs'*/}
                {/*                defaultChecked={storeLogs}*/}
                {/*                onChange={(e) => setStoreLogs(e.target.checked)}*/}
                {/*    />*/}
                {/*</Form.Group>*/}
            </Modal.Body>

            <Modal.Footer>
                <Button variant='secondary' onClick={handleClose('newProcess')}>
                    Close
                </Button>
                <Button
                    id='createProcessBtn'
                    variant='primary'
                    onClick={CreateProcess}
                    disabled={Object.keys(formErrors).length > 0}

                >
                    Create
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewProcessModal;
