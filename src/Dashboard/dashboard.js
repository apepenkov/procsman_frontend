import React, {useEffect, useState} from 'react';
import {Card, Col, Container, Form, Row, Tab, Table, Tabs} from 'react-bootstrap';
import ProcessCard from '../ProcessCard/processcard';
import NavBarHeader from '../navbar/navbar';
import api, {GroupInfo, ProcessInfo} from '../api';
import './dashboard.css';
import {Gear} from "react-bootstrap-icons";
import EditGroup from "./editGroup";
import {WrapInTooltip} from "../guideModeContext";
import LoadingSpinner from "../loadingSpinner";

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
    const [showEditGroup, setShowEditGroup] = useState(null);
    const [searchText, setSearchText] = useState('');

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
            // if new data is the same as the old data, do nothing.
            if (JSON.stringify(newData) === JSON.stringify(groupedProcesses)) {
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
        const toRender = [];
        for (let i = 0; i < processes.length; i++) {
            if (
                searchText.length > 0 &&
                (!processes[i].name.toLowerCase().includes(searchText.toLowerCase()) &&
                    !processes[i].cmdLine().toLowerCase().includes(searchText.toLowerCase()))
            ) {
                continue;
            }
            if (api.cardMode()) {
                toRender.push(
                    <Col key={processes[i].id} {...dynamicColSizes} className={rowClasses}>
                        <ProcessCard process={processes[i]}/>
                    </Col>
                );
            } else {
                // push ProcessCard as table row

                toRender.push(
                    <ProcessCard process={processes[i]}/>
                );
            }
        }
        return toRender;
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

    if (api.cardMode()) {
        return (
            <div>
                <NavBarHeader switchView={switchView} view={view}/>
                <div className="floating-container">
                    <Container style={{justifyContent: 'center'}}>
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicSearch">
                                <WrapInTooltip text={api.loc("guide", "search")} placement={"left"}>
                                    <Form.Control type="search" placeholder={api.loc('search_placeholder')}
                                                  value={searchText}
                                                  onChange={(e) => setSearchText(e.target.value)}/>
                                </WrapInTooltip>

                            </Form.Group>
                        </Form>
                    </Container>
                </div>

                <Container
                    className='mt-4'
                    style={{borderRadius: '10px'}}
                >
                    <WrapInTooltip text={api.loc("guide", "pinned_processes")} placement={"right"}>
                        <h4>{api.loc("pinned_processes")}</h4>
                    </WrapInTooltip>

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
                                <p>{api.loc("no_pin_processes")}</p>
                            </div>
                        )}

                    <h4 className='mt-4'>{api.loc("all_processes")}</h4>

                    <Tabs
                        activeKey={selectedTab}
                        onSelect={(k) => setSelectedTab(k)}
                        className='mb-4'
                    >
                        <Tab eventKey='none' title={
                            <WrapInTooltip text={api.loc("guide", "processes_no_group")} placement={"left"}>
                                <div>{api.loc("no_group")}</div>
                            </WrapInTooltip>
                        }>
                            <Row className={rowClasses}>
                                {renderProcessCards(
                                    groupedProcesses.processes.filter((p) => !p.process_group_id)
                                )}
                            </Row>
                        </Tab>


                        <Tab eventKey='all'
                             title={
                                 <WrapInTooltip text={api.loc("guide", "all_processes")} placement={"bottom"}>
                                     <div>{api.loc("all")}</div>
                                 </WrapInTooltip>
                             }
                        >
                            <div>
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
                            </div>
                        </Tab>


                        {Object.entries(groupedProcesses.groups).map(([groupId, group], index) => (
                            <Tab eventKey={groupId} title={
                                /*All but 1st element must have dummy=true by checking index in a list*/
                                <WrapInTooltip dummy={index !== 0} text={api.loc("guide", "group_name")}
                                               placement={"right"}>
                                    <div>
                                        {selectedTab === groupId ? (
                                            <div onClick={() => {
                                                setShowEditGroup(group.id)
                                            }}>
                                                {group.name}
                                                <Gear style={{marginLeft: '5px', marginBottom: '4px'}}></Gear>
                                            </div>
                                        ) : (
                                            group.name
                                        )}
                                    </div>
                                </WrapInTooltip>

                            } key={groupId}>
                                <EditGroup showEditGroup={showEditGroup} setShowEditGroup={setShowEditGroup}
                                           group={group}/>

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

    // tables mode

    const tHead = (
        <thead>
        <tr style={{textAlign: "center"}}>
            <th>#</th>
            <th>{api.loc("process_name")}</th>
            <th>{api.loc("process_cmd")}</th>
            <th>{api.loc("process_status")}</th>
            <th colSpan={4}>{api.loc("process_actions")}</th>
        </tr>
        </thead>
    );

    return (
        <div>
            <NavBarHeader switchView={switchView} view={view}/>
            <div className="floating-container">
                <Container style={{justifyContent: 'center'}}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicSearch">
                            <WrapInTooltip text={api.loc("guide", "search")} placement={"left"}>
                                <Form.Control type="search" placeholder={api.loc('search_placeholder')}
                                              value={searchText}
                                              onChange={(e) => setSearchText(e.target.value)}/>
                            </WrapInTooltip>
                        </Form.Group>
                    </Form>
                </Container>
            </div>

            <Container
                className='mt-4'
                style={{borderRadius: '10px'}}
            >
                <WrapInTooltip text={api.loc("guide", "pinned_processes")} placement={"right"}>
                    <h4>{api.loc("pinned_processes")}</h4>
                </WrapInTooltip>

                {isLoading ? <LoadingSpinner/> : (pinnedProcesses.length > 0 ? (
                    <Table responsive striped bordered hover size="sm">
                        {tHead}
                        <tbody>
                        {renderProcessCards(pinnedProcesses)}
                        </tbody>
                    </Table>
                ) : (
                    <div className='d-flex justify-content-center'>
                        <p>{api.loc("no_pin_processes")}</p>
                    </div>
                ))
                }

                <h4 className='mt-4'>{api.loc("all_processes")}</h4>

                <Tabs
                    activeKey={selectedTab}
                    onSelect={(k) => setSelectedTab(k)}
                    className='mb-4'
                >
                    <Tab eventKey='none' title={
                        <WrapInTooltip text={api.loc("guide", "processes_no_group")} placement={"left"}>
                            <div>{api.loc("no_group")}</div>
                        </WrapInTooltip>
                    }>
                        <div>
                            {isLoading ? <LoadingSpinner/> : (<Table responsive striped bordered hover size="sm">
                                {tHead}
                                <tbody>
                                {renderProcessCards(
                                    groupedProcesses.processes.filter((p) => !p.process_group_id)
                                )}
                                </tbody>
                            </Table>)}
                        </div>
                    </Tab>

                    <Tab eventKey='all'
                         title={
                             <WrapInTooltip text={api.loc("guide", "all_processes")} placement={"bottom"}>
                                 <div>{api.loc("all")}</div>
                             </WrapInTooltip>
                         }
                    >
                        <div>
                            {isLoading ? <LoadingSpinner/> : (<Table responsive striped bordered hover size="sm">
                                {tHead}
                                <tbody>
                                {renderProcessCards(groupedProcesses.processes)}
                                </tbody>
                            </Table>)}
                        </div>
                    </Tab>

                    {Object.entries(groupedProcesses.groups).map(([groupId, group], index) => (
                        <Tab eventKey={groupId} title={
                            /*All but 1st element must have dummy=true by checking index in a list*/
                            <WrapInTooltip dummy={index !== 0} text={api.loc("guide", "group_name")}
                                           placement={"right"}>
                                <div>
                                    {selectedTab === groupId ? (
                                        <div onClick={() => {
                                            setShowEditGroup(group.id)
                                        }}>
                                            {group.name}
                                            <Gear style={{marginLeft: '5px', marginBottom: '4px'}}></Gear>
                                        </div>
                                    ) : (
                                        group.name
                                    )}
                                </div>
                            </WrapInTooltip>

                        } key={groupId}>
                            <EditGroup showEditGroup={showEditGroup} setShowEditGroup={setShowEditGroup} group={group}/>

                            {isLoading ? <LoadingSpinner/> : (<Table responsive striped bordered hover size="sm">
                                {tHead}
                                <tbody>
                                {renderGroupedProcessCards(groupId)}
                                </tbody>
                            </Table>)}
                        </Tab>
                    ))}
                </Tabs>
            </Container>
        </div>
    );

}

export default Dashboard;
