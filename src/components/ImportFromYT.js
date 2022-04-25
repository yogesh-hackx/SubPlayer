import { Input, Modal, Switch } from 'antd'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components';

const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;

    .flex-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;

const isValidVideoLink = (url="") => {
    const ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
    const match = url.match(ytRegex)
    return match !== null;
}

const ImportFromYT = ({ ytModalVisible, hideYTImportDialog, onYtVideoChange, notify }) => {
    const [subtitles, setSubtitles] = useState(true);
    const [videoLink, setVideoLink] = useState('');
    const [videoLoading, setVideoLoading] = useState(false)

    const onSubSwitchToggle = (checked) => {
        console.log(`switch to ${checked}`);
        setSubtitles(checked);
    }

    const importYTVideo = async () => {
        try {
            const YT_API = 'https://youtube-dl-utils-api.herokuapp.com/get_youtube_video_link_with_captions'
            return await fetch(`${YT_API}?url=${videoLink}`).then(res => res.json().then(data =>{
                return data;
            }))
        } catch (error) {
            console.log(error);
            notify({
                message: error?.message,
                level: 'error',
            });
        }
    }

    const handleImport = async () => {
        if (isValidVideoLink(videoLink)) {
            setVideoLoading(true)
            const videoData = await importYTVideo();
            if (!subtitles) delete videoData['subtitles']
            onYtVideoChange(videoData);
            setVideoLoading(false);
            hideYTImportDialog();
            notify({
                message: 'YouTube Video Import Success!',
                level: 'success',
            });
        } else {
            notify({
                message: 'Please use a valid youtube video link!',
                level: 'error',
            });
        }
    }

    const reset = () => {
        setSubtitles(true);
        setVideoLink('');
        setVideoLoading(false);
    }

    useEffect(() => {
        if (!ytModalVisible) reset();
    }, [ytModalVisible])


    return (
        <Modal
            title="Import From YouTube"
            visible={ytModalVisible}
            onOk={handleImport}
            onCancel={hideYTImportDialog}
            okText="Import"
            okButtonProps={{ disabled: false, loading: videoLoading }} // check for valid youtube video and enable the btn
            cancelText="Cancel"
            destroyOnClose
        >
            <ModalBody>
                <Input autoFocus placeholder="Paste youtube video link here..." allowClear value={videoLink} onChange={(e) => setVideoLink(e.target.value)} enterButton="" size='large' />
                <div className='flex-row'>
                    <div>Include Subtitles</div>
                    <Switch defaultChecked onChange={onSubSwitchToggle} checked={subtitles} size="small" />
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ImportFromYT
