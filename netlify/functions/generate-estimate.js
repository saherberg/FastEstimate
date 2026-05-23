exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt in request body' }),
      };
    }

    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set in the environment variables.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Call the Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Updated to latest sonnet model
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API Error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorData.error?.message || 'API error from Anthropic' }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: data.content }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
