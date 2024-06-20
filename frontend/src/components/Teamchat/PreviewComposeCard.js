/* globals zoomSdk */
import React, { useState, useEffect } from 'react';
import { Button, Form, InputGroup, FormControl, ListGroup } from "react-bootstrap";

const BitmapValue = "Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAADEDgAAxA4AAAAAAAAAAAAAAgD+AA==";

const ZoomCard = () => {
  const [error, setError] = useState(null);
  const [chatContext, setChatContext] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [bitmap, setBitmap] = useState(BitmapValue);

  useEffect(() => {
    listRecordings();
  }, []);

  const listRecordings = async () => {
    try {
      const res = await fetch("/zoom/recordings", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      setRecordings(data.meetings);
      if (data.meetings.length > 0) {
        setSelectedRecording(data.meetings[0]);
      }
    } catch (e) {
      console.error("Error when fetching recordings ", e);
      setError(e.message);
    }
  };

  const sendZoomCard = async () => {
    if (!selectedRecording) {
      setError("No recording selected");
      return;
    }
  
    const { id: meetingId, share_url: shareUrl } = selectedRecording;
  
    try {
      const message = createMessage(meetingId, shareUrl);
      const { signature, timestamp } = await getSignature(message);
      const card = createCard(message, signature, timestamp, meetingId, shareUrl);
  
      const chatContext = await zoomSdk.getChatContext();
      setChatContext(chatContext);
  
      await zoomSdk.composeCard(card);
      window.close();
    } catch (error) {
      handleError(error);
    }
  };
  
  const createMessage = (meetingId, shareUrl) => {
    return JSON.stringify({
      content: {
        head: { type: "message", text: `Meeting ID: ${meetingId}` },
        body: [{ type: "message", text: `Share Recording URL: ${shareUrl}` }],
      },
    });
  };
  
  const getSignature = async (message) => {
    const response = await fetch("/zoom/sign", {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 'Content-Type': 'application/json' },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch signature');
    }
  
    return await response.json();
  };
  
  const createCard = (message, signature, timestamp, meetingId, shareUrl) => {
    return {
      type: "interactiveCard",
      message: message,
      signature: signature,
      timestamp: timestamp,
      previewCard: JSON.stringify({
        title: `Meeting ID: ${meetingId}`,
        description: `Share URL: ${shareUrl}`,
        icon: { bitmap: bitmap },
      }),
    };
  };
  
  const handleError = (error) => {
    console.error("Error when creating preview card", error);
    setError(error.message);
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {error && <p>Error: {error}</p>}

      <p>
  Select a recording, then click "Generate Zoom Card" to send an interactive message 
  and its preview to the user’s compose box in the chat context. When the user posts 
  the card, the actual content of the message will be rendered as an interactive message.
</p>


      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search Recordings"
          aria-label="Search Recordings"
          aria-describedby="basic-addon2"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
        <ListGroup>
          {filteredRecordings.map(recording => (
            <ListGroup.Item
              key={recording.id}
              active={selectedRecording && selectedRecording.id === recording.id}
              onClick={() => setSelectedRecording(recording)}
              action
            >
              {recording.topic}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      <Form className="d-flex justify-content-end mt-3">
        <Button variant="primary" onClick={sendZoomCard}>Generate Zoom Card</Button>
      </Form>

   
    </div>
  );
};

export default ZoomCard;
