import "./Teamchat.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";

function Teamchat() {
  const [showNotification, setShowNotification] = useState(false);

  const handleButtonClick = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000); // Hide the notification after 2 seconds
  };

  return (
    <div className="Teamchat-sample">
      <div className="button-container">
        <Button variant="primary" onClick={handleButtonClick}>
          Find Chat Channel
        </Button>
        <span className="button-space"></span>
        <Button variant="primary" onClick={handleButtonClick}>
          Teamchat
        </Button>
      </div>
      {showNotification && (
        <div className="notification">Notification message here</div>
      )}
      <p>
        Teamchat is a feature that allows you to chat with your team members.
      </p>
      <p>It is a great way to communicate and collaborate with your team.</p>
      <p>Teamchat is available in the Zoom Apps sidebar.</p>
      
    </div>
  );
}

export default Teamchat;
