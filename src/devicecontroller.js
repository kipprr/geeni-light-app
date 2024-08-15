const axios = require('axios');
const crypto = require('crypto');
const config = require('./config');

// Function to generate the signature
const generateSignature = (client_id, client_secret, timestamp, path) => {
  const signString = `${client_id}${timestamp}${client_secret}`;
  const signature = crypto.createHash('sha256').update(signString).digest('hex').toUpperCase();
  return signature;
};

// Function to get the access token
const getAccessToken = async () => {
  const timestamp = Date.now();
  const path = '/token';
  const sign = generateSignature(config.CLIENT_ID, config.CLIENT_SECRET, timestamp, path);

  try {
    const response = await axios({
      method: 'get',
      url: `${config.API_BASE_URL}${path}`,
      headers: {
        'client_id': config.CLIENT_ID,
        'sign': sign,
        't': timestamp,
        'Content-Type': 'application/json'
      },
      params: {
        grant_type: '1',
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET
      }
    });
    console.log(response);
    return response.data.result.access_token;
  } catch (error) {
    console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to change the light color
const setLightColor = async (color) => {
  if (!color) {
    throw new Error('Color is required');
  }

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -1) + 'Z'; // Format: yyyyMMdd'T'HHmmss'Z'
  const path = `/v1.0/devices/${config.DEVICE_ID}/commands`;
  const accessToken = await getAccessToken();
  const sign = generateSignature(config.CLIENT_ID, config.CLIENT_SECRET, timestamp, path);

  try {
    const response = await axios({
      method: 'post',
      url: `${config.API_BASE_URL}${path}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'client_id': config.CLIENT_ID,
        'sign': sign,
        't': timestamp,
        'Content-Type': 'application/json'
      },
      data: {
        commands: [
          { code: 'color', value: color }
        ]
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error controlling device:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = {
    getAccessToken,
  setLightColor
};
