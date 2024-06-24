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
        Authorization: `Basic ${Buffer.from(
          `${process.env.ZOOM_APP_CLIENT_ID}:${process.env.ZOOM_APP_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      params: {
        grant_type: 'client_credentials',
      },
    })

    if (response.status !== 200) {
      throw new Error('Error getting chatbot_token from Zoom')
    }

    return response.data.access_token
  } catch (error) {
    throw new Error('Error getting chatbot_token from Zoom')
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
const listUserChatChannels = async (accessToken) => {
  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/chat/users/me/channels`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

// Add this
const sendAChatMessage = async (accessToken, data) => {
  console.log('Sending chat message:', data)

  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/chat/users/me/messages`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    data: data,
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
          text: `Sent by ${payload.userName}`,
        },
      },
      body: recordings.meetings.flatMap((meeting) => [
        { type: 'message', text: `Meeting ID: ${meeting.id}` },
        { type: 'message', text: `Meeting UUID: ${meeting.uuid}` },
        { type: 'message', text: `Start Time: ${meeting.start_time}` },
        { type: 'message', text: meeting.topic, link: meeting.share_url },
      ]),
    },
  }

  return chatBody
}

// Add this
async function sendIMChat(chatBody, chatbotToken) {
  const response = await axios({
    url: 'https://api.zoom.us/v2/im/chat/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${chatbotToken}`,
    },
    data: chatBody,
  })

  console.log('send chat response status', response.status)
  if (response.status >= 400) {
    throw new Error('Error sending chat')
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
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Return just the data part of the response
    return response.data
  } catch (error) {
    console.error('Failed to fetch Zoom recordings:', error)
    // Handle errors, possibly re-throwing them or returning a default
    throw error // Re-throwing the error for the caller to handle
  }
}

// Function to create card content
const createCardContent = async (accessToken) => {
  // get deeplink
  const deeplink = await getDeeplink(accessToken)

  console.log('deeplink from createCardContent:', deeplink.data.deeplink, '\n')

  return JSON.stringify({
    content: {
      settings: { form: true },
      body: [
        {
          type: 'attachments',
          resource_url: deeplink.data.deeplink,
          img_url:
            'https://media.giphy.com/media/13lTwJ29JZIffi/giphy.gif?cid=82a1493b2ipv9v574ap6finqhj02upgf1k0cqdw3dtiec1i5&ep=v1_gifs_related&rid=giphy.gif&ct=g',
          information: {
            title: {
              text: 'Deep Link to Zoom App Demo',
            },
            description: {
              text: 'Click the image to open the Zoom App',
            },
          },
        },
        {
          type: 'actions',
          limit: 3,
          items: [
            {
              text: 'Open Zoom App Webview 1',
              value: 'button1',
              style: 'Default',
              action: 'dialog',
              dialog: {
                size: 'S',
                title: {
                  text: 'Create a ticket',
                },
              },
            },
            {
              text: 'Open Zoom App Webview 2',
              value: 'button2',
              style: 'Default',
              action: 'dialog',
              dialog: {
                size: 'S',
                title: {
                  text: 'Share a ticket',
                },
              },
            },
          ],
        },
      ],
    },
  })
}

// Function to create message data
const createMessageData = (cardContent, channel) => {
  return JSON.stringify({
    message:
      'This interactive chat message response is triggered when the collaborate button is clicked. In a Zoom Team message, clicking a button initiates an event and sends data to a specified endpoint. You can leverage this event to enhance the application experience by launching functions, opening dialogs, or even initiating real-time communication features. \n  \n 1) Click the button below to open Webview in chat \n 2) Click the image to open the Zoom App',
    to_channel: channel,
    interactive_cards: [
      {
        card_json: cardContent,
      },
    ],
  })
}

//  Function to send interactive chat message
const sendInteractiveChat = async (accessToken, channel) => {
  try {
    const cardContent = await createCardContent(accessToken)
    const messageData = createMessageData(cardContent, channel)

    const response = await axios({
      url: 'https://api.zoom.us/v2/chat/users/me/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: messageData,
    })

    if (response.status >= 400) {
      throw new Error(`Error sending chat: ${response.statusText}`)
    }

    return response.data // Return response data if needed
  } catch (error) {
    console.error('Failed to send interactive chat message:', error)
    throw error
  }
}

// Add this
const createCustomZoomMessage = async (payload, options = {}) => {
  // Set default values and override with any provided values
  const {
    headText = 'Attendance Form',
    subHeadText = "Please fill out today's attendance form",
  } = options

  const chatBody = {
    operatorId: payload.operator_id,
    triggerId: payload.object.trigger_id,
    content: {
      head: {
        text: headText,
        sub_head: {
          text: subHeadText,
        },
      },
    },
  }

  // Build the JSON message structure
  return chatBody
}
// Attaching card to the chat message
async function sendUnfurlChat(chatBody, chatbotToken) {
  const { operatorId, triggerId } = await chatBody

  const unfurlData = JSON.stringify({
    content: {
      head: {
        text: 'Unfurled Message',
        sub_head: {
          text: 'Easily Unfurl links with your Marketplace Team Chat app! When you share a link from an approved domain, it automatically generates a preview of the linked content. This is super handy for sharing links during continuous meetings or in Team Chat channels.',
        },
      },
      body: [
        {
          type: 'video',
          title: {
            text: '<https://youtu.be/otlyDxnU-RI?si=6b9UWM-UV3Qw1vkr|How To Create a Zoom App | Zoom AI Collaboration Platform Developer Tools  >',
            is_markdown_support: true,
          },
          action_id: 'video_play',
          video_url: 'https://youtu.be/otlyDxnU-RI?si=O6DnuNu5aHr3R3TR',
          thumbnail_url:
            'https://i.ytimg.com/vi/otlyDxnU-RI/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBYgRyh_MA8=&rs=AOn4CLChclc14y_XgAkqOCDdCB6JqZlF-g',
          author_name: 'Zoom for Developers',
          provider_name: 'YouTube',
          provider_icon_url:
            'https://www.youtube.com/s/desktop/661c298b/img/favicon.ico',
          title_url: 'https://www.youtube.com/watch?v=3tOz6vkctjA',
        },
        {
          type: 'progress_bar',
          value: 50,
        },
      ],
    },
  })

  const response = await axios({
    url: `https://api.zoom.us/v2/im/chat/users/${operatorId}/unfurls/${triggerId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${chatbotToken}`,
    },
    data: unfurlData,
  })

  if (response.status >= 400) {
    throw new Error('Error sending chat')
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
  sendUnfurlChat,
  sendInteractiveChat,
  listUserChatChannels,
}
