import React, { useState, useEffect } from 'react';

const ZoomCard = () => {
  const [error, setError] = useState(null);

  const meetingId = "97231146424";
  const share_url= "https://pooja-onelogin-test.zoom.us/rec/share/yZlABeUkEqe8T22L_9uiJY21HgFNt1LaelsTU_X__8xIhC-vVxDV4BtCG-bbESmz.Vd1h6n_U7QRyvZXe";


  useEffect(() => {
    sendZoomCard(); // Abstracted the card sending functionality to a method
  }, [meetingId]); // useEffect depends only on meeting, as zoomSdk seems not to be passed as prop

  const sendZoomCard = async () => {
    try {

        
      const content = {
        content: {
          head: { type: "message", text: `Meeting ID: ${meetingId}` },
          body: [{
            type: "message",
            text: `Share Recording URL ${share_url}`
          }]
        }
      };

      const message = JSON.stringify(content); // No need to convert to JSON string here as body of fetch needs JSON object

      const res = await fetch("/zoom/sign", {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { signature, timestamp } = await res.json();

      const contentCard = {
        head: {
          text: "Meeting Card",
          sub_head: {
            text: "Meeting Card"
          }
        },
        body: [
          {
            type: "message",
            text: `Meeting ID: ${meetingId}`
          },
          {
            type: "message",
            text: `Share URL: ${share_url}`
          }
        ]
      };

      

      const card = {
        type: "interactiveCard",
        message: message,
        signature: signature,
        timestamp: timestamp,
        previewCard: JSON.stringify({ head: { text: "Meeting Card", sub_head: { text: "Meeting Card"}},
                                     title: `Meeting ID: ${meetingId}`, description: `Share URL: ${share_url}` }),

      };

      await zoomSdk.composeCard(card);
    console.log("Card created successfully");
     //await zoomSdk.closeApp();
     // window.close();
     // Redirect instead of closing the window
     //window.location.href = '/success'; // Redirect to a success page or any other appropriate location
     
    } catch (e) {
      console.error("Error when creating preview card ", e);
      setError(e.message);
    }
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <h1>Zoom Meeting Card Generator</h1>
      <button onClick={sendZoomCard}>Generate Zoom Card</button> {/* Button to trigger card creation */}
      <p>Click the button above to send the Zoom Meeting Card.</p>
    </div>
  );
};

export default ZoomCard;
