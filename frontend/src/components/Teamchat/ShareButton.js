import React, { useState, useEffect } from 'react';
import { Modal, Form, DropdownButton, Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import { FaComments} from "react-icons/fa";
import './ShareButton.css';

const interactiveCard = {
  "content": {
    "settings": { "form": true },
    "head": {
      "text": "Message Sent from Zoom App Team Chat Demo",
      "sub_head": { "text": "Click button below to trigger Team Chat interactive_message_actions Webhook Event" }
    },
    "body": [
      {
        "type": "actions",
        "items": [
          { "text": "Collaborate in Zoom App", "value": "open", "style": "Primary" },
        ]
      }
    ]
  }
};

const createMessagePayload = (message, channelId) => ({
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
  "to_channel": channelId,
  "interactive_cards": [
    {
      "card_json": JSON.stringify(interactiveCard)
    }
  ]
});

const ShareButton = (props) => {
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [sendToContinuousChat, setSendToContinuousChat] = useState(false);
  const [sendButtonText, setSendButtonText] = useState("Send");


  const { meetingChatContext } = props;

  useEffect(() => {
    fetchChatChannels();
  }, []);

  const fetchChatChannels = async () => {
    try {
      const response = await fetch('/zoom/getChatChannels');
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      const data = await response.json();
      if (!data.channels) throw new Error('Channels data is missing');
      setChannels(data.channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
    }
  };

  const handleModalShow = () => setShowModal(true);

  const handleModalClose = () => {
    setShowModal(false);
    setSendButtonText("Send");
    setSendToContinuousChat(false);
    setSelectedChannel(null);
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setSendButtonText("Send to Chat Channel");
  };

  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleSendOptionSelect = (option) => {
    setSendToContinuousChat(option === 'continuous');
    console.log("sendToContinuousChat", option, meetingChatContext)
    if (option === 'continuous' && meetingChatContext) {
      setSelectedChannel(null);
      setSendButtonText("Send to Continuous Chat");
    } else {
      setSendButtonText("Send to Chat Channel");
    }
  };

  const handleSend = async () => {
    if (!meetingChatContext && !selectedChannel) {
      console.error("No channel selected and meeting chat context is not available");
      setSendButtonText("Send");
      return;
    }

    try {
      if (sendToContinuousChat && meetingChatContext) {
        // Implement logic for sending to continuous chat
        console.log("Sending to continuous chat...");
        await sendMessage(message, meetingChatContext);
      } else {
        await sendMessage(message, selectedChannel.id);
      }

      clearMessageAndCloseModal();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  


/*
 Zoom API endpoint to send a chat message to a channel
 @Endpoint POST /zoom/sendAChatMessage
 @URL https://developers.zoom.us/docs/team-chat-apps/apis/#operation/sendaChatMessage

 @param {string} message - The message to send
 @param {string} channelId - The ID of the channel to send the message to
 @example
  sendMessage("Hello, Zoom Team Chat!", "channelId123");
*/
  const sendMessage = async (message, channelId) => {
    const data = createMessagePayload(message, channelId);
    const response = await fetch("/zoom/sendAChatMessage", {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to send message");
  };

  const clearMessageAndCloseModal = () => {
    setMessage("");
    handleModalClose();
  };



  return (
    <>
      
      <FaComments className="icon message-icon" title="Message" onClick={handleModalShow} />
      
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Share to Zoom Team Chat</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group controlId="formSendOption">
              <Form.Label>Share to</Form.Label>
              <div style={{ width: '100%' }}>
                <DropdownButton
                  id="dropdown-basic-button"
                  as={ButtonGroup}
                  title={sendButtonText}
                  onSelect={handleSendOptionSelect}
                >
                  <Dropdown.Item eventKey="channel">Send to Chat Channel</Dropdown.Item>
                  <Dropdown.Item eventKey="continuous">Send to Continuous Chat</Dropdown.Item>
                </DropdownButton>
              </div>
            </Form.Group>

            <Form.Group controlId="formChannel">
              <Form.Label>Select Channel</Form.Label>
              <div style={{ width: '100%' }}>
                <DropdownButton
                  id="dropdown-basic-button"
                  title={selectedChannel ? selectedChannel.name : "Channels"}
                  disabled={sendToContinuousChat}
                >
                  {channels.map(channel => (
                    <Dropdown.Item
                      key={channel.id}
                      active={selectedChannel && selectedChannel.id === channel.id}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      {channel.name}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </div>
            </Form.Group>

            <Form.Group controlId="formMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={message}
                onChange={handleMessageChange}
                placeholder="Add a message (optional)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSend}>
            {sendButtonText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShareButton;
