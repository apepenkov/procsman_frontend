import React, {useEffect, useState} from 'react';
import {Button, Container, Modal, Nav, Navbar, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Bell, BoxArrowRight, Gear, PersonPlus, PlusCircle,} from 'react-bootstrap-icons'; // Importing icons
import api from '../api';
import NewProcessModal from './navBarCreateProcess';
import NewGroupModal from './navBarCreateGroup';
import NotificationsModal from "./nacBarNotifications";

function NavBarHeader({switchView, view}) {
    // States for showing/hiding modals
    const [showSettings, setShowSettings] = useState(false);
    const [showNewProcess, setShowNewProcess] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const [groups, setGroups] = useState([]);

    const [prevData, setPrevData] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            const data = await api.getGroupedProcesses(true);
            // if it's the same, don't update

            if (JSON.stringify(data) === prevData) {
                return;
            }
            setPrevData(JSON.stringify(data));

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
        switch (modal) {
            case 'settings':
                setShowSettings(true);
                break;
            case 'newProcess':
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
            <NewProcessModal
                groups={groups}
                handleClose={handleClose}
                show={showNewProcess}
            ></NewProcessModal>
            {/* Create Group Modal */}
            <NewGroupModal
                groups={groups}
                handleClose={handleClose}
                show={showCreateGroup}
            ></NewGroupModal>
            {/* Notifications Modal */}
            <Modal show={showNotifications} onHide={handleClose('notifications')}>
                <NotificationsModal handleClose={handleClose}></NotificationsModal>
            </Modal>
        </Navbar>
    );
}

export default NavBarHeader;
