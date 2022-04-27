import styled from 'styled-components';
import languages from '../libs/languages';
import { t, Translate } from 'react-i18nify';
import React, { useState, useCallback, useEffect } from 'react';
import { getExt, download } from '../utils';
import { file2sub, sub2vtt, sub2srt, sub2txt, url2sub } from '../libs/readSub';
import sub2ass from '../libs/readSub/sub2ass';
import googleTranslate from '../libs/googleTranslate';
import FFmpeg from '@ffmpeg/ffmpeg';
import SimpleFS from '@forlagshuset/simple-fs';
import ImportFromYT from './ImportFromYT';
import Subtitles from './Subtitles';
import { Dropdown, Menu } from 'antd';
import Sub from '../libs/Sub';

const Style = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 20px;
    position: relative;
    overflow: hidden;
    background-color: rgb(0 0 0 / 100%);
    border-left: 1px solid rgb(255 255 255 / 20%);

    .import {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        .btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 48%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #3f51b5;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }

        .file {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
        }
    }

    .import-yt {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 8px 10px 8px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        .btn {
            display: flex;
            align-items: center;
            border-radius: 3px;
            height: 35px;
            padding: 0 32px;
            background-color: #3f51b5;
            user-select: none;
            color: #fff;
            cursor: pointer;
            opacity: 0.85;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .burn {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        .btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 100%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .export {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        .btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 31%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #009688;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .operate {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        .btn {
            position: relative;
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 48%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #009688;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .translate {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        select {
            color: #000;
            width: 65%;
            outline: none;
            padding: 0 5px;
            border-radius: 3px;
        }

        .btn {
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 33%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .hotkey {
        display: flex;
        justify-content: space-between;
        padding: 10px;

        span {
            width: 49%;
            font-size: 13px;
            padding: 5px 0;
            border-radius: 3px;
            text-align: center;
            color: rgb(255 255 255 / 75%);
            background-color: rgb(255 255 255 / 20%);
        }
    }

    .bottom {
        padding: 10px;
        a {
            display: flex;
            flex-direction: column;
            border: 1px solid rgb(255 255 255 / 30%);
            text-decoration: none;

            .title {
                color: #ffeb3b;
                padding: 5px 10px;
                animation: animation 3s infinite;
                border-bottom: 1px solid rgb(255 255 255 / 30%);
            }

            @keyframes animation {
                50% {
                    color: #00bcd4;
                }
            }

            img {
                max-width: 100%;
            }
        }
    }

    .progress {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        z-index: 9;
        height: 2px;
        background-color: rgb(0 0 0 / 50%);

        span {
            display: inline-block;
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0;
            height: 100%;
            background-color: #ff9800;
            transition: all 0.2s ease 0s;
        }
    }
`;

FFmpeg.createFFmpeg({ log: true }).load();
const fs = new SimpleFS.FileSystem();

export default function Header({
    player,
    waveform,
    newSub,
    undoSubs,
    clearSubs,
    language,
    subtitle,
    setLoading,
    formatSub,
    setSubtitle,
    setProcessing,
    notify,
    currentIndex,
    checkSub,
    updateSub,
    subTranslationLang,
    setSubTranslationLang,
}) {
    const [translate, setTranslate] = useState('en');
    const [videoFile, setVideoFile] = useState(null);
    const [ytModalVisible, setYtModalVisible] = useState(false);

    const decodeAudioData = useCallback(
        async (file) => {
            try {
                const { createFFmpeg, fetchFile } = FFmpeg;
                const ffmpeg = createFFmpeg({ log: true });
                ffmpeg.setProgress(({ ratio }) => setProcessing(ratio * 100));
                setLoading(t('LOADING_FFMPEG'));
                await ffmpeg.load();
                ffmpeg.FS('writeFile', file.name, await fetchFile(file));
                setLoading('');
                notify({
                    message: t('DECODE_START'),
                    level: 'info',
                });
                const output = `${Date.now()}.mp3`;
                await ffmpeg.run('-i', file.name, '-ac', '1', '-ar', '8000', output);
                const uint8 = ffmpeg.FS('readFile', output);
                // download(URL.createObjectURL(new Blob([uint8])), `${output}`);
                await waveform.decoder.decodeAudioData(uint8);
                waveform.drawer.update();
                setProcessing(0);
                ffmpeg.setProgress(() => null);
                notify({
                    message: t('DECODE_SUCCESS'),
                    level: 'success',
                });
            } catch (error) {
                setLoading('');
                setProcessing(0);
                notify({
                    message: t('DECODE_ERROR'),
                    level: 'error',
                });
            }
        },
        [waveform, notify, setProcessing, setLoading],
    );

    const burnSubtitles = useCallback(async () => {
        try {
            const { createFFmpeg, fetchFile } = FFmpeg;
            const ffmpeg = createFFmpeg({ log: true });
            ffmpeg.setProgress(({ ratio }) => setProcessing(ratio * 100));
            setLoading(t('LOADING_FFMPEG'));
            await ffmpeg.load();
            setLoading(t('LOADING_FONT'));

            await fs.mkdir('/fonts');
            const fontExist = await fs.exists('/fonts/Microsoft-YaHei.ttf');
            if (fontExist) {
                const fontBlob = await fs.readFile('/fonts/Microsoft-YaHei.ttf');
                ffmpeg.FS('writeFile', `tmp/Microsoft-YaHei.ttf`, await fetchFile(fontBlob));
            } else {
                const fontUrl = 'https://cdn.jsdelivr.net/gh/zhw2590582/SubPlayer/docs/Microsoft-YaHei.ttf';
                const fontBlob = await fetch(fontUrl).then((res) => res.blob());
                await fs.writeFile('/fonts/Microsoft-YaHei.ttf', fontBlob);
                ffmpeg.FS('writeFile', `tmp/Microsoft-YaHei.ttf`, await fetchFile(fontBlob));
            }
            setLoading(t('LOADING_VIDEO'));
            ffmpeg.FS(
                'writeFile',
                videoFile ? videoFile.name : 'sample.mp4',
                await fetchFile(videoFile || 'sample.mp4'),
            );
            setLoading(t('LOADING_SUB'));
            const subtitleFile = new File([new Blob([sub2ass(subtitle)])], 'subtitle.ass');
            ffmpeg.FS('writeFile', subtitleFile.name, await fetchFile(subtitleFile));
            setLoading('');
            notify({
                message: t('BURN_START'),
                level: 'info',
            });
            const output = `${Date.now()}.mp4`;
            await ffmpeg.run(
                '-i',
                videoFile ? videoFile.name : 'sample.mp4',
                '-vf',
                `ass=${subtitleFile.name}:fontsdir=/tmp`,
                '-preset',
                videoFile ? 'fast' : 'ultrafast',
                output,
            );
            const uint8 = ffmpeg.FS('readFile', output);
            download(URL.createObjectURL(new Blob([uint8])), `${output}`);
            setProcessing(0);
            ffmpeg.setProgress(() => null);
            notify({
                message: t('BURN_SUCCESS'),
                level: 'success',
            });
        } catch (error) {
            setLoading('');
            setProcessing(0);
            notify({
                message: t('BURN_ERROR'),
                level: 'error',
            });
        }
    }, [notify, setProcessing, setLoading, videoFile, subtitle]);

    const onVideoChange = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = getExt(file.name);
                const canPlayType = player.canPlayType(file.type);
                if (canPlayType === 'maybe' || canPlayType === 'probably') {
                    // setVideoFile(file);
                    // decodeAudioData(file);
                    resetTranslateLang();
                    const url = URL.createObjectURL(new Blob([file]));
                    waveform.decoder.destroy();
                    waveform.drawer.update();
                    waveform.seek(0);
                    player.currentTime = 0;
                    clearSubs();
                    setSubtitle([
                        newSub({
                            start: '00:00:00.000',
                            end: '00:00:01.000',
                            text: t('SUB_TEXT'),
                        }),
                    ]);
                    player.src = url;
                } else {
                    notify({
                        message: `${t('VIDEO_EXT_ERR')}: ${file.type || ext}`,
                        level: 'error',
                    });
                }
            }
        },
        [newSub, notify, player, setSubtitle, waveform, clearSubs, decodeAudioData],
    );

    const resetTranslateLang = () => {
        setTranslate('en');
        localStorage.setItem('prevLang', 'en');
    };

    const onYtVideoChange = useCallback(
        async ({ video, subtitles, audio }) => {
            if (video) {
                // setVideoFile(video);
                // decodeAudioData(video);
                waveform.decoder.destroy();
                waveform.drawer.update();
                waveform.seek(0);
                player.currentTime = 0;
                clearSubs();

                // persist state in localstorage
                resetTranslateLang();
                localStorage.setItem('lastYTVideo', video);

                if (subtitles) {
                    const sub = await url2sub(subtitles);
                    setSubtitle(sub);
                    console.log(sub);
                } else {
                    setSubtitle([
                        newSub({
                            start: '00:00:00.000',
                            end: '00:00:01.000',
                            text: t('SUB_TEXT'),
                        }),
                    ]);
                }
                player.src = video;
            }
        },
        [newSub, notify, player, setSubtitle, waveform, clearSubs, decodeAudioData],
    );

    const openYTImportDialog = useCallback((event) => {
        setYtModalVisible(true);
    }, []);

    const hideYTImportDialog = useCallback((event) => {
        setYtModalVisible(false);
    }, []);

    const onSubtitleChange = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (file) {
                const ext = getExt(file.name);
                if (['ass', 'vtt', 'srt', 'json'].includes(ext)) {
                    file2sub(file)
                        .then((res) => {
                            clearSubs();
                            setSubtitle(res);
                        })
                        .catch((err) => {
                            notify({
                                message: err.message,
                                level: 'error',
                            });
                        });
                } else {
                    notify({
                        message: `${t('SUB_EXT_ERR')}: ${ext}`,
                        level: 'error',
                    });
                }
            }
        },
        [notify, setSubtitle, clearSubs],
    );

    const onInputClick = useCallback((event) => {
        event.target.value = '';
    }, []);

    const downloadSub = useCallback(
        (type, original = false) => {
            let text = '';
            let subToDownload = [];

            if (original && translate !== 'en') {
                subtitle.forEach((sub) => {
                    subToDownload.push(
                        newSub({
                            start: sub.start,
                            end: sub.end,
                            text:sub.originalText,
                        }),
                    );
                });
            } else subToDownload = subtitle;
            const name = `${Date.now()}.${type}`;
            switch (type) {
                case 'vtt':
                    text = sub2vtt(subToDownload);
                    break;
                case 'srt':
                    text = sub2srt(subToDownload);
                    break;
                case 'ass':
                    text = sub2ass(subToDownload);
                    break;
                case 'txt':
                    text = sub2txt(subToDownload);
                    break;
                case 'json':
                    text = JSON.stringify(subToDownload);
                    break;
                default:
                    break;
            }
            const url = URL.createObjectURL(new Blob([text]));
            download(url, name);
        },
        [subtitle],
    );

    const onTranslate = useCallback(() => {
        setLoading(t('TRANSLATING'));
        setSubTranslationLang(translate);
        if (subtitle[0]?.originalText !== undefined) {
            subtitle.forEach((sub, i) => subtitle[i].text = sub.originalText)
        }
        googleTranslate(formatSub(subtitle), translate, localStorage.getItem('prevLang'))
            .then((res) => {
                setLoading('');
                setSubtitle(formatSub(res));
                notify({
                    message: t('TRANSLAT_SUCCESS'),
                    level: 'success',
                });
            })
            .catch((err) => {
                setLoading('');
                notify({
                    message: err.message,
                    level: 'error',
                });
            });

        localStorage.setItem('prevLang', translate);
    }, [subtitle, setLoading, formatSub, setSubtitle, translate, notify]);

    const onTranslateLangChange = useCallback(
        (event) => {
            setTranslate(event.target.value);
        },
        [subtitle, setLoading, formatSub, setSubtitle, translate, notify],
    );

    useEffect(() => {
        if (localStorage.getItem('prevLang') !== null) {
            setTranslate(localStorage.getItem('prevLang'));
            setSubTranslationLang(localStorage.getItem('prevLang'));
            console.log('Localstorage', localStorage.getItem('prevLang'));
        } else {
            localStorage.setItem('prevLang', 'en');
        }
    }, []);

    const ExportMenuItems = (type) => {
        return (
            <Menu
                onClick={(e) => downloadSub(type, e.key === '1')}
                items={[
                    {
                        label: 'Original',
                        key: '1',
                        type,
                    },
                    {
                        label: 'Translated',
                        key: '2',
                        type,
                        disabled: translate === 'en'
                    },
                ]}
            />
        );
    };

    return (
        <Style className="tool" id="tools">
            <div className="top">
                <div className="import">
                    <div className="btn">
                        <Translate value="OPEN_VIDEO" />
                        <input className="file" type="file" onChange={onVideoChange} onClick={onInputClick} />
                    </div>
                    <div className="btn">
                        <Translate value="OPEN_SUB" />
                        <input className="file" type="file" onChange={onSubtitleChange} onClick={onInputClick} />
                    </div>
                </div>
                <div className="import-yt">
                    <div className="btn" onClick={() => openYTImportDialog()}>
                        <Translate value="IMPORT_FROM_YOUTUBE" />
                    </div>
                    <ImportFromYT
                        onYtVideoChange={onYtVideoChange}
                        ytModalVisible={ytModalVisible}
                        hideYTImportDialog={hideYTImportDialog}
                        notify={notify}
                    />
                </div>
                {window.crossOriginIsolated ? (
                    <div className="burn" onClick={burnSubtitles}>
                        <div className="btn">
                            <Translate value="EXPORT_VIDEO" />
                        </div>
                    </div>
                ) : null}
                <div className="export">
                    <Dropdown overlay={() => ExportMenuItems('ass')} trigger={['click']}>
                        <div className="btn">
                            <Translate value="EXPORT_ASS" />
                        </div>
                    </Dropdown>
                    <Dropdown overlay={() => ExportMenuItems('srt')} trigger={['click']}>
                        <div className="btn">
                            <Translate value="EXPORT_SRT" />
                        </div>
                    </Dropdown>
                    <Dropdown overlay={() => ExportMenuItems('vtt')} trigger={['click']}>
                        <div className="btn">
                            <Translate value="EXPORT_VTT" />
                        </div>
                    </Dropdown>
                </div>
                <div className="operate">
                    <div
                        className="btn"
                        onClick={() => {
                            if (window.confirm(t('CLEAR_TIP')) === true) {
                                clearSubs();
                                window.location.reload();
                            }
                        }}
                    >
                        <Translate value="CLEAR" />
                    </div>
                    <div className="btn" onClick={undoSubs}>
                        <Translate value="UNDO" />
                    </div>
                </div>
                <div className="translate">
                    <select value={translate} onChange={(event) => onTranslateLangChange(event)}>
                        {(languages[language] || languages.en).map((item) => (
                            <option key={item.key} value={item.key}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <div className="btn" onClick={onTranslate}>
                        <Translate value="TRANSLATE" />
                    </div>
                </div>
                <div className="hotkey">
                    <span>
                        <Translate value="HOTKEY_01" />
                    </span>
                    <span>
                        <Translate value="HOTKEY_02" />
                    </span>
                </div>

                <div>
                    <Subtitles
                        currentIndex={currentIndex}
                        subtitle={subtitle}
                        checkSub={checkSub}
                        player={player}
                        updateSub={updateSub}
                        subTranslationLang={subTranslationLang}
                    />
                </div>
            </div>
        </Style>
    );
}
