const axios = require('axios')
const zoomHelpers = require('./zoom-helpers')

const getZoomAccessToken = async (
  zoomAuthorizationCode,
  redirect_uri = process.env.ZOOM_APP_REDIRECT_URI,
  pkceVerifier = undefined
) => {
  const params = {
    grant_type: 'authorization_code',
    code: zoomAuthorizationCode,
    redirect_uri,
  }

  if (typeof pkceVerifier === 'string') {
    params['code_verifier'] = pkceVerifier
  }

  const tokenRequestParamString = zoomHelpers.createRequestParamString(params)

  return await axios({
    url: `${process.env.ZOOM_HOST}/oauth/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: process.env.ZOOM_APP_CLIENT_ID,
      password: process.env.ZOOM_APP_CLIENT_SECRET,
    },
    data: tokenRequestParamString,
  })
}
// Add this
const getChatbotToken = async () => {
  try {
    const response = await axios.post('https://api.zoom.us/oauth/token', null, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_APP_CLIENT_ID}:${process.env.ZOOM_APP_CLIENT_SECRET}`).toString('base64')}`
      },
      params: {
        grant_type: 'client_credentials'
      }
    });

    if (response.status !== 200) {
      throw new Error('Error getting chatbot_token from Zoom');
    }

    return response.data.access_token;
  } catch (error) {
    throw new Error('Error getting chatbot_token from Zoom');
  }
}

const refreshZoomAccessToken = async (zoomRefreshToken) => {
  const searchParams = new URLSearchParams()
  searchParams.set('grant_type', 'refresh_token')
  searchParams.set('refresh_token', zoomRefreshToken)

  return await axios({
    url: `${process.env.ZOOM_HOST}/oauth/token?${searchParams.toString()}`,
    method: 'POST',
    auth: {
      username: process.env.ZOOM_APP_CLIENT_ID,
      password: process.env.ZOOM_APP_CLIENT_SECRET,
    },
  })
}

const getZoomUser = async (accessToken) => {
  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/users/me`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

const getDeeplink = async (accessToken) => {
  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/zoomapp/deeplink`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      action: JSON.stringify({
        url: '/your/url',
        role_name: 'Owner',
        verified: 1,
        role_id: 0,
      }),
    },
  })
}

// Add this
const sendAChatMessage = async (accessToken, data) => {

  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/chat/users/me/messages`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    data: data
  })
}
// Add this
function generateChatBody(recordings, payload) {
  const chatBody = {
    robot_jid: process.env.ZOOM_BOT_JID,
    to_jid: payload.toJid,
    user_jid: payload.userJid,
    account_id: payload.accountId,
    visible_to_user: true,
    content: {
      head: {
        text: 'Your recordings:',
        sub_head: {
          text: `Sent by ${payload.userName}`
        }
      },
      body: recordings.meetings.flatMap(meeting => [
        { type: 'message', text: `Meeting ID: ${meeting.id}` },
        { type: 'message', text: `Meeting UUID: ${meeting.uuid}` },
        { type: 'message', text: `Start Time: ${meeting.start_time}` },
        { type: 'message', text: meeting.topic, link: meeting.share_url }
      ])
    }
  };

  return chatBody;
}

// Add this
async function sendIMChat(chatBody, chatbotToken) {
  const response = await axios({
    url: 'https://api.zoom.us/v2/im/chat/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chatbotToken}`
    },
    data: chatBody
  });

  console.log('send chat response status', response.status);
  if (response.status >= 400) {
    throw new Error('Error sending chat');
  }
}

// Add this
const getZoomRecordings = async (accessToken, from, to) => {

  try {
    const response = await axios({
      url: `${process.env.ZOOM_HOST}/v2/users/me/recordings?from=${from}&to=${to}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Return just the data part of the response
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Zoom recordings:', error);
    // Handle errors, possibly re-throwing them or returning a default
    throw error; // Re-throwing the error for the caller to handle
  }
}

// Add this
const createCustomZoomMessage = async (payload, options = {}) => {
  // Set default values and override with any provided values
  const {
    formEnabled = true,
    headText = "Attendance Form",
    subHeadText = "Please fill out today's attendance form",
    firstName = " ",
    lastName = " ",
    course = "Workforce Development",
    messageText = "Please fill out the form",
    messageBold = true,
    datepickerInitialDate = "2024/5/10",
    actionId = "datepicker123",
    dividerStyle = { bold: false, dotted: false, color: "#98a0a9" },
    submitButtonText = "Submit",
    submitButtonValue = "submit",
    submitButtonStyle = "Primary",
    submitButtonIsSubmit = true
  } = options;

  const chatBody = {
    operatorId: payload.operator_id,
    triggerId: payload.object.trigger_id,
    content: {
      head: {
        text: headText,
        sub_head: {
          text: subHeadText
        }
      }
    }
  };

  const chatBodyx = {

    operatorId: payload.operator_id,
    triggerId: payload.object.trigger_id,
    content: {
      settings: {
        form: formEnabled
      },
      head: {
        text: headText,
        sub_head: {
          text: subHeadText
        }
      },
      body: [
        {
          type: "fields",
          items: [
            {
              key: "First Name",
              value: firstName,
              editable: true
            },
            {
              key: "Last Name",
              value: lastName,
              editable: true
            },
            {
              key: "Course",
              value: course,
              editable: true
            }
          ]
        },
        {
          type: "message",
          text: messageText,
          style: {
            bold: messageBold
          }
        },
        {
          type: "datepicker",
          initial_date: datepickerInitialDate,
          action_id: actionId
        },
        {
          type: "divider",
          style: dividerStyle
        },
        {
          type: "actions",
          items: [
            {
              text: submitButtonText,
              value: submitButtonValue,
              style: submitButtonStyle,
              submit: submitButtonIsSubmit
            }
          ]
        }
      ]
    }
  }


  // Build the JSON message structure
  return chatBody;
}
// Attaching card to the chat message
async function sendUnfurlChat(chatBody, chatbotToken) {
  const { operatorId, triggerId, content } = await chatBody;

  console.log('Content Not Working: ', content);


  const unfurlData = JSON.stringify({
    "content": {
      "head": {
        "text": "Unfurl Message",
        "sub_head": {
          "text": "Easily Unfurl links with your Marketplace Team Chat app! When you share a link from an approved domain, it automatically generates a preview of the linked content. This is super handy for sharing links during continuous meetings or in Team Chat channels."
        }
      }
    }
  });
  console.log('sendUnfurlChat Expected Output: ',  unfurlData );

  const response = await axios({
    url: `https://api.zoom.us/v2/im/chat/users/${operatorId}/unfurls/${triggerId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chatbotToken}`
    },
    data: unfurlData 
  });

  
  if (response.status >= 400) {
    throw new Error('Error sending chat');
  }
}


module.exports = {
  getZoomAccessToken,
  getChatbotToken,
  refreshZoomAccessToken,
  getZoomUser,
  getDeeplink,
  sendAChatMessage,
  getZoomRecordings,
  sendIMChat,
  generateChatBody,
  createCustomZoomMessage,
  sendUnfurlChat
}
