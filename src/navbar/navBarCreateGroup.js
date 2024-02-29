import React, {useState} from 'react';
import {
    Modal,
    Button,
    Form,
} from 'react-bootstrap';
import api, {rgbaToHex} from '../api';
import {SketchPicker} from 'react-color';
import {X} from 'react-bootstrap-icons';
import loadingSpinner from "../loadingSpinner";

const NewGroupModal = ({show, handleClose, groups}) => {

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

    // configuration
    const [autoRestartOnStop, setAutoRestartOnStop] = useState(api.getConfiguration('auto_auto_restart_on_stop'));
    const [autoRestartOnCrash, setAutoRestartOnCrash] = useState(api.getConfiguration('auto_auto_restart_on_crash'));
    const [autoRestartMaxRetries, setAutoRestartMaxRetries] = useState(api.getConfiguration('auto_restart_max_retries'));
    const [autoRestartMaxRetriesFrame, setAutoRestartMaxRetriesFrame] = useState(api.getConfiguration('auto_restart_max_retries_frame'));
    const [autoRestartDelay, setAutoRestartDelay] = useState(api.getConfiguration('auto_restart_delay'));
    const [notifyOnCrash, setNotifyOnCrash] = useState(api.getConfiguration('notify_on_crash'));
    const [notifyOnStop, setNotifyOnStop] = useState(api.getConfiguration('notify_on_stop'));
    const [notifyOnStart, setNotifyOnStart] = useState(api.getConfiguration('notify_on_start'));

    // UNUSED
    const [recordStats, setRecordStats] = useState(api.getConfiguration('record_stats'));
    const [storeLogs, setStoreLogs] = useState(api.getConfiguration('store_logs'));

    const [creatingGroup, setCreatingGroup] = useState(false);

    const CreateGroup = () => {
        const NewGroupParams = {
            name: newGroupName,
            color: rgbaToHex(newGroupColor),
            config: {
                auto_auto_restart_on_stop: autoRestartOnStop,
                auto_auto_restart_on_crash: autoRestartOnCrash,
                auto_restart_max_retries: parseInt(autoRestartMaxRetries),
                auto_restart_max_retries_frame: parseInt(autoRestartMaxRetriesFrame),
                auto_restart_delay: parseInt(autoRestartDelay),
                notify_on_crash: notifyOnCrash,
                notify_on_stop: notifyOnStop,
                notify_on_start: notifyOnStop,
                record_stats: recordStats,
                store_logs: storeLogs,
            }
        };
        if (!NewGroupParams.name) {
            setFormErrors({groupName: 'Group name is required'});
            return;
        }
        setFormErrors({});
        console.log(NewGroupParams);
        setCreatingGroup(true);
        api.createGroup(NewGroupParams).then((r) => {
            if (r !== null && r !== undefined && !r.isErr()) {
                handleClose('createGroup')();
                setNewGroupName('');
                setNewGroupColor({r: 255, g: 255, b: 255, a: 0.8});
            } else {
                // setFormErrors({processName: r.asApiError().details});
            }
        }).finally(
            () => {
                setCreatingGroup(false);
            }
        );
    };

    return <Modal show={show} onHide={handleClose('createGroup')}>
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
                    onChange={(e) => {
                        const val = e.target.value;
                        const validationErr = api.validate("group", "name", val);
                        if (validationErr !== null) {
                            addFormError("groupName", validationErr);
                        } else {
                            removeFormError("groupName");
                        }
                        setNewGroupName(e.target.value)
                    }}
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

            <Form.Label>Default configuration for processes within group</Form.Label>

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
                    Retries" is counted. When 0, it's ignored.
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
            <Button variant='secondary' onClick={handleClose('createGroup')}>
                Close
            </Button>
            <Button variant='primary' onClick={CreateGroup} disabled={Object.keys(formErrors).length > 0 || creatingGroup}>
                {creatingGroup ? loadingSpinner() : <div>
                    <X style={{fontSize: '1.5rem', rotate: '45deg'}}/>
                    Create
                </div>}

            </Button>
        </Modal.Footer>
    </Modal>
}

export default NewGroupModal;