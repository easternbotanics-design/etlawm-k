import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

dotenv.config();

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1054627024408940';

const sendTemplateMessage = async (to, templateName, languageCode = 'en_US', components = []) => {
  const data = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      }
    }
  };

  if (components && components.length > 0) {
    data.template.components = components;
  }

  const response = await axios({
    url: `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)
  });

  console.log('[whatsappService sendTemplateMessage] Response:', response.data);
  return response.data;
}

const sendTextMessage = async (to, message) => {
  const response = await axios({
    url: `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: message
      }
    })
  })

  console.log(response.data);
}

const sendMediaMessage = async () => {
  const response = await axios({
    url: `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '917030577234',
      type: 'image',
      image: {
        id: '972018972104768',
        caption: 'caption'
      }
    })
  })

  console.log(response.data);
}

const uploadImage = async () => {
  const data = new FormData();
  data.append('messaging_product', 'whatsapp');
  data.append('file', fs.createReadStream(process.cwd() + '/logo.png', { contentType: 'image/png' }));
  data.append('type', 'image/png');

  const response = await axios({
    url: `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/media`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    data: data
  })

  console.log(response.data);
}

const sendOtpMessage = async (to, otp) => {
  const url = `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`;
  const templateName = process.env.WA_OTP_TEMPLATE;

  if (!templateName) {
    throw new Error('[whatsappService sendOtpMessage] Cannot send business-initiated OTP without a configured template (WA_OTP_TEMPLATE is missing in env).');
  }

  const headers = {
    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const data = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en'
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: otp
            }
          ]
        }
      ]
    }
  };

  console.log(`[whatsappService sendOtpMessage] Sending to ${to} via template: ${templateName}`);

  try {
    const response = await axios({
      url,
      method: 'POST',
      headers,
      data
    });
    console.log('[whatsappService sendOtpMessage] Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[whatsappService sendOtpMessage] Error detail:', error.response?.data || error.message);
    throw error;
  }
};

export {
  sendTemplateMessage,
  sendTextMessage,
  sendMediaMessage,
  uploadImage,
  sendOtpMessage
}
