import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Debug API endpoint for KaspaWallet integration
 * This endpoint helps diagnose connection issues by returning information about the request
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get detailed request information
    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      cookies: req.cookies,
      body: req.body || {}
    };
    
    // Return the request information for debugging
    res.status(200).json({
      message: 'Debug info for Kaspa wallet integration',
      time: new Date().toISOString(),
      requestInfo,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        apiUrl: process.env.API_URL || 'Not set'
      }
    });
  } catch (error) {
    console.error('Error in wallet debug endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
