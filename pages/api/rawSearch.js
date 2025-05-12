import axios from 'axios';

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple in-memory rate limiting store (in a real app, use Redis or similar)
const rateLimits = {
  // IP address -> { tokens: number, lastRefill: timestamp }
  limits: new Map(),
  // Rate limit config: 10 requests per minute, refill 1 token every 6 seconds
  maxTokens: 10,
  refillRate: 6000, // 6 seconds in ms
  tokensPerRefill: 1,
  
  // Get current token count for an IP
  getTokens(ip) {
    // If we don't have a record for this IP, create one
    if (!this.limits.has(ip)) {
      this.limits.set(ip, {
        tokens: this.maxTokens,
        lastRefill: Date.now()
      });
      return this.maxTokens;
    }
    
    // Get the record and refill if needed
    const record = this.limits.get(ip);
    const now = Date.now();
    const elapsed = now - record.lastRefill;
    
    // Calculate how many tokens to refill
    if (elapsed > this.refillRate) {
      const refills = Math.floor(elapsed / this.refillRate);
      record.tokens = Math.min(
        this.maxTokens, 
        record.tokens + (refills * this.tokensPerRefill)
      );
      record.lastRefill = now;
    }
    
    return record.tokens;
  },
  
  // Consume a token
  consume(ip) {
    // Get current token count
    const tokens = this.getTokens(ip);
    
    // If no tokens left, return false
    if (tokens <= 0) {
      return false;
    }
    
    // Consume a token
    const record = this.limits.get(ip);
    record.tokens -= 1;
    return true;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get IP address from Vercel headers or fallback to connection
  const ip = req.headers['x-forwarded-for'] || 
             req.connection.remoteAddress ||
             'unknown-ip';
             
  // Check rate limit
  if (!rateLimits.consume(ip)) {
    // If rate limited, return 429 with retry-after header
    const retryAfter = Math.ceil(rateLimits.refillRate / 1000);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({ 
      error: 'Too many requests',
      message: `Too many requests, please try again in ${retryAfter} seconds.`
    });
  }

  try {
    // Collect the raw request body
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    
    const rawBody = Buffer.concat(chunks).toString('utf8');
    console.log('Raw request body:', rawBody);
    
    // Parse the raw body
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing raw body:', parseError);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    
    // Forward the request using the raw body
    const response = await axios.post(
      'https://web-production-9df5.up.railway.app/search',
      parsedBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the response data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error proxying search request:', error);
    
    // For debugging: log the exact error details
    if (error.response) {
      console.error('Backend response:', error.response.status, error.response.data);
      
      // If backend is rate limiting, propagate that status but add our own headers
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || '60';
        res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({
          error: 'Too many requests',
          message: `Backend rate limit exceeded. Please try again in ${retryAfter} seconds.`
        });
      }
    }
    
    // Forward the error response with appropriate status
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch recipes', 
      details: error.message
    });
  }
} 