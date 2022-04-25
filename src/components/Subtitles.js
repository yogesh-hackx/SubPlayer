import styled from 'styled-components';
import React, { useState, useCallback, useEffect } from 'react';
import { Table } from 'react-virtualized';
import unescape from 'lodash/unescape';
import debounce from 'lodash/debounce';
import { ReactTransliterate } from 'react-transliterate';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);

    .ReactVirtualized__Table {
        .ReactVirtualized__Table__Grid {
            outline: none;
        }

        .ReactVirtualized__Table__row {
            overflow: visible !important;

            .item {
                height: 100%;
                padding: 5px;
                display: flex;

                .textarea {
                    border: none;
                    width: 100%;
                    height: 100%;
                    color: #fff;
                    font-size: 12px;
                    padding: 10px;
                    text-align: center;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.2s ease;
                    resize: none;
                    outline: none;

                    &.highlight {
                        background-color: rgb(0 87 158);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    &.illegal {
                        background-color: rgb(123 29 0);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                    &[disabled] {
                        cursor: pointer;
                    }
                }

                .suggestions ul {
                    z-index: 9999999999;
                    background: #181818;
                    opacity: 1;
                }
                .suggestions ul li:first-of-type {
                    opacity: 1;
                    background-color: #009688;
                    font-weight: bold;
                    color: white;
                }
            }
        }
    }
`;

export default function Subtitles({ currentIndex, subtitle, checkSub, player, updateSub, subTranslationLang }) {
    const [height, setHeight] = useState(100);
    const [hasTranslation, setHasTranslation] = useState(false);

    const resize = useCallback(() => {
        setHeight(document.getElementById('tools').clientHeight - 290);
    }, [setHeight]);

    useEffect(() => {
        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }
    }, [resize]);

    useEffect(() => {
        if (subtitle[0]?.originalText === undefined) setHasTranslation(false);
        else setHasTranslation(true);
    }, [subtitle, player])

    return (
        <Style className="subtitles">
            <Table
                headerHeight={40}
                width={hasTranslation ? 500 : 250}
                height={height}
                rowHeight={80}
                scrollToIndex={currentIndex}
                rowCount={subtitle.length}
                rowGetter={({ index }) => subtitle[index]}
                headerRowRenderer={() => null}
                rowRenderer={(props) => {
                    return (
                        <div
                            key={props.key}
                            className={props.className}
                            style={props.style}
                            onClick={() => {
                                if (player) {
                                    player.pause();
                                    if (player.duration >= props.rowData.startTime) {
                                        player.currentTime = props.rowData.startTime + 0.001;
                                    }
                                }
                            }}
                        >
                            <div className="item">
                                {
                                    hasTranslation &&
                                    <textarea
                                        maxLength={200}
                                        spellCheck={false}
                                        disabled
                                        className={[
                                            'textarea',
                                            currentIndex === props.index ? 'highlight' : '',
                                            checkSub(props.rowData) ? 'illegal' : '',
                                        ]
                                            .join(' ')
                                            .trim()}
                                        value={unescape(props.rowData.originalText)}
                                    />
                                }
                                <ReactTransliterate
                                    renderComponent={(props) => <textarea {...props} />}
                                    value={unescape(props.rowData.text)}
                                    maxLength={200}
                                    enabled={hasTranslation}
                                    spellCheck={false}
                                    containerClassName="suggestions"
                                    containerStyles={{width: '100%'}}
                                    className={[
                                        'textarea',
                                        currentIndex === props.index ? 'highlight' : '',
                                        checkSub(props.rowData) ? 'illegal' : '',
                                    ]
                                        .join(' ')
                                        .trim()}
                                    onChangeText={(text) => {
                                        updateSub(props.rowData, {
                                            text: text,
                                        });
                                    }}
                                    lang={subTranslationLang}
                                    />
                            </div>
                        </div>
                    );
                }}
            ></Table>
        </Style>
    );
}
