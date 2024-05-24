import "./Teamchat.css";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const Teamchat = (props) => {
  const { meetingChatContext, selectedChannelId } = props;
  const [message, setMessage] = useState("");
  
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    const context = meetingChatContext || selectedChannelId;

    if (!context) {
      setNotificationMessage("Please select a channel or start a meeting to use Team Chat!");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000); 
      return;
    } else{
    
      setNotificationMessage("Message sent!");

    fetchUserMessage(message, context);
    setMessage(""); // Clear input field
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000); 

    }

  };

  const fetchUserMessage = async (message, context) => {
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
        "to_channel": context,
        "to_contact": ""
      };

      const response = await fetch("/zoom/sendAChatMessage", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user message");
     
    } catch (error) {
      console.error("Error fetching user message:", error);
    }
  };

  return (
    <div >
    
      <div className="chat-input-container">
        <Form.Control
          as="textarea"
          rows={3}
          value={message}
          onChange={handleMessageChange}
          placeholder="Type your message here..."
          className="chat-input"
        />
        <Button variant="primary" onClick={handleSend} className="send-button">
          Send
        </Button>
        <br />
      </div>

      {showNotification && (
        <div className="notification">{notificationMessage}</div>
      )}
    </div>

  );

};

export default Teamchat;
