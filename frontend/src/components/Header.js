/* globals zoomSdk */

import React, { useState } from 'react';
import { useHistory, NavLink } from 'react-router-dom';

import ShareButton from './Teamchat/ShareButton';

import { FaShare, FaSignInAlt, FaPlay, FaStop, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import "./Header.css";

function Header(props) {
  const { navLinks } = props;

  const history = useHistory();
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const { user, userContextStatus, meetingChatContext } = props;

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
    <header>
      <nav>
        <ul className="nav-links">
          {Object.entries(navLinks).map(([route, navName]) => (
            <li key={route}>
              <NavLink activeClassName="active" to={`/${route}`}>
                {navName}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="icons">
          {isCollaborating ? (<FaStop className="icon danger" title="End Collaboration" onClick={handleStartClick} />) : 
                             (<FaPlay className="icon primary" title="Start Collaboration" onClick={handleStartClick} />)
            }
          {isCollaborating ? 
            (<FaExclamationTriangle className="icon warning" title="Leave Collaboration" onClick={handleJoinClick} />) : 
            (<FaSignInAlt className="icon primary" title="Join Collaboration" onClick={handleJoinClick} />)
            }
            
          <ShareButton
            user={user}
            userContextStatus={userContextStatus}
            meetingChatContext={meetingChatContext}
                 />
          <FaArrowLeft className="icon primary" title="Back" onClick={goHome} />
        </div>
      </nav>

      {showNotification && (
        <div className="notification">
          {errorMessage || 'Message sent!'}
        </div>
      )}
    </header>
  );
}

export default Header;
