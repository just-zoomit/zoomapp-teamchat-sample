/* globals zoomSdk */
import React, { useState } from 'react';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';

const ZoomCard = () => {
  const [error, setError] = useState(null);
  const [chatContext, setChatContext] = useState(null); // State to hold chatContext

  const [meetingId, setMeetingId] = useState("97231146424");
  const [shareUrl, setShareUrl] = useState("https://pooja-onelogin-test.zoom.us/rec/share/yZlABeUkEqe8T22L_9uiJY21HgFNt1LaelsTU_X__8xIhC-vVxDV4BtCG-bbESmz.Vd1h6n_U7QRyvZXe");
  const [bitmap, setBitmap] = useState("Placeholder for bitmap");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "meetingId") setMeetingId(value);
    if (name === "shareUrl") setShareUrl(value);
    if (name === "bitmap") setBitmap(value);
  };

  const sendZoomCard = async () => {
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
      setChatContext(chatCtx);

      await zoomSdk.composeCard(card);
      window.close();

    } catch (e) {
      console.error("Error when creating preview card ", e);
      setError(e.message);
    }
  };

  
    return (
      <div>
        {error && <p>Error: {error}</p>}
        <h1>Zoom Meeting Card Generator</h1>
  
        <Form>
          <Form.Group className="mb-3" controlId="formMeetingId">
            <Form.Label>Meeting ID:</Form.Label>
            <Form.Control
              type="text"
              name="meetingId"
              value={meetingId}
              onChange={handleInputChange}
              placeholder="Enter Meeting ID"
            />
          </Form.Group>
  
          <Form.Group className="mb-3" controlId="formShareUrl">
            <Form.Label>Share URL:</Form.Label>
            <Form.Control
              type="text"
              name="shareUrl"
              value={shareUrl}
              onChange={handleInputChange}
              placeholder="Enter Share URL"
            />
          </Form.Group>
  
          <Form.Group className="mb-3" controlId="formBitmap">
            <Form.Label>Bitmap:</Form.Label>
            <Form.Control
              type="text"
              name="bitmap"
              value={bitmap}
              onChange={handleInputChange}
              placeholder="Placeholder for bitmap"
            />
          </Form.Group>
  
          <Button variant="primary" onClick={sendZoomCard}>Generate Zoom Card</Button>
        </Form>
      
        <p>Chat Context: {JSON.stringify(chatContext)}</p>
      </div>
    );
  };
  
  export default ZoomCard;
