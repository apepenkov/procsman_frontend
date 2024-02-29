import React, {useEffect, useState} from 'react';
import {Card, Col, Container, Row, Tab, Tabs} from 'react-bootstrap';
import ProcessCard from '../ProcessCard/processcard';
import NavBarHeader from '../navbar/navbar';
import api, {GroupInfo, ProcessInfo} from '../api';
import './dashboard.css';

const SkeletonCard = () => {
    return (
        <Card
            className='skeleton-card'
            style={{width: '18rem', height: '10rem', backgroundColor: '#eee'}}
        >
            <Card.Body>
                <div className='skeleton-element'></div>
                <div className='skeleton-element'></div>
                <div className='skeleton-element'></div>
            </Card.Body>
        </Card>
    );
};
const calculateColSizes = (numberOfElements) => {
    const colSizes = {
        xs: 12 / Math.min(numberOfElements, 2),
        sm: 12 / Math.min(numberOfElements, 3),
        md: 12 / Math.min(numberOfElements, 3),
        lg: 12 / Math.min(numberOfElements, 4),
        xl: 12 / Math.min(numberOfElements, 6),
    };
    Object.keys(colSizes).forEach(
        (size) => (colSizes[size] = Math.floor(colSizes[size]))
    );
    return colSizes;
};

function Dashboard({switchView, view}) {
    const [groupedProcesses, setGroupedProcesses] = useState({
        processes: [],
        groups: {},
    });
    const [selectedTab, setSelectedTab] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    const rowClasses = 'd-flex justify-content-center';

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Start loading
            const data = await api.getGroupedProcesses();
            setGroupedProcesses(data);
            setIsLoading(false); // End loading
        };
        fetchData();
        const handleCardsChanged = (newData) => {
            if (newData === null) {
                return;
            }
            setGroupedProcesses((prevData) => {
                const updatedProcesses = newData.processes.map((newProcessData) => {
                    const existingProcess = prevData.processes.find(
                        (p) => p.id === newProcessData.id
                    );
                    if (existingProcess) {
                        // Update existing ProcessInfo instance
                        Object.assign(existingProcess, new ProcessInfo(newProcessData));
                        return existingProcess;
                    } else {
                        // Create new ProcessInfo instance
                        return new ProcessInfo(newProcessData);
                    }
                });

                const updatedGroups = {};
                for (const [groupId, group] of Object.entries(newData.groups)) {
                    const existingGroup = prevData.groups[groupId];
                    if (existingGroup) {
                        Object.assign(existingGroup, new GroupInfo(group));
                        updatedGroups[groupId] = existingGroup;
                    } else {
                        updatedGroups[groupId] = new GroupInfo(group);
                    }
                }

                return {
                    processes: updatedProcesses,
                    groups: updatedGroups,
                };
            });
        };

        api.setCardsChangedCallbackDashboard(handleCardsChanged); // Assume this sets the callback for live updates

        return () => {
            api.setCardsChangedCallbackDashboard(null); // Cleanup
        };
    }, []);

    // Function to render process cards
    const renderProcessCards = (processes) => {
        if (!Array.isArray(processes)) {
            console.error('Processes is not an array');
            return;
        }
        const dynamicColSizes = calculateColSizes(processes.length);
        return processes.map((process) => (
            <Col key={process.id} {...dynamicColSizes} className={rowClasses}>
                <ProcessCard process={process}/>
            </Col>
        ));
    };

    const renderGroupedProcessCards = (groupId) => {
        const processesInGroup = groupedProcesses.processes.filter(
            (process) => process.process_group_id == groupId
        );
        return renderProcessCards(processesInGroup);
    };

    // Render pinned processes
    const pinnedProcesses = groupedProcesses.processes.filter((process) =>
        process.isPinned()
    );

    return (
        <div>
            <NavBarHeader switchView={switchView} view={view}/>
            <Container
                // it should take up 90% of the width of the screen
                className='mt-4'
                style={{background: 'rgba(255, 255, 255, 0.6)', borderRadius: '10px'}}
            >
                <h4>Pinned Processes</h4>

                {isLoading ? (
                        <Row className={rowClasses}>
                            {Array.from({length: 3}).map((_, index) => (
                                <Col key={index} className={rowClasses}>
                                    <SkeletonCard/>
                                </Col>
                            ))}
                        </Row> // Placeholder for your loading animation
                    ) : // <Row className={rowClasses}>{renderProcessCards(pinnedProcesses)}</Row>
                    pinnedProcesses.length > 0 ? (
                        <Row className={rowClasses}>
                            {renderProcessCards(pinnedProcesses)}
                        </Row>
                    ) : (
                        <div className='d-flex justify-content-center'>
                            <p>No pinned processes</p>
                        </div>
                    )}

                <h4 className='mt-4'>All Processes</h4>

                <Tabs
                    activeKey={selectedTab}
                    onSelect={(k) => setSelectedTab(k)}
                    className='mb-4'
                >
                    <Tab eventKey='none' title='No Group'>
                        <Row className={rowClasses}>
                            {renderProcessCards(
                                groupedProcesses.processes.filter((p) => !p.process_group_id)
                            )}
                        </Row>
                    </Tab>
                    <Tab eventKey='all' title='All'>
                        {isLoading ? (
                            <Row className={rowClasses}>
                                {Array.from({length: 3}).map((_, index) => (
                                    <Col key={index} className={rowClasses}>
                                        <SkeletonCard/>
                                    </Col>
                                ))}
                            </Row> // Placeholder for your loading animation
                        ) : (
                            <Row className={rowClasses}>
                                {renderProcessCards(groupedProcesses.processes)}
                            </Row>
                        )}
                    </Tab>
                    {Object.entries(groupedProcesses.groups).map(([groupId, group]) => (
                        <Tab eventKey={groupId} title={group.name} key={groupId}>
                            <Row className={rowClasses}>
                                {renderGroupedProcessCards(groupId)}
                            </Row>
                        </Tab>
                    ))}
                </Tabs>
            </Container>
        </div>
    );
}

export default Dashboard;
