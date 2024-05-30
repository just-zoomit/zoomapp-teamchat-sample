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
      const content = {
        content: {
          head: { type: "message", text: `Meeting ID: ${meetingId}` },
          body: [{
            type: "message",
            text: `Share Recording URL: ${shareUrl}`
          }]
        }
      };

      const message = JSON.stringify(content);

      const res = await fetch("/zoom/sign", {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { signature, timestamp } = await res.json();

      const card = {
        type: "interactiveCard",
        message: message,
        signature: signature,
        timestamp: timestamp,
        previewCard: JSON.stringify({
          title: `Meeting ID: ${meetingId}`,
          description: `Share URL: ${shareUrl}`,
          icon: {
            bitmap: bitmap
          }
        })
      };

      const chatCtx = await zoomSdk.getChatContext();
      console.log("Chat Context: ", chatCtx);
      setChatContext(chatCtx);

      await zoomSdk.composeCard(card);
      window.close();

    } catch (e) {
      console.error("Error when creating preview card ", e);
      setError(e.message);
    }
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <h1>Zoom Meeting Card Generator</h1>

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search Recordings"
          aria-label="Search Recordings"
          aria-describedby="basic-addon2"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </InputGroup>

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

      <Form className="mt-3">

        

        <Button variant="primary" onClick={sendZoomCard}>Generate Zoom Card</Button>
      </Form>

      <p>Chat Context: {JSON.stringify(chatContext)}</p>
    </div>
  );
};

export default ZoomCard;
