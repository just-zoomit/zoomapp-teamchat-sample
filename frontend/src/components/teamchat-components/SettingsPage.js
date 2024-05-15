/* globals zoomSdk */
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from "react-bootstrap/Button";
import './SettingsPage.css';  // Import the CSS file for styling


// onCollaborateChange 
// URL : https://appssdk.zoom.us/classes/ZoomSdk.ZoomSdk.html#onCollaborateChange

const SettingsPage = () => {
    const history = useHistory();
    const [isCollaborating, setIsCollaborating] = useState(false);
    const role = ""; // Assuming role is obtained elsewhere or set here
    const isHost = role === 'host';

    const startTxt = `${isCollaborating ? 'End' : 'Start'} Collaboration`;
    const joinTxt = `${isCollaborating ? 'Leave' : 'Join'} Collaboration`;

    const handleStartClick = async () => {
        if (isCollaborating) {
            await zoomSdk.endCollaborate();
        } else {
            await zoomSdk.startCollaborate({});
        }
        setIsCollaborating(!isCollaborating); // Toggle collaboration status
    };

    const handleJoinClick = async () => {
        if (isCollaborating) {
            await zoomSdk.leaveCollaborate();
        } else {
            await zoomSdk.joinCollaborate();
        }
        setIsCollaborating(!isCollaborating); // Toggle collaboration status
    };

    const goHome = () => history.push('/userInfo');

    return (
        <div className='settings-page'>

            <div className='level-left'>

                <Button onClick={goHome} >
                    <span className='icon is-small'>
                        <i className='fas fa-arrow-left'></i>
                    </span>
                    <span>Back</span>
                </Button>
            </div>

            <br />

            <div >

            <div className='level-right'>

                <Button onClick={handleStartClick} variant={isCollaborating ? "danger" : "success"}>
                    {startTxt}
                </Button>
                &nbsp;&nbsp;{/* Adding a space between buttons */}
                <Button onClick={handleJoinClick} variant={isCollaborating ? "warning" : "info"}>
                    {joinTxt}
                </Button>

            </div>

            </div>


        </div>
    );
};

export default SettingsPage;
