import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Teamchat from './Teamchat';
import ChatChannels from './ChatChannelsScrollView';

const ChatApp = (props) => {
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const { userContextStatus, meetingChatContext } = props;

  return (
    <Container fluid>
      <Row>
        <Col xs={3} className="p-3" style={{ backgroundColor: '#f8f9fa', height: '100vh' }}>
          <div className="centered-div">
            <h1>Team Chat</h1>
          </div>
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
          <ChatChannels onChannelSelect={setSelectedChannelId} />
        </Col>

        <Col xs={9} className="d-flex flex-column p-3" style={{ height: '100vh' }}>
          <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
          <Teamchat selectedChannelId={selectedChannelId} {...props} />
          </div>
          
        </Col>
      </Row>
    </Container>
  );
};

export default ChatApp;
