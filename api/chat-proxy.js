// /api/chat-proxy.js
import axios from 'axios';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse the incoming request body
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create FormData equivalent for the API request
    const formData = new URLSearchParams();
    formData.append('message', message);

    // Make request to your API
    const response = await axios({
      method: 'POST',
      url: 'http://45.153.191.237/api/aiapi/chat/ai/',
      headers: {
        'X-CSRFTOKEN': 'N8q096M9Cjb93GKTKQDd8FmMGGkIxPH8cjLzRUSGXCgck5Y3Qfiv7sybJYfbqjgC',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: formData
    });

    // Return the API response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}
