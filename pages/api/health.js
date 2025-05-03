/**
 * Health check endpoint for ingreddit.com
 * Used by Railway for container health monitoring
 * 
 * @see https://docs.railway.com/reference/healthchecks
 */
export default function handler(req, res) {
  // Basic health information
  const healthData = {
    status: 'ok',
    service: 'ingreddit-recipe-search',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // You can add more sophisticated checks here if needed:
  // - Database connectivity
  // - External API availability
  // - Memory usage
  
  // Return 200 OK with health data
  res.status(200).json(healthData);
} 