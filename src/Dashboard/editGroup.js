import {Form, Modal} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import LoadingSpinner from "../loadingSpinner";
import {Pencil, Trash} from "react-bootstrap-icons";
import React, {useState} from "react";
import api, {hexToRgba, rgbaToHex} from "../api";
import {SketchPicker} from "react-color";


function EditGroup({showEditGroup, setShowEditGroup, group, setSelectedTab}) {

    const [savingGroup, setSavingGroup] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState({});

    const [groupColor, setGroupColor] = useState(hexToRgba(group.color));
    const [colorPickerShown, setColorPickerShown] =
        useState(false);
    const [groupName, setGroupName] = useState(group.name);

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
    
    const cfg = (a, b) => {
        return a === undefined ? b : a;
    }

    // configuration
    const [autoRestartOnStop, setAutoRestartOnStop] = useState(api.getConfiguration('auto_restart_on_stop', group.id));
    const [autoRestartOnCrash, setAutoRestartOnCrash] = useState(api.getConfiguration('auto_restart_on_crash', group.id));
    const [autoRestartMaxRetries, setAutoRestartMaxRetries] = useState(api.getConfiguration('auto_restart_max_retries', group.id));
    const [autoRestartMaxRetriesFrame, setAutoRestartMaxRetriesFrame] = useState(api.getConfiguration('auto_restart_max_retries_frame', group.id));
    const [autoRestartDelay, setAutoRestartDelay] = useState(api.getConfiguration('auto_restart_delay', group.id));
    const [notifyOnCrash, setNotifyOnCrash] = useState(api.getConfiguration('notify_on_crash', group.id));
    const [notifyOnStop, setNotifyOnStop] = useState(api.getConfiguration('notify_on_stop', group.id));
    const [notifyOnStart, setNotifyOnStart] = useState(api.getConfiguration('notify_on_start', group.id));
    const [notifyOnReStart, setNotifyOnReStart] = useState(api.getConfiguration('notify_on_restart', group.id));
    const [storeLogs, setStoreLogs] = useState(api.getConfiguration('store_logs', group.id));
    const [recordStats, setRecordStats] = useState(api.getConfiguration('record_stats', group.id));

    const [deleteButtonPressedOnce, setDeleteButtonPressedOnce] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const SaveGroup = () => {
        const NewGroupParams = {
            name: groupName,
            color: rgbaToHex(groupColor),
            config: {
                auto_restart_on_stop: autoRestartOnStop,
                auto_restart_on_crash: autoRestartOnCrash,
                auto_restart_max_retries: parseInt(autoRestartMaxRetries),
                auto_restart_max_retries_frame: parseInt(autoRestartMaxRetriesFrame),
                auto_restart_delay: parseInt(autoRestartDelay),
                notify_on_crash: notifyOnCrash,
                notify_on_restart: notifyOnReStart,
                notify_on_stop: notifyOnStop,
                notify_on_start: notifyOnStart,
                record_stats: recordStats,
                store_logs: storeLogs,
            },
        };
        if (!NewGroupParams.name) {
            setFormErrors({groupName: api.loc("group_name_required")});
            return;
        }
        setFormErrors({});
        setSavingGroup(true);
        api.editGroup(group.id, NewGroupParams)
            .then((r) => {
                if (r !== null && r !== undefined && !r.isErr()) {
                    setShowEditGroup(null);
                }
            })
            .finally(() => {
                setSavingGroup(false);
            });
    };

    return (
        <Modal show={showEditGroup === group.id} onHide={() => {
            setShowEditGroup(false)
        }} size={'xl'} style={{backdropFilter: 'blur(5px)'}}>
            <Modal.Header closeButton>
                <Modal.Title>{api.loc("editing_group")} {group.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId='newGroupName'>
                    <Form.Label>{api.loc("group_name")}</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder={api.loc("enter_group_name")}
                        value={groupName}
                        onChange={(e) => {
                            const val = e.target.value;
                            const validationErr = api.validate('group', 'name', val);
                            if (validationErr !== null) {
                                addFormError('groupName', validationErr);
                            } else {
                                removeFormError('groupName');
                            }
                            setGroupName(e.target.value);
                        }}
                        isInvalid={!!formErrors.groupName}
                    />
                    <Form.Control.Feedback type='invalid'>
                        {formErrors.groupName}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Label>{api.loc("group_color")}</Form.Label>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <Button
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: `rgba(${groupColor.r}, ${groupColor.g}, ${groupColor.b}, ${groupColor.a})`,
                            marginRight: '1rem',
                            border: '1px solid #ddd',
                        }}
                        onClick={() =>
                            setColorPickerShown(!colorPickerShown)
                        }
                    />
                    {colorPickerShown && (
                        <SketchPicker
                            color={groupColor}
                            onChange={(color) => setGroupColor(color.rgb)}
                            disableAlpha={false}
                        />
                    )}
                </div>

                <Form.Label>
                    {api.loc("default_configuration")}
                </Form.Label>

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
                        checked={notifyOnReStart}
                        onChange={(e) => setNotifyOnReStart(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("store_logs")}
                        checked={storeLogs}
                        onChange={(e) => setStoreLogs(e.target.checked)}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Check
                        type='switch'
                        label={api.loc("record_stats")}
                        checked={recordStats}
                        onChange={(e) => setRecordStats(e.target.checked)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer
            >
                <Button
                    variant={'danger'}
                    style={{
                        position: 'absolute',
                        left: '10px',
                        bottom: '10px',
                    }}
                    onClick={() => {
                        if (deleteButtonPressedOnce) {
                            setDeleteLoading(true);
                            api.deleteGroup(group.id).finally(() => {
                                setShowEditGroup(null);
                                setDeleteLoading(false);
                                setSelectedTab('all');
                            });
                        } else {
                            setDeleteButtonPressedOnce(true);
                            setTimeout(() => {
                                setDeleteButtonPressedOnce(false);
                            }, 3000);
                        }
                    }}
                >
                    {deleteLoading? (LoadingSpinner()) : (
                        <diV>
                            <Trash></Trash>
                            {deleteButtonPressedOnce ? ( api.loc("click_again_to_delete")) : (api.loc("delete"))}
                        </diV>
                    )}
                </Button>

                <Button variant='secondary' onClick={() => {
                    setShowEditGroup(null)
                }}>
                    {api.loc("close")}
                </Button>



                <Button
                    variant='primary'
                    onClick={SaveGroup}
                    disabled={Object.keys(formErrors).length > 0 || savingGroup}
                >
                    {savingGroup ? (
                        LoadingSpinner()
                    ) : (
                        <div>
                            {api.loc("save")}
                            <Pencil style={{marginLeft: '5px', marginBottom: '4px'}}/>
                        </div>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditGroup;