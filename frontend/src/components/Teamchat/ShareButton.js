import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Modal, Form, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { useLocation, useHistory } from "react-router-dom";

const interactiveCard = {
  "content": {
    "settings": { "form": true },
    "head": {
      "text": "I am a head text",
      "sub_head": { "text": "I am a sub head text" }
    },
    "body": [
      {
        "type": "attachments",
        "resource_url": "https://a7d4-38-99-100-7.ngrok-free.app/hello",
        "img_url": "https://d24cgw3uvb9a9h.cloudfront.net/static/93516/image/new/ZoomLogo.png",
        "information": {
          "title": { "text": "I am an attachment title" },
          "description": { "text": "I am an attachment description" }
        }
      },
      {
        "type": "actions",
        "items": [
          { "text": "Open", "value": "open", "style": "Primary" },
          { "text": "Edit", "value": "edit", "style": "Default" }
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
  "file_ids": [""],
  "reply_main_message_id": "",
  "to_channel": channelId,
  "to_contact": "",
  "interactive_cards": [
    {
      "card_json": JSON.stringify(interactiveCard)
    }
  ]
});

const ShareButton = (props) => {
  const history = useHistory();
  const location = useLocation();

  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [sendToContinuousChat, setSendToContinuousChat] = useState(false);
  const [sendButtonText, setSendButtonText] = useState("Send");

  const { userContextStatus, meetingChatContext } = props;

  console.log("Sending From Share Button", userContextStatus, meetingChatContext);
  console.log("Meeting Context", meetingChatContext);

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
    if (option === 'continuous' && meetingChatContext) {
      setSelectedChannel(null);
      setSendButtonText("Send to Continuous Chat");
    } else {
      setSendButtonText("Send to Chat Channel");
    }
  };
  const goDoc = () => history.push('/userInfo');

  const copyDocLink = async () => {
    try {
      const docLink = `${window.location.origin}${location.pathname}`;
      console.log('Document link copied to clipboard:', docLink);
    } catch (error) {
      console.error('Failed to copy document link:', error);
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
    <div style={{ display: 'block', width: '100%' }}>
      <Dropdown>
        <Dropdown.Toggle variant="primary" id="dropdown-basic" style={{ width: '100%' }}>
          Share
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleModalShow}>Share to Chat</Dropdown.Item>
          <Dropdown.Item onClick={copyDocLink}>Copy Link</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Share to Zoom Team Chat</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group controlId="formChannel">
              <Form.Label>Select Channel</Form.Label>
              <DropdownButton
                id="dropdown-basic-button"
                title={selectedChannel ? selectedChannel.name : "Channels"}
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
          <DropdownButton
            as={ButtonGroup}
            title={sendButtonText}
            id="bg-nested-dropdown"
            variant="primary"
            onSelect={handleSendOptionSelect}
          >
            <Dropdown.Item eventKey="channel" onClick={handleSend}>Send to Chat Channel</Dropdown.Item>
            <Dropdown.Item eventKey="continuous" onClick={handleSend}>Send to Continuous Chat</Dropdown.Item>
          </DropdownButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShareButton;
