import React from 'react';
import { Card } from 'react-bootstrap';

const ContextDashboard = ({ user, userContextStatus, runningContext, meetingChatContext, connected }) => {
    return (
        <div >
            <Card style={{ height:'300px', width: '450px', marginBottom: '20px' }}>
                <Card.Body>
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
        </div>
    );
};

export default ContextDashboard;
