import React, {useState} from 'react';
import {Button, Card, Modal, OverlayTrigger, Tab, Tabs, Tooltip,} from 'react-bootstrap';
import {Pin, PinFill} from 'react-bootstrap-icons';
import api, {buildGradient} from '../api';
import ProcessCardStats from './processCardStats';
import ProcessCardLogs from './processCardLogs';
import ProcessCardEdit from './processCardEdit';
import LoadingSpinner from "../loadingSpinner";

function ProcessCard({process}) {
    const [showDetails, setShowDetails] = useState(false);

    const handleDetailsClose = () => setShowDetails(false);
    const handleDetailsShow = () => setShowDetails(true);
    const handlePinClick = () => {
        process.togglePinned();
    };
    const [selectedTab, setSelectedTab] = useState('status');
    const [stopping, setStopping] = useState(false);
    const [restarting, setRestarting] = useState(false);

    const startStopProcess = (e) => {
        const res = process.startOrStop();
        if (res === null) {
            return;
        }

        setStopping(true);

        setTimeout(() => {
            api.mbCallback();
        }, 300);

        setTimeout(() => {
            api.mbCallback();
        }, 600);

        if (res === 'start') {
            api
                .startProcess(process.id)
                .then(() => {
                })
                .finally(() => {
                    setStopping(false);
                });
        } else {
            api
                .stopProcess(process.id)
                .then(() => {
                })
                .finally(() => {
                    setStopping(false);
                });
        }
    };

    const restartProcess = (e) => {
        setRestarting(true);

        setTimeout(() => {
            api.mbCallback();
        }, 300);

        setTimeout(() => {
            api.mbCallback();
        }, 600);

        api.restartProcess(process.id)
            .finally(() => {
                setRestarting(false);
            });
    };

    const customButtonStyle = {
        padding: '0.25rem 0.5rem', // Reduced vertical padding, adjust as needed
        fontSize: '0.875rem', // Adjust font size if necessary
        lineHeight: '1', // This ensures that the text inside the button is centered
    };

    const modal =  <Modal show={showDetails} onHide={handleDetailsClose} size={'xl'}>
        <Modal.Header closeButton>
            <Modal.Title>{api.loc("details_for")} {process.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Tabs
                activeKey={selectedTab}
                onSelect={(k) => setSelectedTab(k)}
                className='mb-4'
            >
                <Tab eventKey={'status'} title={api.loc("status_resources_events")}>
                    <ProcessCardStats
                        process={process}
                        showDetails={showDetails}
                        selectedTab={selectedTab}
                    ></ProcessCardStats>
                </Tab>
                <Tab title={api.loc("logs")} eventKey={'logs'}>
                    <ProcessCardLogs
                        process={process}
                        showDetails={showDetails}
                        selectedTab={selectedTab}
                    ></ProcessCardLogs>
                </Tab>
                <Tabs title={api.loc("configuration")} eventKey={'configuration'}>
                    <ProcessCardEdit
                        process={process}
                        showDetails={showDetails}
                        selectedTab={selectedTab}
                        setShowDetails={setShowDetails}
                    ></ProcessCardEdit>
                </Tabs>
            </Tabs>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' onClick={handleDetailsClose}>
                {api.loc("close")}
            </Button>
        </Modal.Footer>
    </Modal>;

    if (api.cardMode()) {
        return (
            <Card
                style={{
                    width: '12rem',
                    background: buildGradient(process.rgbaColor()),
                    position: 'relative',
                    marginTop: '10px',
                }}
            >
                <Card.Body>
                    <div
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '1.5em',
                            cursor: 'pointer',
                            rotate: '45deg',
                        }}
                    >
                        {process.isPinned() ? (
                            <PinFill onClick={handlePinClick}/>
                        ) : (
                            <Pin onClick={handlePinClick}/>
                        )}
                    </div>
                    <OverlayTrigger
                        overlay={process.name.length > 20 ? <Tooltip>{process.name}</Tooltip> : <div></div>}>
                        <Card.Title style={{minHeight: '3em', paddingRight: '20px'}}>
                            {process.name.length > 20 ? process.name.substring(0, 20) + '...' : process.name}
                        </Card.Title>
                    </OverlayTrigger>

                    <Card.Subtitle
                        className='mb-2 text-muted d-flex justify-content-center'
                        style={{minHeight: '1em'}}
                    >
                        <div
                            style={{
                                minHeight: '1em',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                borderRadius: '10px',
                                padding: '5px',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span style={{color: process.enabled ? 'green' : 'red'}}>
                              {' '}
                                {process.enabled ? ' ' + api.loc("enabled") : ' ' + api.loc("disabled")}
                            </span>
                            <span style={{fontWeight: 'bold'}}></span>
                            <br/>
                            <span
                                style={{
                                    color: process.statusColor(),
                                }}
                            >
                              {process.localizedStatus()}
                            </span>
                        </div>
                    </Card.Subtitle>
                    <Card.Text>
                        {/*monospace font for process.cmdLine() in a grey field, must be same length as parent element*/}
                        <OverlayTrigger
                            overlay={process.cmdLine().length > 40 ? <Tooltip>{process.cmdLine()}</Tooltip> : <div></div>}
                            placement='bottom'
                        >
                            <span
                                style={{
                                    fontFamily: 'monospace',
                                    display: 'block',
                                    width: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center',
                                }}
                            >
                              {process.cmdLine().length > 40 ? process.cmdLine().substring(0, 40) + '...' : process.cmdLine()}
                            </span>
                        </OverlayTrigger>
                    </Card.Text>
                    <div className='d-flex justify-content-center'>
                        <Button
                            variant={process.startOrStop() === null ? 'secondary' : 'success'}
                            disabled={process.startOrStop() === null || stopping}
                            className='mr-1 btn-sm'
                            style={customButtonStyle}
                            onClick={(e) => startStopProcess(e)}
                            id={'start-stop-button'}
                        >
                            {stopping ? LoadingSpinner() : process.startOrStopText()}
                        </Button>
                        <span style={{width: '3px'}}></span>
                        <Button
                            variant={process.canRestart() ? 'warning' : 'secondary'}
                            disabled={!process.canRestart() || restarting}
                            className='ml-1 btn-sm'
                            style={customButtonStyle}
                            onClick={(e) => restartProcess(e)}
                        >
                            {restarting ? LoadingSpinner() : api.loc("restart")}
                        </Button>
                    </div>
                    <div className='d-flex mt-2 justify-content-center'>
                        <Button
                            variant='info'
                            onClick={handleDetailsShow}
                            style={customButtonStyle}
                        >
                            {api.loc("show_details")}
                        </Button>
                    </div>
                </Card.Body>
                {modal}
            </Card>
        );
    }

    // table row mode
    return (
        <tr key={process.id} style={{textAlign: "center"}}>
            <td>{process.id}</td>
            <td>{<OverlayTrigger overlay={process.name.length > 40 ? <Tooltip>{process.name}</Tooltip> : <div></div>}>
                <span>
                    {process.name.length > 30 ? process.name.substring(0, 40) + '...' : process.name}
                </span>
            </OverlayTrigger>}</td>
            <td>{
            <OverlayTrigger
                overlay={process.cmdLine().length > 40 ? <Tooltip>{process.cmdLine()}</Tooltip> : <div></div>}
                placement='bottom'
            >
                <span
                    style={{
                        fontFamily: 'monospace',
                        display: 'block',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                    }}
                >
                  {process.cmdLine().length > 40 ? process.cmdLine().substring(0, 40) + '...' : process.cmdLine()}
                </span>
            </OverlayTrigger>
            }</td>
            <td>{<div
                style={{
                    minHeight: '1em',
                    padding: '5px',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                            <span style={{color: process.enabled ? 'green' : 'red'}}>
                                {process.enabled ? ' ' + api.loc("enabled") : ' ' + api.loc("disabled")}
                            </span>
                <span style={{fontWeight: 'bold'}}></span>
                {' | '}
                <span
                    style={{
                        color: process.statusColor(),
                    }}
                >
                              {process.localizedStatus()}
                            </span>
            </div>}</td>
            <td>
                <Button
                    variant={process.startOrStop() === null ? 'secondary' : 'success'}
                    disabled={process.startOrStop() === null || stopping}
                    className='mr-1 btn-sm'
                    style={customButtonStyle}
                    onClick={(e) => startStopProcess(e)}
                    id={'start-stop-button'}
                >
                    {stopping ? LoadingSpinner() : process.startOrStopText()}
                </Button>
            </td>
            <td>
                <Button
                    variant={process.canRestart() ? 'warning' : 'secondary'}
                    disabled={!process.canRestart() || restarting}
                    className='ml-1 btn-sm'
                    style={customButtonStyle}
                    onClick={(e) => restartProcess(e)}
                >
                    {restarting ? LoadingSpinner() : api.loc("restart")}
                </Button>
            </td>
            <td>
                <Button
                    variant='info'
                    onClick={handleDetailsShow}
                    style={customButtonStyle}
                >
                    {api.loc("show_details")}
                </Button>
            </td>
            <td>
                <div
                    style={{
                        // position: 'absolute',
                        // top: '10px',
                        // right: '10px',
                        fontSize: '1.5em',
                        cursor: 'pointer',
                        rotate: '45deg',
                    }}
                >
                    {process.isPinned() ? (
                        <PinFill onClick={handlePinClick}/>
                    ) : (
                        <Pin onClick={handlePinClick}/>
                    )}
                </div>
            </td>
            {modal}
        </tr>
    );
}

export default ProcessCard;
