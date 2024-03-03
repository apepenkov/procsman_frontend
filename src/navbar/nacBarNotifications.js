import {Button, FormLabel, Modal, Table} from "react-bootstrap";
import React, {useEffect} from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import {X} from "react-bootstrap-icons";
import api from "../api";
import LoadingSpinner from "../loadingSpinner";


function NotificationsModal({handleClose}) {
    const [botToken, setBotToken] = React.useState('');
    const [enabled, setEnabled] = React.useState(true);
    const [chatIds, setChatIds] = React.useState([]);
    const [saving, setSaving] = React.useState(false);

    const addChatId = (id) => {
        setChatIds([...chatIds, id]);
    }

    const removeChatId = (id) => {
        setChatIds(chatIds.filter((chatId) => chatId !== id));
    }

    const removeChatIdAtIndex = (index) => {
        const newChatIds = [...chatIds];
        newChatIds.splice(index, 1);
        setChatIds(newChatIds);
    }

    const handleChatIdChange = (index, value) => {
        // remove any non-numeric characters (except for the minus sign)
        value = value.replace(/[^0-9-]/g, '');
        value = parseInt(value);
        const newChatIds = [...chatIds];
        newChatIds[index] = value;
        setChatIds(newChatIds);
    }

    const refreshConfig = () => {
        api.getNotificationConfig().then((config) => {
            config = config.json;
            setBotToken(config.telegram_bot_token);
            setEnabled(config.enabled);
            setChatIds(config.telegram_target_chat_ids);
        });
    }

    const saveConfig = () => {
        setSaving(true);

        api.setNotificationConfig({
            telegram_bot_token: botToken,
            enabled: enabled,
            telegram_target_chat_ids: chatIds
        }).then(() => {
            handleClose('notifications')();
        }).finally(() => {
            setSaving(false);
        });
    }

    useEffect(() => {
        refreshConfig();
    }, []);


    return (
        <Container>
            <Modal.Header closeButton>
                <Modal.Title>Notifications</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <FormLabel>Enable/disable notifications</FormLabel>
                    <Form.Check
                        type='switch'
                        label={enabled ? 'Enabled' : 'Disabled'}
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />

                    <FormLabel>Telegram bot token</FormLabel>
                    <Form.Control
                        type='password'
                        placeholder='Enter bot token'
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                    />

                    <FormLabel>Chat IDs</FormLabel>

                    <Table bordered>
                        <thead>
                        <tr>
                            <th>Chat Id</th>
                            <th>Remove</th>
                        </tr>
                        </thead>
                        <tbody>
                        {chatIds.map((chatId, index) => (
                            <tr key={index}>
                                <td>
                                    <Form.Control
                                        type='text'
                                        value={chatId}
                                        onChange={(e) => handleChatIdChange(index, e.target.value)}
                                        placeholder='Chat id'
                                    />
                                </td>
                                <td>
                                    <Button variant='danger' onClick={() => removeChatIdAtIndex(index)}>
                                        <X style={{fontSize: '1.5rem'}}/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan='3'>
                                <Button onClick={() => {
                                    addChatId(0)
                                }}>
                                    <X style={{fontSize: '1.5rem', rotate: '45deg'}}/>
                                    Add chat id
                                </Button>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={handleClose('notifications')}>
                    Close
                </Button>
                <Button variant='primary'
                        onClick={saveConfig}
                        disabled={saving}
                >
                    {saving ? LoadingSpinner() : 'Save'}
                </Button>
            </Modal.Footer>
        </Container>

    )
}

export default NotificationsModal;