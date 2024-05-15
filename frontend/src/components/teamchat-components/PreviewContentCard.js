/* globals zoomSdk */
import React, { useState } from 'react';
import Button from "react-bootstrap/Button";

const ZoomCard = () => {
  const [error, setError] = useState(null);
  const [chatContext, setChatContext] = useState(null);  // State to hold chatContext

  const meetingId = "97231146424";
  const share_url = "https://pooja-onelogin-test.zoom.us/rec/share/yZlABeUkEqe8T22L_9uiJY21HgFNt1LaelsTU_X__8xIhC-vVxDV4BtCG-bbESmz.Vd1h6n_U7QRyvZXe";

  const sendZoomCard = async () => {
    try {
      const content = {
        content: {
          head: { type: "message", text: `Meeting ID: ${meetingId}` },
          body: [{
            type: "message",
            text: `Share Recording URL: ${share_url}`
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
          description: `Share URL: ${share_url}`,
          icon:{
            bitmap: "iVBORw0KGgoAAAANSUhEUgAAAEAAAABECAYAAAAx+DPIAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQwSURBVHgB7ZpLTBNbGMf/Z/oACpfIjdx7TURKcjeAC3OvGzAaHxvcaUg0xo0r3Wp0rya6NOrSnSufMbqTlfiI1YUaYxDcaBBMfFAtobZCoXM838C0pzOVTmWcHtPzSxoOZ74p8/3nO/85Zw6ARqPRaDQaTZ3C4CM7LqV2cW5ugJLw8Tv7V1909vomwNbLqePM5CegMMxgJ+7sazsp9xnwCdWTJ7jJDzv7fBPgN2GVs6PeBHChBUCdowVAnROGTyykv2AlGNEmGA1NCBrfBDAXclgJdH4kFAILRxEkLgH+OTAcZ/P8Jue8qint68T7asJhsByaQ6/Q0PYnWrs2iMQjMOdzCNVaAOTMYQ7E8YsxeRTZ/L8wP70Qv0URW9st+ubEJ4IgKTcE4giIPI8hm8ogN/cO8+xv4QOz1idI9GMQdc6yT4G+7jYcG+yy2pNT33D4wpgrpqO9Ef0ijnj5No2Rt19dMUfFd9gxZ268QWJsGqqwrADvkt/EhS8uoGY6W8oKQImdO9RttSmxwVPPXDED/7VjfbzFah/PLkAllh0Ck1OzmFm64NZYGOs7W1wxe7asKbRJrNZmt6Z28vRd5SqkllT0APmCe9b9UXKMRLErxIbutox8fGRcreSJigK8HE8X2r3x0grYubHdFd/fUypIr1Q1IxNpqEZlASaKd21TT1vJsT7p7tpDxSlKb2exah6PpaAaFQVISBfdsbqx5JidLIl0+8mU1XYOi15p2JCnqEZFAX5khJbhxRYN7+FoCo+kR1tfd7FSVDZAwtNEqJwRyu5//f77QgUQ/UtDRXUDJDwth8kI7WQsI3yAwsRmMjlbEIjmARRnPw69GGAmmRbvAQzM8SRYpEmsCjMIEk8V4DRCSoxmgERitOgRQ08+Fdp7N69R3gAJTwI4jXDg/6LTX7tffA8w9DRZaA8Ig1TdAAlPAjiN8ODOjsV+Uf7yvJ7i7ETJLFU3QMLzalBOwHZ/ufxtri5VhB1jnauoARKeBZBnhDZy+ds8KjPWVZwB2ngXYKL0LlJZl1vWUt+MY8WnqgESngVIOJKQn/tOrt4rrQxVDZDw/FqckkiMFu94ufK3GXo6VXgEzmTnlTVAoqp9gcHTzzzF0TBIeIytNfqlKOoc1xBgjD/nnAXyj07m3DQWMp9h5MS2WngCLNQo1gKNCBKXADwf2g3DHMYv3iDJZz7i69h18QcNmExsi+WyQoA8WD6PIHEJ8OHKtnHxowtV0rBuO0eVMCMqVoDNIvFg9wNlfNsdZuFYVfEia3GOWP6GGqo/10d8EyDUshYrgTHDqoig8a8CVnDxViWEm+lLEDQ1F4AZYRhN7TVJnvBNACP2F34GZkRqljzhXwUIM/sd0VNh+Ic6e95V4J8AzDwP1WHmSVcXfGTV1rMHhKZxKIn5fPrukVvQaDQajUaj0SzyHYTFdEe2nCxyAAAAAElFTkSuQmCC"
            }
        })
      };

      const chatCtx = await zoomSdk.getChatContext(); // Get chat context
      setChatContext(chatCtx); // Set chat context state

      console.log("Creating card with content: ", chatCtx);
     
  
      await zoomSdk.composeCard(card);

      // Optional: Close the window after sending the card
      // window.close();

      console.log("Card created successfully");
    } catch (e) {
      console.error("Error when creating preview card ", e);
      setError(e.message);
    }
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <h1>Zoom Meeting Card Generator</h1>
      <Button onClick={sendZoomCard}>Generate Zoom Card</Button> {/* Button to trigger card creation */}
      <p>Click the button above to send the Zoom Meeting Card.</p>
      <p>Chat Context: {JSON.stringify(chatContext)}</p> {/* Render chatContext here */}
    </div>
  );
};

export default ZoomCard;
