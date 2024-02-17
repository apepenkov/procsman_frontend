import React, {useEffect, useRef, useState} from 'react';
import {
    Card,
    Button,
    Modal,
    OverlayTrigger,
    Tooltip,
    Tabs,
    Tab,
    Form, Table,
} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import {Pin, PinFill} from 'react-bootstrap-icons';
import {buildGradient} from '../api';
import api from '../api';

import * as echarts from 'echarts/core';
import {
    LineChart,
} from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    DataZoomComponent,
    ToolboxComponent
} from 'echarts/components';
import {
    CanvasRenderer,
} from 'echarts/renderers';

// Register the required components
echarts.use(
    [TitleComponent, TooltipComponent, GridComponent, LineChart, CanvasRenderer, DataZoomComponent, ToolboxComponent]
);


function ProcessCard({process}) {
    const [showDetails, setShowDetails] = useState(false);

    const handleDetailsClose = () => setShowDetails(false);
    const handleDetailsShow = () => setShowDetails(true);
    const handlePinClick = () => {
        process.togglePinned();
    };
    const [selectedTab, setSelectedTab] = useState('status');


    const [normalizationMode, setNormalizationMode] = useState('none'); // 'timeBased' as the other option
    const [desiredDataPoints, setDesiredDataPoints] = useState(300);
    const [desiredIntervalSeconds, setDesiredIntervalSeconds] = useState(30);
    const [dateTimeFrom, setDateTimeFrom] = useState(new Date(new Date().setHours(new Date().getHours() - 2)));
    const [dateTimeTo, setDateTimeTo] = useState(null);

    const [dateTimeFromInvalid, setDateTimeFromInvalid] = useState(false);
    const [dateTimeToInvalid, setDateTimeToInvalid] = useState(false);

    const [events, setEvents] = useState([]); // State to hold events data
    const [loadingEvents, setLoadingEvents] = useState(false); // State to manage loading indicator for events

    function normalizeDataPoints(data, labels, mode, targetPoints, intervalSeconds) {
        if (mode === 'pointBased') {
            return pointBasedNormalization(data, labels, targetPoints);
        } else if (mode === 'timeBased') {
            return timeBasedNormalization(data, labels, intervalSeconds);
        } else if (mode === 'none') {
            return {normalizedData: data, normalizedLabels: labels};

        } else {
            console.error('Unsupported normalization mode');
            return {normalizedData: [], normalizedLabels: []};
        }
    }

    function pointBasedNormalization(data, labels, targetPoints) {
        const segmentSize = Math.ceil(data.length / targetPoints);
        const normalizedData = [];
        const normalizedLabels = [];

        for (let i = 0; i < targetPoints; i++) {
            const segmentStart = i * segmentSize;
            const segmentEnd = Math.min(segmentStart + segmentSize, data.length);
            const segmentData = data.slice(segmentStart, segmentEnd);
            const average = segmentData.reduce((acc, val) => acc + val, 0) / (segmentData.length || 1);

            normalizedData.push(Math.max(0, average)); // Ensure non-negative values

            // For labels, choose the start of each segment for readability
            const labelIndex = Math.min(segmentStart, labels.length - 1);
            normalizedLabels.push(new Date(labels[labelIndex] * 1000).toLocaleTimeString()); // Adjust for Unix timestamp in seconds
        }

        return {normalizedData, normalizedLabels};
    }


    function timeBasedNormalization(data, labels, intervalSeconds) {
        if (!data.length || !labels.length) return {normalizedData: [], normalizedLabels: []};

        // Convert labels to milliseconds for JavaScript Date compatibility
        const labelsInMs = labels.map(label => label * 1000);
        const startTime = labelsInMs[0];
        const endTime = labelsInMs[labelsInMs.length - 1];
        const normalizedData = [];
        const normalizedLabels = [];

        for (let currentTime = startTime; currentTime <= endTime; currentTime += intervalSeconds * 1000) {
            const relevantDataPoints = data.filter((_, index) => labelsInMs[index] >= currentTime && labelsInMs[index] < currentTime + intervalSeconds * 1000);
            const average = relevantDataPoints.reduce((acc, curr) => acc + curr, 0) / (relevantDataPoints.length || 1);

            normalizedData.push(Math.max(0, average)); // Avoid negative values
            normalizedLabels.push(new Date(currentTime).toLocaleTimeString()); // Convert back to readable time
        }

        return {normalizedData, normalizedLabels};
    }

    const SharedChartOptions = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },

        xAxis: {
            type: 'time',
        },
        yAxis: {
            type: 'value'
        },

        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 0,
                end: 100
            }
        ],
    }

    const CpuChartOptions = {
        ...SharedChartOptions,
        title: {
            left: 'center',
            text: 'CPU Usage (%)'
        },
    }


    const RamChartOptions = {
        ...SharedChartOptions,
        title: {
            left: 'center',
            text: 'RAM Usage (MB)'
        },
    }

    const [cpuChartData, setCpuChartData] = useState({
        ...CpuChartOptions,
        series: [{
            data: [],
            type: 'line',
            areaStyle: {},
        }]
    });

    const [ramChartData, setRamChartData] = useState({
        ...RamChartOptions,
        series: [{
            data: [],
            type: 'line',
            areaStyle: {},
        }]
    });

    const updateChartData = (cpuData, ramData, cpuLabels, ramLabels) => {
        // Prepare ECharts series data
        const cpuSeriesData = cpuLabels.map((label, index) => {
            return [new Date(label * 1000), cpuData[index]];
        });

        const ramSeriesData = ramLabels.map((label, index) => {
            return [new Date(label * 1000), ramData[index]];
        });

        // Set options for ECharts
        setCpuChartData({
            ...CpuChartOptions,
            series: [{
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {
                    color: 'rgb(0,255,11)',
                },
                itemStyle: {
                    color: 'rgb(0,150,10)'
                },
                data: cpuSeriesData,
            }],
        });

        setRamChartData({
            ...RamChartOptions,
            series: [{
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {
                    color: 'rgb(66,66,255)',
                },
                itemStyle: {
                    color: 'rgb(0,0,255)'
                },
                data: ramSeriesData,
            }],
        });
    };

    const refreshAndSetStatsData = async () => {
        let stats = await api.getProcessStats(process.id, dateTimeFrom, dateTimeTo);
        if (stats === undefined) {
            // user has already got a popup from the api
            return;
        }
        stats = stats.json;


        // Normalize CPU and RAM data
        const {normalizedData: normalizedCpuData, normalizedLabels: normalizedCpuLabels} = normalizeDataPoints(
            stats.cpu.map((data) => data.usage_percent),
            stats.cpu.map((data) => data.record_time),
            normalizationMode,
            desiredDataPoints,
            desiredIntervalSeconds
        );

        const {normalizedData: normalizedRamData, normalizedLabels: normalizedRamLabels} = normalizeDataPoints(
            stats.memory.map((data) => data.usage_bytes / 1024 / 1024), // Convert bytes to MB
            stats.memory.map((data) => data.record_time),
            normalizationMode,
            desiredDataPoints,
            desiredIntervalSeconds
        );

        // Update chart data
        updateChartData(normalizedCpuData, normalizedRamData, normalizedCpuLabels, normalizedRamLabels);
    }

    const refreshAndSetEventsData = async () => {
        setLoadingEvents(true); // Start loading
        try {
            const res = await api.getProcessEvents(process.id);
            if (res !== undefined) {
                // Assuming the API response structure has an array of events
                setEvents(res.json.events || []); // Update state with fetched events
            }
        } catch (error) {
            console.error("Failed to fetch process events:", error);
        } finally {
            setLoadingEvents(false); // End loading
        }
    }

    const refreshAndSetData = async () => {
        await Promise.all([refreshAndSetStatsData(), refreshAndSetEventsData()]);
    };

    const renderEventsTable = () => {
        return (
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Event Type</th>
                </tr>
                </thead>
                <tbody>
                {events.map((event, index) => (
                    <tr key={index}>
                        <td>{new Date(event.time * 1000).toLocaleString()}</td>
                        <td>{event.event}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        );
    };

    useEffect(() => {
        if (showDetails) {
            refreshAndSetData();
        }
    }, [showDetails, process.id]);

    const customButtonStyle = {
        padding: '0.25rem 0.5rem', // Reduced vertical padding, adjust as needed
        fontSize: '0.875rem', // Adjust font size if necessary
        lineHeight: '1', // This ensures that the text inside the button is centered
    };

    const cpuChartRef = useRef(null);
    const ramChartRef = useRef(null);

    useEffect(() => {
        if (showDetails) {
            // Ensure the container divs are present in the DOM
            if (cpuChartRef.current && ramChartRef.current) {
                const cpuChart = echarts.init(cpuChartRef.current);
                cpuChart.setOption(cpuChartData);

                const ramChart = echarts.init(ramChartRef.current);
                ramChart.setOption(ramChartData);

                // Cleanup function to dispose of charts on component unmount or before re-initializing
                return () => {
                    cpuChart.dispose();
                    ramChart.dispose();
                };
            }
        }
        // This effect should run when `showDetails` changes and when the chart data changes
        // You might need to adjust dependencies based on your data fetching and updating logic
    }, [showDetails, cpuChartData, ramChartData]);


    const startStopProcess = (e) => {
        const res = process.startOrStop();
        if (res === null) {
            return;
        }

        e.enabled = false;
        e.target.disabled = true; // set loading state
        // set loading state
        const wasHtml = e.target.innerHTML;

        e.target.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        setTimeout(() => {
            api.mbCallback();
        }, 300);

        setTimeout(() => {
            api.mbCallback();
        }, 600);

        if (res === 'start') {
            api.startProcess(process.id).then(() => {
                e.target.innerHTML = wasHtml;
                e.target.disabled = false;
                e.enabled = true;
            });
        } else {
            api.stopProcess(process.id).then(() => {
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
        e.target.innerHTML =
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        setTimeout(() => {
            api.mbCallback();
        }, 300);

        setTimeout(() => {
            api.mbCallback();
        }, 600);

        api.restartProcess(process.id).then(() => {
            e.target.innerHTML = wasHtml;
            e.target.disabled = false;
        });
    };

    function toLocalISOString(date) {
        if (!date) return '';

        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
    }

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
                <Card.Title style={{minHeight: '3em', paddingRight: '20px'}}>
                    {process.name}
                </Card.Title>
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
                {process.enabled ? ' Enabled' : ' Disabled'}
            </span>
                        <span style={{fontWeight: 'bold'}}>{' | '}</span>
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
                    <span style={{width: '3px'}}></span>
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
                        <Tab eventKey='status' title='Status, resources, events'>
                            <Container>
                                <div className='d-flex justify-content-end'>
                                    <Button
                                        onClick={(e) => {
                                            e.target.disabled = true;
                                            // set spinner
                                            const wasHtml = e.target.innerHTML;
                                            e.target.innerHTML =
                                                '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

                                            refreshAndSetStatsData().then(() => {
                                                e.target.innerHTML = wasHtml;
                                                e.target.disabled = false;
                                            });
                                        }}
                                    >
                                        Refresh
                                    </Button>
                                </div>
                                <div className="normalization-controls">
                                    <Form>
                                        <Form.Group controlId="dateTimeFrom">
                                            <Form.Label>From</Form.Label>
                                            <Form.Control type="datetime-local"
                                                          value={toLocalISOString(dateTimeFrom)}
                                                          onChange={e => {
                                                              try {
                                                                  const date = new Date(e.target.value);
                                                                  if (isNaN(date)) {
                                                                      throw new Error('Invalid date');
                                                                  }
                                                                  setDateTimeFrom(date);
                                                                  setDateTimeFromInvalid(false);
                                                              } catch (e) {
                                                                  setDateTimeFromInvalid(true);
                                                              }
                                                          }}
                                                          isInvalid={dateTimeFromInvalid}/>
                                            <Form.Control.Feedback type="invalid">
                                                Please enter a valid date and time.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group controlId="dateTimeTo">
                                            <Form.Label>To</Form.Label>
                                            <Form.Control type="datetime-local"
                                                          value={dateTimeTo ? toLocalISOString(dateTimeTo) : toLocalISOString(new Date())}
                                                          onChange={e => {
                                                              try {
                                                                  const date = new Date(e.target.value);
                                                                  if (isNaN(date)) {
                                                                      throw new Error('Invalid date');
                                                                  }
                                                                  setDateTimeTo(date);
                                                                  setDateTimeToInvalid(false);
                                                              } catch (e) {
                                                                  setDateTimeToInvalid(true);
                                                              }
                                                          }
                                                          }
                                                          isInvalid={dateTimeToInvalid}/>
                                            <Form.Control.Feedback type="invalid">
                                                Please enter a valid date and time.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Form>
                                </div>
                                <div
                                    className='chart-container'
                                >
                                    <div ref={cpuChartRef} style={{width: '100%', height: '400px'}}></div>
                                </div>
                                <div
                                    className='chart-container'
                                >
                                    <div ref={ramChartRef} style={{width: '100%', height: '400px'}}></div>
                                </div>
                                <div>
                                    <h3>Events (last 30): </h3>
                                    {renderEventsTable()}
                                    <Button onClick={refreshAndSetEventsData} disabled={loadingEvents}>
                                        {loadingEvents ? 'Refreshing...' : 'Refresh Events'}
                                    </Button>
                                </div>
                            </Container>

                            {/*We need a separator, because the charts go out of their container for some reason*/}
                            <hr style={{margin: '30px 0'}}/>
                        </Tab>
                        <Tab title={'Logs'} eventKey={'logs'}></Tab>
                        <Tabs title={'Configuration'} eventKey={'configuration'}></Tabs>
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
