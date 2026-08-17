const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from any origin (e.g. Weebly)
app.use(cors());

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.send("Proxy is live! Usage: /?url=https://en.wikipedia.org");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).send("Error fetching requested page: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
