import React, {useEffect, useState} from 'react';
import {
    Navbar,
    Nav,
    Container,
    Modal,
    Button,
    FormGroup,
    Form,
    Table,
} from 'react-bootstrap';
import {
    Gear,
    BoxArrowRight,
    PlusCircle,
    PersonPlus,
    Bell,
    X,
} from 'react-bootstrap-icons'; // Importing icons
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import api from '../api';
import {SketchPicker} from 'react-color';

function NavBarHeader({switchView, view}) {
    // States for showing/hiding modals
    const [showSettings, setShowSettings] = useState(false);
    const [showNewProcess, setShowNewProcess] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const [processColor, setProcessColor] = useState({
        r: 255,
        g: 255,
        b: 255,
        a: 0.8,
    });
    const [processColorPickerShown, setProcessColorPickerShown] = useState(false);
    const [envVars, setEnvVars] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    const [groups, setGroups] = useState([]);
    const [addProcessAddGroup, setAddProcessAddGroup] = useState(false);
    const [addProcessNewGroupName, setAddProcessNewGroupName] = useState('');
    const [addProcessNewGroupColor, setAddProcessNewGroupColor] = useState({
        r: 255,
        g: 255,
        b: 255,
        a: 0.8,
    });
    const [
        addProcessNewGroupColorPickerShown,
        setAddProcessNewGroupColorPickerShown,
    ] = useState(false);

    const [newGroupColor, setNewGroupColor] = useState({
        r: 255,
        g: 255,
        b: 255,
        a: 0.8,
    });
    const [newGroupColorPickerShown, setNewGroupColorPickerShown] =
        useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const [formErrors, setFormErrors] = useState({});

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

    useEffect(() => {
        const fetchGroups = async () => {
            const data = await api.getGroupedProcesses(true);
            setGroups(Object.values(data.groups));
        };
        fetchGroups();

        api.setCardsChangedCallbackNavbar(handleGroupsChanged);

        return () => {
            api.setCardsChangedCallbackNavbar(null);
        };
    }, []);

    // Inline styles
    const activeTabStyle = {
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        color: 'black',
        fontWeight: 'bold',
    };

    const iconStyle = {
        marginLeft: '16px',
        cursor: 'pointer',
        fontSize: '1.5rem',
    };
    const iconWrapperStyle = {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        marginLeft: '16px', // Keep your original margin, or adjust as needed
    };

    const MobileLabelStyle = {
        cursor: 'pointer',
        marginLeft: '16px',
    };

    const ToolTipStyle = {
        textAlign: 'center',
    };

    // Handlers for modal visibility
    const handleClose = (modal) => () => {
        setFormErrors({});
        switch (modal) {
            case 'settings':
                setShowSettings(false);
                break;
            case 'newProcess':
                setShowNewProcess(false);
                break;
            case 'createGroup':
                setShowCreateGroup(false);
                break;
            case 'notifications':
                setShowNotifications(false);
                break;
            default:
                break;
        }
    };

    const handleShow = (modal) => () => {
        setFormErrors({});
        switch (modal) {
            case 'settings':
                setShowSettings(true);
                break;
            case 'newProcess':
                setEnvVars([]);
                setShowNewProcess(true);
                break;
            case 'createGroup':
                setShowCreateGroup(true);
                break;
            case 'notifications':
                setShowNotifications(true);
                break;
            default:
                break;
        }
    };

    function logout() {
        api.authToken = null;
        api.save();
        switchView('auth');
    }
    
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

    const handleGroupsChanged = (newData) => {
        if (newData === null) {
            return
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

    const CreateProcess = (doCreate = false) => {
        const NewProcessParams = {
            name: document.getElementById('ProcessName').value,
            executable_path: document.getElementById('ExecutablePath').value,
            arguments: document.getElementById('Arguments').value,
            color: rgbaToHex(processColor),
            working_dir: document.getElementById('WorkingDirectory').value,
            environment: envVars.reduce((acc, envVar) => {
                if (envVar.key && envVar.value) {
                    acc[envVar.key] = envVar.value;
                }
                return acc;
            }, {}),
            enabled: document.getElementById('custom-switch').checked,
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

        if (addProcessAddGroup) {
            NewProcessParams.new_group = {
                name: addProcessNewGroupName,
                color: rgbaToHex(addProcessNewGroupColor),
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

        if (isNaN(NewProcessParams.configuration.max_retries)) {
            errors.processRestartMaxRetries = 'Max retries must be a number';
        } else if (
            NewProcessParams.configuration.max_retries < 1 ||
            NewProcessParams.configuration.max_retries > 100
        ) {
            errors.processRestartMaxRetries = 'Max retries must be between 1 and 100';
        }

        if (isNaN(NewProcessParams.configuration.retry_timeframe)) {
            errors.processRestartTimeFrame = 'Retry timeframe must be a number';
        } else if (
            NewProcessParams.configuration.retry_timeframe < 1 ||
            NewProcessParams.configuration.retry_timeframe > 1800
        ) {
            errors.processRestartTimeFrame =
                'Retry timeframe must be between 1 and 1800';
        }

        if (isNaN(NewProcessParams.configuration.retry_delay)) {
            errors.processRestartDelay = 'Retry delay must be a number';
        } else if (
            NewProcessParams.configuration.retry_delay < 500 ||
            NewProcessParams.configuration.retry_delay > 180000
        ) {
            errors.processRestartDelay = 'Retry delay must be between 500 and 180000';
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
        if (doCreate) {
            api.createProcess(NewProcessParams).then((r) => {
                if (r !== null && r !== undefined && !r.isErr()) {
                    handleClose('newProcess')();
                    // reset form
                    setEnvVars([]);
                    setSelectedGroupId(null);
                    setAddProcessAddGroup(false);
                    setAddProcessNewGroupName('');
                    setAddProcessNewGroupColor({r: 255, g: 255, b: 255, a: 0.8});
                    setProcessColor({r: 255, g: 255, b: 255, a: 0.8});
                    document.getElementById('ProcessName').value = '';
                    document.getElementById('ExecutablePath').value = '';
                    document.getElementById('Arguments').value = '';
                    document.getElementById('WorkingDirectory').value = '';
                } else {
                    // setFormErrors({processName: r.asApiError().details});
                }
            });
        }
    };

    const CreateGroup = () => {
        const NewGroupParams = {
            name: newGroupName,
            color: rgbaToHex(newGroupColor),
        };
        if (!NewGroupParams.name) {
            setFormErrors({groupName: 'Group name is required'});
            return;
        }
        setFormErrors({});
        console.log(NewGroupParams);
        api.createGroup(NewGroupParams).then((r) => {
            if (r !== null && r !== undefined && !r.isErr()) {
                handleClose('createGroup')();
                setNewGroupName('');
                setNewGroupColor({r: 255, g: 255, b: 255, a: 0.8});
            } else {
                // setFormErrors({processName: r.asApiError().details});
            }
        });
    };

    const enforceNumeric = (event) => {
        const value = event.target.value;
        event.target.value = value.replace(/[^0-9]/g, '');
    };

    return (
        <Navbar
            bg='light'
            expand='lg'
            style={{marginBottom: '20px'}}
            sticky='top'
        >
            <Container>
                <Navbar.Brand>ProcsMan</Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className='me-auto' style={{marginLeft: '20px'}}>
                        <Nav.Link
                            href='#dashboard'
                            style={view === 'dashboard' ? activeTabStyle : {}}
                            onClick={() => switchView('dashboard')}
                        >
                            Dashboard
                        </Nav.Link>
                        <Nav.Link
                            href='#groups'
                            style={view === 'groups' ? activeTabStyle : {}}
                            onClick={() => switchView('groups')}
                        >
                            Groups
                        </Nav.Link>
                    </Nav>
                    <Nav className='nav-icon-container'>
                        <OverlayTrigger
                            overlay={
                                <Tooltip style={ToolTipStyle} id='tooltip-new-process'>
                                    Add Process
                                </Tooltip>
                            }
                            placement='bottom'
                        >
              <span style={iconWrapperStyle}>
                <PlusCircle
                    style={iconStyle}
                    onClick={handleShow('newProcess')}
                />
                <span
                    className='d-lg-none'
                    style={MobileLabelStyle}
                    onClick={handleShow('newProcess')}
                >
                  Add Process
                </span>
              </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={
                                <Tooltip style={ToolTipStyle} id='tooltip-create-group'>
                                    Add Group
                                </Tooltip>
                            }
                            placement='bottom'
                        >
              <span style={iconWrapperStyle}>
                <PersonPlus
                    style={iconStyle}
                    onClick={handleShow('createGroup')}
                />
                <span
                    className='d-lg-none'
                    style={MobileLabelStyle}
                    onClick={handleShow('createGroup')}
                >
                  Add Group
                </span>
              </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={
                                <Tooltip style={ToolTipStyle} id='tooltip-notifications'>
                                    Notification Settings
                                </Tooltip>
                            }
                            placement='bottom'
                        >
              <span style={iconWrapperStyle}>
                <Bell style={iconStyle} onClick={handleShow('notifications')}/>
                <span
                    className='d-lg-none'
                    style={MobileLabelStyle}
                    onClick={handleShow('notifications')}
                >
                  Notifications
                </span>
              </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={
                                <Tooltip style={ToolTipStyle} id='tooltip-settings'>
                                    Settings
                                </Tooltip>
                            }
                            placement='bottom'
                        >
              <span style={iconWrapperStyle}>
                <Gear style={iconStyle} onClick={handleShow('settings')}/>
                <span
                    className='d-lg-none'
                    style={MobileLabelStyle}
                    onClick={handleShow('settings')}
                >
                  Settings
                </span>
              </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={
                                <Tooltip style={ToolTipStyle} id='tooltip-logout'>
                                    Logout
                                </Tooltip>
                            }
                            placement='bottom'
                        >
              <span style={iconWrapperStyle}>
                <BoxArrowRight style={iconStyle} onClick={logout}/>
                <span
                    className='d-lg-none'
                    style={MobileLabelStyle}
                    onClick={logout}
                >
                  Logout
                </span>
              </span>
                        </OverlayTrigger>
                    </Nav>
                </Navbar.Collapse>
            </Container>

            {/* Settings Modal */}
            <Modal show={showSettings} onHide={handleClose('settings')}>
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>Settings form or content here.</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose('settings')}>
                        Close
                    </Button>
                    <Button variant='primary'>Save Changes</Button>
                </Modal.Footer>
            </Modal>
            {/* New Process Modal */}
            <Modal show={showNewProcess} onHide={handleClose('newProcess')}>
                <Modal.Header closeButton>
                    <Modal.Title>New Process</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId='ProcessName'>
                        <Form.Label>Process Name</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='Enter process name'
                            isInvalid={!!formErrors.processName}
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
                        defaultChecked
                        onChange={
                            /* Change Enabled/Disabled label */
                            (e) => {
                                if (e.target.checked) {
                                    e.target.labels[0].innerText = 'Enabled';
                                } else {
                                    e.target.labels[0].innerText = 'Disabled';
                                }
                            }
                        }
                    ></Form.Check>

                    <Form.Group controlId='ExecutablePath'>
                        <Form.Label>Executable Path</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='Enter executable path'
                            isInvalid={!!formErrors.executablePath}
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
                    />

                    <Form.Label>Working Directory</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter working directory'
                        id={'WorkingDirectory'}
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
                    <Form.Group controlId='groupSelection'>
                        <Form.Label>Group</Form.Label>
                        <Form.Control
                            as='select'
                            value={selectedGroupId || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedGroupId(value);
                                if (value !== 'addNew' && value !== null) {
                                    let groupIdInt = parseInt(value);
                                    setAutoRestartOnStop(api.getConfiguration('auto_restart_on_stop', groupIdInt));
                                    setAutoRestartOnCrash(api.getConfiguration('auto_restart_on_crash', groupIdInt));
                                    setAutoRestartMaxRetries(api.getConfiguration('auto_restart_max_retries', groupIdInt));
                                    setAutoRestartMaxRetriesFrame(api.getConfiguration('auto_restart_max_retries_frame', groupIdInt));
                                    setAutoRestartDelay(api.getConfiguration('auto_restart_delay', groupIdInt));
                                    setNotifyOnCrash(api.getConfiguration('notify_on_crash', groupIdInt));
                                    setNotifyOnStop(api.getConfiguration('notify_on_stop', groupIdInt));
                                    setNotifyOnStart(api.getConfiguration('notify_on_start', groupIdInt));
                                    setRecordStats(api.getConfiguration('record_stats', groupIdInt));
                                    setStoreLogs(api.getConfiguration('store_logs', groupIdInt));
                                }
                                setAddProcessAddGroup(value === 'addNew');
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

                    {addProcessAddGroup && (
                        <>
                            <Form.Group controlId='newGroupName'>
                                <Form.Label>Group Name</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter new group name'
                                    value={addProcessNewGroupName}
                                    onChange={(e) => setAddProcessNewGroupName(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId='newGroupColor'>
                                <Form.Label>Group Color</Form.Label>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <Button
                                        style={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: '50%',
                                            backgroundColor: `rgba(${addProcessNewGroupColor.r}, ${addProcessNewGroupColor.g}, ${addProcessNewGroupColor.b}, ${addProcessNewGroupColor.a})`,
                                            marginRight: '1rem',
                                            border: '1px solid #ddd',
                                        }}
                                        onClick={() =>
                                            setProcessColorPickerShown(!processColorPickerShown)
                                        }
                                    />
                                    {processColorPickerShown && (
                                        <SketchPicker
                                            color={addProcessNewGroupColor}
                                            onChange={(color) =>
                                                setAddProcessNewGroupColor(color.rgb)
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

                    <Form.Group controlId='processRestartOnStopSwitch'>
                        <Form.Check
                            type='switch'
                            label='Automatically restart when stopped (exit 0)'
                            defaultChecked={autoRestartOnStop}
                            onChange={(e) => setAutoRestartOnStop(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='processRestartOnCrashSwitch'>
                        <Form.Check
                            type='switch'
                            label='Automatically restart when crashed (exit non-0)'
                            defaultChecked={autoRestartOnCrash}
                            onChange={(e) => setAutoRestartOnCrash(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='processRestartMaxRetries'>
                        <Form.Label>Max Retries</Form.Label>
                        <Form.Control
                            type='number'
                            defaultValue={autoRestartMaxRetries}
                            onChange={(e) => setAutoRestartMaxRetries(e.target.value)}
                            min='1'
                            max='100'
                            step='1'
                            isInvalid={!!formErrors.processRestartMaxRetries}
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            {formErrors.processRestartMaxRetries}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId='processRestartTimeFrame'>
                        <Form.Label>
                            Retry Timeframe (seconds) - time window, within which "Max
                            Retries" is counted
                        </Form.Label>
                        <Form.Control
                            type='number'
                            defaultValue={autoRestartMaxRetriesFrame}
                            onChange={(e) => setAutoRestartMaxRetriesFrame(e.target.value)}
                            min='1'
                            max='1800'
                            step='1'
                            isInvalid={!!formErrors.processRestartTimeFrame}
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            {formErrors.processRestartTimeFrame}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId='processRestartDelay'>
                        <Form.Label>
                            Retry Delay (milliseconds) - time to wait before retrying
                        </Form.Label>
                        <Form.Control
                            type='number'
                            defaultValue={autoRestartDelay}
                            onChange={(e) => setAutoRestartDelay(e.target.value)}
                            min='500'
                            max='180000'
                            step='500'
                            isInvalid={!!formErrors.processRestartDelay}
                        ></Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            {formErrors.processRestartDelay}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {/* notify on crash; notify on stop; notify on start */}
                    <Form.Group controlId='processNotifyOnCrashSwitch'>
                        <Form.Check
                            type='switch' label='Notify on crash'
                            defaultChecked={notifyOnCrash}
                            onChange={(e) => setNotifyOnCrash(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='processNotifyOnStopSwitch'>
                        <Form.Check
                            type='switch' label='Notify on stop'
                            defaultChecked={notifyOnStop}
                            onChange={(e) => setNotifyOnStop(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='processNotifyOnStartSwitch'>
                        <Form.Check type='switch' label='Notify on start'
                                    defaultChecked={notifyOnStart}
                                    onChange={(e) => setNotifyOnStart(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='processRecordStats'>
                        <Form.Check type='switch' label='Record stats'
                                    defaultChecked={recordStats}
                                    onChange={(e) => setRecordStats(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group controlId='processStoreLogs'>
                        <Form.Check type='switch' label='Store logs'
                                    defaultChecked={storeLogs}
                                    onChange={(e) => setStoreLogs(e.target.checked)}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose('newProcess')}>
                        Close
                    </Button>
                    <Button variant='primary' onClick={CreateProcess}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Create Group Modal */}
            <Modal show={showCreateGroup} onHide={handleClose('createGroup')}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Group</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId='newGroupName'>
                        <Form.Label>Group Name</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='Enter group name'
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            isInvalid={!!formErrors.groupName}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {formErrors.groupName}
                        </Form.Control.Feedback>
                    </Form.Group>
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
                                setNewGroupColorPickerShown(!newGroupColorPickerShown)
                            }
                        />
                        {newGroupColorPickerShown && (
                            <SketchPicker
                                color={newGroupColor}
                                onChange={(color) => setNewGroupColor(color.rgb)}
                                disableAlpha={false}
                            />
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose('createGroup')}>
                        Close
                    </Button>
                    <Button variant='primary' onClick={CreateGroup}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Notifications Modal */}
            <Modal show={showNotifications} onHide={handleClose('notifications')}>
                <Modal.Header closeButton>
                    <Modal.Title>Notifications</Modal.Title>
                </Modal.Header>
                <Modal.Body>Notifications settings or content here.</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose('notifications')}>
                        Close
                    </Button>
                    <Button variant='primary'>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
    );
}

export default NavBarHeader;
