import { testPlaylabConnection } from '@/lib/playlab';

export async function GET() {
  try {
    console.log('Testing PlayLab API connection...');
    const result = await testPlaylabConnection();
    
    if (!result.success) {
      console.error('PlayLab API test failed:', {
        error: result.error,
        details: result.details
      });
      
      return Response.json(
        { 
          error: result.error,
          details: result.details,
          endpoint: 'chat/conversations'
        },
        { status: 500 }
      );
    }

    console.log('PlayLab API test successful:', result.details);
    return Response.json({
      success: true,
      message: 'Successfully connected to PlayLab API',
      details: result.details,
      endpoint: 'chat/conversations'
    });
  } catch (error) {
    console.error('Error testing PlayLab connection:', {
      error: error.message,
      stack: error.stack,
      details: error.response?.data
    });
    
    return Response.json(
      { 
        error: 'Failed to test PlayLab connection',
        details: {
          message: error.message,
          endpoint: 'chat/conversations',
          response: error.response?.data
        }
      },
      { status: 500 }
    );
  }
} 