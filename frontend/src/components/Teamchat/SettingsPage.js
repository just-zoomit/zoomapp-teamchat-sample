/* globals zoomSdk */
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from "react-bootstrap/Button";
import './SettingsPage.css'; 
import ShareButton from './ShareButton';

const SettingsPage = (props) => {
    const history = useHistory();
    const [isCollaborating, setIsCollaborating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);

    const { user, userContextStatus, meetingChatContext } = props;

    console.log("Sending From Setting Page ", userContextStatus);
    console.log("Sending From Meeting Context", meetingChatContext);


    const role = ""; 
    // const isHost = role === 'host';

    const startTxt = `${isCollaborating ? 'End' : 'Start'} Collaboration`;
    const joinTxt = `${isCollaborating ? 'Leave' : 'Join'} Collaboration`;

    const handleStartClick = async () => {
        try {
            if (isCollaborating) {
                await zoomSdk.endCollaborate();
            } else {
                await zoomSdk.startCollaborate({});
            }
            setIsCollaborating(!isCollaborating); 
            setShowNotification(true);
            setErrorMessage('');
            setTimeout(() => {
                setShowNotification(false);
            }, 2000);
        } catch (error) {
            setShowNotification(true);
            setErrorMessage(error.message || 'An error occurred during collaboration.');
            setTimeout(() => {
                setShowNotification(false);
            }, 2000); 
        }
    };

    const handleJoinClick = async () => {
        try {
            if (isCollaborating) {
                await zoomSdk.leaveCollaborate();
            } else {
                await zoomSdk.joinCollaborate();
            }
            setIsCollaborating(!isCollaborating); 
            setShowNotification(true);
            setErrorMessage('');
            setTimeout(() => {
                setShowNotification(false);
            }, 2000); 
        } catch (error) {
            setShowNotification(true);
            setErrorMessage(error.message || 'An error occurred during collaboration.');
            setTimeout(() => {
                setShowNotification(false);
            }, 2000); 
        }
    };

    const goHome = () => history.push('/userInfo');

    return (
        <div className='settings-page'>
            <div className='button-grid'>
                <Button onClick={handleStartClick} variant={isCollaborating ? "danger" : "primary"}>
                    {startTxt}
                </Button>

                <Button onClick={handleJoinClick} variant={isCollaborating ? "warning" : "primary"}>
                    {joinTxt}
                </Button>

                <ShareButton
                    user={user}
                    userContextStatus={userContextStatus}
                    meetingChatContext={meetingChatContext}
                 />

                <Button onClick={goHome}>
                    <span className='icon is-small'>
                        <i className='fas fa-arrow-left'></i>
                    </span>
                    <span>Back</span>
                </Button>
            </div>

            {showNotification && (
                <div className="notification">
                    {errorMessage || 'Message sent!'}
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
