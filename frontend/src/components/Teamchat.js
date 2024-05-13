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

    fetchUserMessage(message, meetingChatContext);

    setMessage(""); // Clear input field
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000); // Hide the notification after 2 seconds
  };

  

  const fetchUserMessage = async (message, meetingChatContext) => {
    try {
      const data = {
        "at_items": [
          {
            "at_contact": "donte.small@zoom.us",
            "at_type": 1,
            "end_position": 8,
            "start_position": 0
          }
        ],
        "rich_text": [
          {
            "start_position": 0,
            "end_position": 5,
            "format_type": "Paragraph",
            "format_attr": "h1"
          }
        ],
        "message": message,
        "file_ids": [""],
        "reply_main_message_id": "",
        "to_channel": meetingChatContext,
        "to_contact": ""
      };

      const response = await fetch("/zoom/sendAChatMessage", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response from Zoom REST API", response);

      if (!response.ok) throw new Error("Failed to fetch user message");

      const responseData = await response.json();
      console.log("User message response:", responseData);
    } catch (error) {
      console.error("Error fetching user message:", error);
    }
  };

  

  return (
    <div className="Teamchat-sample">
     
      <h2>Team Chat</h2>
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
