
// Simple API endpoint for email sending (for development/testing)
// This will be replaced with proper edge function in production
export default function handler(req, res) {
  // Check method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Log the request for debugging
    console.log('Email test request received:', {
      recipients: req.body.recipients,
      subject: req.body.subject,
      contentLength: req.body.content?.length || 0
    });
    
    // In development/test mode, we'll just simulate success
    return res.status(200).json({
      success: true,
      message: `Test email sent to ${req.body.recipients.join(', ')}`,
      id: 'test-email-' + Math.random().toString(36).substring(2, 15)
    });
  } catch (error) {
    console.error('Error in email test endpoint:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: true 
    });
  }
}
