const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for cross-origin requests
app.use(cors());

// Use app.use to catch ALL paths (/style.css, /logo.png, etc.)
app.use(async (req, res) => {
  let targetUrl = req.query.url;

  // If no ?url= parameter exists, check the Referer header from the browser
  if (!targetUrl && req.headers.referer) {
    try {
      const refererUrl = new URL(req.headers.referer);
      const originalTarget = refererUrl.searchParams.get('url');
      if (originalTarget) {
        // Resolve relative paths (e.g., /style.css) against the target site
        targetUrl = new URL(req.path, originalTarget).toString();
      }
    } catch (e) {
      // Ignore malformed referers
    }
  }

  // If we still don't have a target URL, show instructions
  if (!targetUrl) {
    return res.status(400).send("Proxy active. Pass ?url=https://example.com");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // Pass along the target's original content type (text/css, image/png, etc.)
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // For HTML pages, inject a <base> tag to help resolve inline assets
    if (contentType && contentType.includes('text/html')) {
      let body = await response.text();
      const baseTag = `<head><base href="${targetUrl}">`;
      body = body.includes('<head>') ? body.replace('<head>', baseTag) : baseTag + body;
      return res.send(body);
    }

    // For binary files/styles/scripts, send the raw buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);

  } catch (error) {
    res.status(500).send("Error fetching resource: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
