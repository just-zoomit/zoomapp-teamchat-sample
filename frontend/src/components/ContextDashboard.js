import React from 'react';
import { Card } from 'react-bootstrap';

const ContextDashboard = ({ user, userContextStatus, runningContext, meetingChatContext, connected }) => {
    return (
      <Card style={{ position: 'absolute', top: '70px', right: '80px', width: '450px' }}>
      
        <Card.Body>
        {/* Not working, it appear in the img-src directive of the Content Security Policy. */}
        {user && user.pic_url && (<Card.Img variant="top" src={user.pic_url} />)}
          <Card.Title>
            Hello{user ? ` ${user.first_name} ${user.last_name}` : " Dev Advocate"}!
          </Card.Title>
          <Card.Text>
            User Context Status: {userContextStatus}
          </Card.Text>
          <Card.Text>
            {runningContext ?
              `Running Context: ${runningContext}` :
              "Configuring Zoom JavaScript SDK..."
            }
          </Card.Text>
          <Card.Text>
            {connected ?
              `Meeting Chat Context: ${meetingChatContext}` :
              "Connecting to meeting..."
            }
          </Card.Text>
        </Card.Body>
      </Card>
    );
  };
  

export default ContextDashboard;
