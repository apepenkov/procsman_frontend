import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
  Tabs,
  Tab,
} from 'react-bootstrap';
import { Pin, PinFill } from 'react-bootstrap-icons';
import { buildGradient } from '../api';
import api from '../api';
import ProcessCardStats from './processCardStats';
import ProcessCardLogs from './processCardLogs';
import ProcessCardEdit from './processCardEdit';
import loadingSpinner from '../loadingSpinner';

function ProcessCard({ process }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsClose = () => setShowDetails(false);
  const handleDetailsShow = () => setShowDetails(true);
  const handlePinClick = () => {
    process.togglePinned();
  };
  const [selectedTab, setSelectedTab] = useState('status');

  const startStopProcess = (e) => {
    const res = process.startOrStop();
    if (res === null) {
      return;
    }

    e.enabled = false;
    e.target.disabled = true; // set loading state
    // set loading state
    const wasHtml = e.target.innerHTML;

    e.target.innerHTML = loadingSpinner();

    setTimeout(() => {
      api.mbCallback();
    }, 300);

    setTimeout(() => {
      api.mbCallback();
    }, 600);

    if (res === 'start') {
      api
        .startProcess(process.id)
        .then(() => {})
        .finally(() => {
          e.target.innerHTML = wasHtml;
          e.target.disabled = false;
          e.enabled = true;
        });
    } else {
      api
        .stopProcess(process.id)
        .then(() => {})
        .finally(() => {
          e.target.innerHTML = wasHtml;
          e.target.disabled = false;
          e.enabled = true;
        });
    }
  };

  const restartProcess = (e) => {
    e.target.disabled = true; // set loading state
    // set loading state
    const wasHtml = e.target.innerHTML;
    e.target.innerHTML = loadingSpinner();

    setTimeout(() => {
      api.mbCallback();
    }, 300);

    setTimeout(() => {
      api.mbCallback();
    }, 600);

    api
      .restartProcess(process.id)
      .then(() => {
        e.target.disabled = false;
      })
      .finally(() => {
        e.target.innerHTML = wasHtml;
      });
  };

  const customButtonStyle = {
    padding: '0.25rem 0.5rem', // Reduced vertical padding, adjust as needed
    fontSize: '0.875rem', // Adjust font size if necessary
    lineHeight: '1', // This ensures that the text inside the button is centered
  };

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
            <PinFill onClick={handlePinClick} />
          ) : (
            <Pin onClick={handlePinClick} />
          )}
        </div>
        <Card.Title style={{ minHeight: '3em', paddingRight: '20px' }}>
          {process.name}
        </Card.Title>
        <Card.Subtitle
          className='mb-2 text-muted d-flex justify-content-center'
          style={{ minHeight: '1em' }}
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
            <span style={{ color: process.enabled ? 'green' : 'red' }}>
              {' '}
              {process.enabled ? ' Enabled' : ' Disabled'}
            </span>
            <span style={{ fontWeight: 'bold' }}>{' | '}</span>
            <span
              style={{
                color: process.statusColor(),
              }}
            >
              {process.status}
            </span>
          </div>
        </Card.Subtitle>
        <Card.Text>
          {/*monospace font for process.cmdLine() in a grey field, must be same length as parent element*/}
          <OverlayTrigger
            overlay={<Tooltip>{process.cmdLine()}</Tooltip>}
            placement='bottom'
          >
            <span
              style={{
                fontFamily: 'monospace',
                backgroundColor: 'rgba(211,211,211,0.3)',
                borderRadius: '10px',
                padding: '5px',
                display: 'block',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              {process.cmdLine()}
            </span>
          </OverlayTrigger>
        </Card.Text>
        <div className='d-flex justify-content-center'>
          <Button
            variant={process.startOrStop() === null ? 'secondary' : 'success'}
            disabled={process.startOrStop() === null}
            className='mr-1 btn-sm'
            style={customButtonStyle}
            onClick={(e) => startStopProcess(e)}
            id={'start-stop-button'}
          >
            {process.startOrStopText()}
          </Button>
          <span style={{ width: '3px' }}></span>
          <Button
            variant={process.canRestart() ? 'warning' : 'secondary'}
            disabled={!process.canRestart()}
            className='ml-1 btn-sm'
            style={customButtonStyle}
            onClick={(e) => restartProcess(e)}
          >
            Restart
          </Button>
        </div>
        <div className='d-flex mt-2 justify-content-center'>
          <Button
            variant='info'
            onClick={handleDetailsShow}
            style={customButtonStyle}
          >
            Show Details
          </Button>
        </div>
      </Card.Body>

      {/* Modal for detailed info */}
      <Modal show={showDetails} onHide={handleDetailsClose} size={'xl'}>
        <Modal.Header closeButton>
          <Modal.Title>Details for {process.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            activeKey={selectedTab}
            onSelect={(k) => setSelectedTab(k)}
            className='mb-4'
          >
            <Tab eventKey={'status'} title='Status, resources, events'>
              <ProcessCardStats
                process={process}
                showDetails={showDetails}
                selectedTab={selectedTab}
              ></ProcessCardStats>
            </Tab>
            <Tab title={'Logs'} eventKey={'logs'}>
              <ProcessCardLogs
                process={process}
                showDetails={showDetails}
                selectedTab={selectedTab}
              ></ProcessCardLogs>
            </Tab>
            <Tabs title={'Configuration'} eventKey={'configuration'}>
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
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}

export default ProcessCard;
