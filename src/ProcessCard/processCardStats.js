import React, {useEffect, useRef, useState} from 'react';
import {Button, Form, Table} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import api from '../api';

import * as echarts from 'echarts/core';
import {LineChart} from 'echarts/charts';
import {
    DataZoomComponent,
    GridComponent,
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import LoadingSpinner from '../loadingSpinner';
import {ArrowClockwise} from "react-bootstrap-icons";

// Register the required components
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LineChart,
    CanvasRenderer,
    DataZoomComponent,
    ToolboxComponent,
]);

function ProcessCardStats({process, selectedTab, showDetails}) {
    const [dateTimeFrom, setDateTimeFrom] = useState(
        new Date(new Date().setHours(new Date().getHours() - 2))
    );
    const [dateTimeTo, setDateTimeTo] = useState(null);

    const [dateTimeFromInvalid, setDateTimeFromInvalid] = useState(false);
    const [dateTimeToInvalid, setDateTimeToInvalid] = useState(false);

    const [events, setEvents] = useState([]); // State to hold events data
    const [loadingEvents, setLoadingEvents] = useState(false); // State to manage loading indicator for events
    const [refreshingGraphs, setRefreshingGraphs] = useState(false);

    function normalizeDataPoints(data, labels) {
        return {normalizedData: data, normalizedLabels: labels};
    }

    const cpuChartRef = useRef(null);
    const ramChartRef = useRef(null);

    function toLocalISOString(date) {
        if (!date) return '';

        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().slice(0, 16);
    }

    const SharedChartOptions = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            },
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none',
                },
                restore: {},
                saveAsImage: {},
            },
        },

        xAxis: {
            type: 'time',
        },
        yAxis: {
            type: 'value',
        },

        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                start: 0,
                end: 100,
            },
        ],
    };

    const CpuChartOptions = {
        ...SharedChartOptions,
        title: {
            left: 'center',
            text: 'CPU Usage (%)',
        },
    };

    const RamChartOptions = {
        ...SharedChartOptions,
        title: {
            left: 'center',
            text: 'RAM Usage (MB)',
        },
    };

    const [cpuChartData, setCpuChartData] = useState({
        ...CpuChartOptions,
        series: [
            {
                data: [],
                type: 'line',
                areaStyle: {},
            },
        ],
    });

    const [ramChartData, setRamChartData] = useState({
        ...RamChartOptions,
        series: [
            {
                data: [],
                type: 'line',
                areaStyle: {},
            },
        ],
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
            series: [
                {
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    areaStyle: {
                        color: 'rgb(0,255,11)',
                    },
                    itemStyle: {
                        color: 'rgb(0,150,10)',
                    },
                    data: cpuSeriesData,
                },
            ],
        });

        setRamChartData({
            ...RamChartOptions,
            series: [
                {
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    areaStyle: {
                        color: 'rgb(66,66,255)',
                    },
                    itemStyle: {
                        color: 'rgb(0,0,255)',
                    },
                    data: ramSeriesData,
                },
            ],
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
        const {
            normalizedData: normalizedCpuData,
            normalizedLabels: normalizedCpuLabels,
        } = normalizeDataPoints(
            stats.cpu.map((data) => data.usage_percent),
            stats.cpu.map((data) => data.record_time)
        );

        const {
            normalizedData: normalizedRamData,
            normalizedLabels: normalizedRamLabels,
        } = normalizeDataPoints(
            stats.memory.map((data) => data.usage_bytes / 1024 / 1024), // Convert bytes to MB
            stats.memory.map((data) => data.record_time)
        );

        // Update chart data
        updateChartData(
            normalizedCpuData,
            normalizedRamData,
            normalizedCpuLabels,
            normalizedRamLabels
        );
    };

    const refreshAndSetEventsData = async () => {
        setLoadingEvents(true);
        api.getProcessEvents(process.id).then((res) => {
                if (res !== undefined) {
                    setEvents(res.json.events || []); // Update state with fetched events
                }
            }
        ).finally(() => {
            setLoadingEvents(false);
        })
    };

    const refreshAndSetData = async () => {
        await Promise.all([refreshAndSetStatsData(), refreshAndSetEventsData()]);
    };

    useEffect(() => {
        if (showDetails && selectedTab === 'status') {
            refreshAndSetData();
        }
    }, [showDetails, process.id]);

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
        if (showDetails && selectedTab === 'status') {
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
    }, [showDetails, selectedTab, cpuChartData, ramChartData]);


    return (
        <Container>
            <div className='d-flex justify-content-end'>
                <Button
                    onClick={(e) => {
                        setRefreshingGraphs(true);

                        refreshAndSetStatsData().finally(() => {
                            setRefreshingGraphs(false);
                        });
                    }}
                    disabled={refreshingGraphs}
                >
                    {refreshingGraphs ? (
                        LoadingSpinner()
                    ) : (
                        <div>
                            <ArrowClockwise
                                style={{marginBottom: '4px'}}
                            ></ArrowClockwise>{' '}
                            Refresh
                        </div>
                    )}
                </Button>
            </div>
            <div className='normalization-controls'>
                <Form>
                    <Form.Group controlId='dateTimeFrom'>
                        <Form.Label>From</Form.Label>
                        <Form.Control
                            type='datetime-local'
                            value={toLocalISOString(dateTimeFrom)}
                            onChange={(e) => {
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
                            isInvalid={dateTimeFromInvalid}
                        />
                        <Form.Control.Feedback type='invalid'>
                            Please enter a valid date and time.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId='dateTimeTo'>
                        <Form.Label>To</Form.Label>
                        <Form.Control
                            type='datetime-local'
                            value={
                                dateTimeTo
                                    ? toLocalISOString(dateTimeTo)
                                    : toLocalISOString(new Date())
                            }
                            onChange={(e) => {
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
                            }}
                            isInvalid={dateTimeToInvalid}
                        />
                        <Form.Control.Feedback type='invalid'>
                            Please enter a valid date and time.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>
            </div>
            <div className='chart-container'>
                <div ref={cpuChartRef} style={{width: '100%', height: '400px'}}></div>
            </div>
            <div className='chart-container'>
                <div ref={ramChartRef} style={{width: '100%', height: '400px'}}></div>
            </div>
            <div>
                <h3>Events (last 30): </h3>
                <Button onClick={refreshAndSetEventsData} disabled={loadingEvents}>
                    {loadingEvents ? LoadingSpinner() : 'Refresh Events'}
                </Button>
                {renderEventsTable()}
            </div>
        </Container>
    );
}

export default ProcessCardStats;
