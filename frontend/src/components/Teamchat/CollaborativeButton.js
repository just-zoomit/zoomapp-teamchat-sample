/* globals zoomSdk */
import React, { useState } from 'react';
import { FaSignInAlt, FaUsers, FaStop, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

import ShareButton from './ShareButton';
import "./CollaborativeButton.css";

import { useHistory } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

const CollaborativeButton = ({
  user,
  userContextStatus,
  meetingChatContext,
}) => {
  const history = useHistory();
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

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

  

  return (
    <div className="collaborative-button-container">
      <div className="icons">
        {isCollaborating ? (
          <FaStop className="icon danger" title="End Collaboration" onClick={handleStartClick} />
        ) : (
          <FaUsers className="icon primary" title="Start Collaboration" onClick={handleStartClick} />
        )}
        {isCollaborating ? (
          <FaExclamationTriangle className="icon warning" title="Leave Collaboration" onClick={handleJoinClick} />
        ) : (
          <FaSignInAlt className="icon primary" title="Join Collaboration" onClick={handleJoinClick} />
        )}
        <ShareButton
          user={user}
          userContextStatus={userContextStatus}
          meetingChatContext={meetingChatContext}
        />
       
      </div>

      {showNotification && (
        <Alert
          variant={errorMessage ? "danger" : "success"}
          className="notification-alert"
          onClose={() => setShowNotification(false)}
          dismissible
        >
        <br/>
          {errorMessage || 'Success!'}
        </Alert>
      )}
    </div>
  );
};

export default CollaborativeButton;
