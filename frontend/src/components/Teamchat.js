import "./Teamchat.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const Teamchat = (props) => {
  const { user, userContextStatus, meetingChatContext } = props;
  const [message, setMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    // Send message to backend
    console.log("Sending message:", message);
    setMessage(""); // Clear input field
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000); // Hide the notification after 2 seconds
  };

  return (
    <div className="Teamchat-sample">
     
      <p>
        Teamchat is a feature that allows you to chat with your team members.
      </p>
      <p>It is a great way to communicate and collaborate with your team.</p>
      <p>Teamchat is available in the Zoom Apps sidebar.</p>
      <p>
        {meetingChatContext
          ? `Meeting Chat Context: ${meetingChatContext}`
          : "Connecting to meeting..."}
      </p>
      <p>
        {userContextStatus
          ? `User Context Status: ${userContextStatus}`
          : "Configuring Zoom JavaScript SDK..."}
      </p>

      <div className="button-container">
        <Button variant="primary" onClick={handleSend}>
          Send
        </Button>
      </div>
      <div className="chat-container">
        <Form.Control
          as="textarea"
          rows={3}
          value={message}
          onChange={handleMessageChange}
          placeholder="Type your message here..."
        />
      </div>
      {showNotification && (
        <div className="notification">Message sent!</div>
      )}
    </div>
  );
};

export default Teamchat;
