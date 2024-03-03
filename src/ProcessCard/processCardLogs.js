import React, {useEffect, useState} from 'react';
import {Button, ButtonGroup, Container, FormGroup} from 'react-bootstrap';
import api from '../api';
import Form from 'react-bootstrap/Form';
import Convert from 'ansi-to-html';
import './logs.css';
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Download,
  Fullscreen,
  FullscreenExit,
  Upload,
} from 'react-bootstrap-icons';
import LoadingSpinner from '../loadingSpinner';

const convert = new Convert();

function ProcessCardLogs({process, selectedTab, showDetails}) {
    const [isFull, setIsFull] = useState(false); // State to toggle full/collapsed view
    const [dateTimeFrom, setDateTimeFrom] = useState(
        new Date(new Date().setHours(new Date().getHours() - 4))
    );
    const [dateTimeTo, setDateTimeTo] = useState(null);

    const [dateTimeFromInvalid, setDateTimeFromInvalid] = useState(false);
    const [dateTimeToInvalid, setDateTimeToInvalid] = useState(false);

    const [stdIn, setStdIn] = useState('');
    const [convertedLogs, setConvertedLogs] = useState(
        convert.toHtml('\x1b[30mblack\x1b[37mwhite')
    );
    const [searchText, setSearchText] = useState('');

    const [caseSensitive, setCaseSensitive] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);
    const [processedLogs, setProcessedLogs] = useState({__html: ''});

    const [logsLoading, setLogsLoading] = useState(false);
    const [logsDownloadLoading, setLogsDownloadLoading] = useState(false);
    const [sendingStdIn, setSendingStdIn] = useState(false);

    function toLocalISOString(date) {
        if (!date) return '';

        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
        return adjustedDate.toISOString().slice(0, 16);
    }

    const loadLogs = async () => {
        const logsResponse = await api.getProcessLogs(
            process.id,
            dateTimeFrom,
            dateTimeTo
        );
        if (logsResponse === null || logsResponse === undefined) {
            return;
        }
        const logs = logsResponse.json.logs;
        if (logs === undefined || logs === null) {
            // TODO
            alert('No logs');
            return;
        }
        let logText = '';
        logs.forEach((log) => {
            if (log.missing) {
                return;
            }
            logText += log.text;
        });
        // console.log(logText)
        logText = logText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        setConvertedLogs(convert.toHtml(logText));
        // setLogs(logText)
    };

    useEffect(() => {
        if (showDetails && selectedTab === 'logs') {
            setLogsLoading(true);
            loadLogs().finally(() => {
                setLogsLoading(false);
            });
        }
    }, [showDetails, selectedTab]);

    useEffect(() => {
        if (!searchText) {
            const lines = convertedLogs
                .split('\n')
                .map((line) => `<div class="log-line">${line}</div>`)
                .join('');
            setProcessedLogs({__html: lines});
            return;
        }

        const flags = caseSensitive ? 'g' : 'gi';
        let searchRegex;
        try {
            searchRegex = useRegex
                ? new RegExp(searchText, flags)
                : new RegExp(
                    searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                    flags
                );
        } catch (e) {
            return;
        }

        let globalMatchIndex = 0; // Define matchIndex outside to ensure it's global
        const lines = convertedLogs
            .split('\n')
            .map((line) => {
                // Split the line into text and HTML tags
                const parts = line.split(/(<[^>]+>)/g); // This regex matches HTML tags
                const highlightedLine = parts
                    .map((part) => {
                        // Only replace in text, not in HTML tags
                        if (part.startsWith('<') && part.endsWith('>')) {
                            return part; // Return the HTML tag unchanged
                        } else {
                            // Replace searchText in text parts
                            return part.replace(searchRegex, (match) => {
                                const highlightClass =
                                    globalMatchIndex === currentMatchIndex
                                        ? 'current-highlight'
                                        : 'highlight';
                                const highlightedText = `<span class="${highlightClass}" data-match-index="${globalMatchIndex}">${match}</span>`;
                                globalMatchIndex++; // Increment globalMatchIndex for each match
                                return highlightedText;
                            });
                        }
                    })
                    .join(''); // Join back the text and HTML tags
                return `<div class="log-line">${highlightedLine}</div>`;
            })
            .join('');

        setProcessedLogs({__html: lines});
    }, [searchText, caseSensitive, useRegex, currentMatchIndex, convertedLogs]);

    useEffect(() => {
        if (!searchText) {
            setTotalMatches(0);
            setCurrentMatchIndex(0); // Reset to the first match
            return;
        }

        const flags = caseSensitive ? 'g' : 'gi';
        let searchRegex;
        try {
            searchRegex = useRegex
                ? new RegExp(searchText, flags)
                : new RegExp(
                    searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                    flags
                );
        } catch (e) {
            return;
        }
        let matchCount = 0;
        let isFirst = true;
        convertedLogs.split('\n').forEach((line) => {
            let match;
            try {
                match = line.match(searchRegex);
            } catch (e) {
                if (isFirst) {
                    return;
                }
                throw e;
            }
            if (match) {
                matchCount += match.length;
            }
            isFirst = false;
        });

        setTotalMatches(matchCount);
        setCurrentMatchIndex((prevIndex) =>
            prevIndex >= matchCount ? 0 : prevIndex
        ); // Reset if out of bounds
    }, [searchText, caseSensitive, useRegex, convertedLogs]);

    useEffect(() => {
        // Check if there are matches and if the search text is not empty
        if (totalMatches > 0 && searchText) {
            // Find the current highlighted element
            const currentHighlight = document.querySelector('.current-highlight');
            if (currentHighlight) {
                // Scroll the current highlighted element into view
                currentHighlight.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
    }, [currentMatchIndex, totalMatches, searchText]); // Depend on currentMatchIndex to re-run when it changes

    return (
        <Container>
            <Form.Control
                as='textarea'
                placeholder={api.loc("text_to_send_to_stdin")}
                onChange={(e) => {
                    setStdIn(e.target.value);
                }}
                value={stdIn}
            />
            <Button
                style={{marginTop: '1rem'}}
                onClick={(event) => {
                    setSendingStdIn(true);
                    api
                        .putStdin(process.id, stdIn)
                        .then((res) => {
                            if (res !== null) {
                                setStdIn('');
                            }
                        })
                        .finally(() => {
                            setSendingStdIn(false);
                        });
                }}
                disabled={sendingStdIn}
            >
                {sendingStdIn ? (
                    LoadingSpinner()
                ) : (
                    <div>
                        <Upload style={{marginBottom: '4px'}}></Upload> {api.loc("send_to_stdin")}
                    </div>
                )}
            </Button>

            <hr style={{margin: '30px 0'}}/>

            <Form>
                <ButtonGroup>
                    <Button
                        onClick={(e) => {
                            setLogsLoading(true);
                            loadLogs().finally(() => {
                                setLogsLoading(false);
                            });
                        }}
                        id='loadLogsButton'
                        disabled={logsLoading}
                    >
                        {logsLoading ? (
                            LoadingSpinner()
                        ) : (
                            <div>
                                <ArrowClockwise
                                    style={{marginBottom: '4px'}}
                                ></ArrowClockwise>{' '}
                                {api.loc("refresh_logs")}
                            </div>
                        )}
                    </Button>
                    <Button
                        variant={'info'}
                        onClick={(e) => {
                            setLogsDownloadLoading(true);
                            api
                                .downloadLogsZipFile(process.id, dateTimeFrom, dateTimeTo)
                                .then((resp) => {
                                    if (resp === undefined || resp === null) {
                                        return;
                                    }
                                    resp.response.blob().then((blob) => {
                                        const link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob); // Create an object URL for the blob
                                        link.download = `logs_${process.id}_from_${dateTimeFrom.toISOString()}_to_${(dateTimeTo ? dateTimeTo : new Date()).toISOString()}.zip`;

                                        document.body.appendChild(link);
                                        link.click();

                                        // Clean up by removing the temporary link and revoking the object URL
                                        window.URL.revokeObjectURL(link.href);
                                    });
                                })
                                .finally(() => {
                                    setLogsDownloadLoading(false);
                                });
                        }}
                        disabled={logsDownloadLoading}
                    >
                        {logsDownloadLoading ? (
                            LoadingSpinner()
                        ) : (
                            <div>
                                <Download style={{marginBottom: '4px'}}></Download> {api.loc("download_logs")}
                            </div>
                        )}
                    </Button>
                </ButtonGroup>

                <Form.Group controlId='dateTimeFrom'>
                    <Form.Label>{api.loc("from")}</Form.Label>
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
                        {api.loc("please_enter_valid_dt")}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId='dateTimeTo'>
                    <Form.Label>{api.loc("to")}</Form.Label>
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
                        {api.loc("please_enter_valid_dt")}
                    </Form.Control.Feedback>
                </Form.Group>
            </Form>
            <hr style={{margin: '30px 0'}}/>
            {/*<div className="log-container" dangerouslySetInnerHTML={renderLogs()}></div>*/}
            <Container>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                    }}
                >
                    <div>
                        <FormGroup>
                            <Form.Control
                                type='text'
                                placeholder={api.loc("search_logs")}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    width: 'auto',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                }}
                            />
                            <Button
                                variant='outline-secondary'
                                disabled={totalMatches === 0}
                                onClick={() =>
                                    setCurrentMatchIndex(
                                        currentMatchIndex - 1 >= 0
                                            ? currentMatchIndex - 1
                                            : totalMatches - 1
                                    )
                                }
                                style={{
                                    width: 'auto',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                }}
                            >
                                <ArrowLeft style={{marginBottom: '5px'}}></ArrowLeft>
                            </Button>
                            <Button
                                variant='outline-secondary'
                                disabled={totalMatches === 0}
                                onClick={() =>
                                    setCurrentMatchIndex((currentMatchIndex + 1) % totalMatches)
                                }
                                style={{
                                    width: 'auto',
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                }}
                            >
                                <ArrowRight style={{marginBottom: '5px'}}></ArrowRight>
                            </Button>
                            <Form.Check
                                type='checkbox'
                                label={api.loc("case_sensitive")}
                                checked={caseSensitive}
                                onChange={(e) => setCaseSensitive(e.target.checked)}
                                style={{
                                    display: 'inline-block',
                                    marginLeft: '10px',
                                    verticalAlign: 'middle',
                                }}
                            />
                            <Form.Check
                                type='checkbox'
                                label={api.loc("regex")}
                                checked={useRegex}
                                onChange={(e) => setUseRegex(e.target.checked)}
                                style={{
                                    display: 'inline-block',
                                    marginLeft: '10px',
                                    verticalAlign: 'middle',
                                }}
                            />
                        </FormGroup>
                    </div>
                    <Button
                        variant='outline-secondary'
                        onClick={() => setIsFull(!isFull)}
                    >
                        {isFull ? (
                            <>
                                <FullscreenExit size={24}/> {api.loc("collapse")}
                            </>
                        ) : (
                            <>
                                <Fullscreen size={24}/> {api.loc("expand")}
                            </>
                        )}
                    </Button>
                </div>

                <div
                    className={`log-container ${isFull ? api.loc("full") : api.loc('collapsed')}`}
                    dangerouslySetInnerHTML={processedLogs}
                ></div>
            </Container>
        </Container>
    );
}

export default ProcessCardLogs;
