const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const CLIENT_ID = 'twarnrhxjdf383g5mhag';
const CLIENT_SECRET = 'e14eae41e12344c7b673ef128fd07d88';
const DEVICE_ID = '3661016184f3eb3dc08f';
const API_BASE_URL = 'https://openapi.tuyaus.com/v1.0';

let accessToken = '';

// async requestSign(t: string): Promise<string> {
//     let accessToken = await this.store.getAccessToken();
//     if (!accessToken) {
//       await this.init(); // 未获取到 accessToke 时, 重新初始化
//       accessToken = await this.store.getAccessToken();
//     }
//     const str = `${this.accessKey}${accessToken}${t}`;
//     return this.sign(str, this.secretKey);
//   }

  refreshSign(t: string): string {
    const str = `${this.accessKey}${t}`;
    return this.sign(str, this.secretKey);
  }

async getHeader(t: string, forRefresh = false): Promise<TuyaOpenApiClientRequestExtHeader> {
    const sign = forRefresh ? this.refreshSign(t) : await this.requestSign(t);
    const accessToken = await this.store.getAccessToken();
    return {
      t,
      sign,
      client_id: this.accessKey,
      sign_method: "HMAC-SHA256",
      access_token: '',
      Dev_lang: 'Nodejs',
      Dev_channel: 'SaaSFramework',
  };
  }

// Function to get the access token
const getAccessToken = async () => {
    const t = Date.now().toString();
    let headers =  await this.getHeader(t, true);

  try {
    const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/token`,
        params:{
            grant_type: '1'
        },
        headers
    });
    console.log(response);
    accessToken = response.data.result.access_token;
    console.log('Access token retrieved');
  } catch (error) {
    console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
  }
};

// Endpoint to change the light color
app.post('/set-color', async (req, res) => {
  const { color } = req.body;
  
  if (!color) {
    return res.status(400).json({ error: 'Color is required' });
  }

  if (!accessToken) {
    await getAccessToken();
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/devices/${DEVICE_ID}/commands`, {
      commands: [
        { code: 'color', value: color }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error controlling device:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to control the device' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});