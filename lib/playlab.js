import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_PLAYLAB_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_PLAYLAB_PROJECT_ID;
const API_BASE_URL = "https://www.playlab.ai/api/v1";

// Define minimal system instructions
const systemInstructions = {
  content: `Welcome to School chat bot! Are you ready to get started?

You are a friendly and helpful AI assistant focused on helping students learn.
Use katex formatting with \[ \] for block equations and \( \) for inline equations.`
};

// Validate environment variables
if (!API_KEY || !PROJECT_ID) {
  console.error('Missing required PlayLab environment variables. Please check your .env.local file.');
}

// Log the configuration (without sensitive data)
console.log('PlayLab API Configuration:', {
  baseUrl: API_BASE_URL,
  projectIdLength: PROJECT_ID?.length,
  hasApiKey: !!API_KEY
});

const playlabClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Test the PlayLab API connection
 * @returns {Promise<{success: boolean, error?: string, details?: any}>}
 */
export async function testPlaylabConnection() {
  try {
    // First verify the project ID format
    if (!PROJECT_ID || PROJECT_ID.includes('/')) {
      return {
        success: false,
        error: 'Invalid project ID format',
        details: { projectId: PROJECT_ID }
      };
    }

    console.log('Testing connection to PlayLab API...', {
      baseUrl: API_BASE_URL,
      endpoint: `/projects/${PROJECT_ID}/conversations`,
      projectId: PROJECT_ID
    });

    // Test connection by trying to create a conversation
    const response = await playlabClient.post(`/projects/${PROJECT_ID}/conversations`, {});
    
    if (!response.data) {
      return {
        success: false,
        error: 'Failed to authenticate with PlayLab API',
        details: response.data
      };
    }

    return {
      success: true,
      details: {
        conversation: response.data,
        apiUrl: API_BASE_URL,
        endpoint: `/projects/${PROJECT_ID}/conversations`
      }
    };
  } catch (error) {
    console.error('PlayLab API connection test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      baseUrl: API_BASE_URL,
      endpoint: `/projects/${PROJECT_ID}/conversations`,
      projectId: PROJECT_ID
    });

    // Provide more specific error messages based on status code
    let errorMessage = 'Failed to connect to PlayLab API';
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please check your API key.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. Please check your project ID and permissions.';
    } else if (error.response?.status === 404) {
      errorMessage = 'API endpoint not found. Please verify the API URL and project ID.';
    }

    return {
      success: false,
      error: errorMessage,
      details: {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data,
        baseUrl: API_BASE_URL,
        endpoint: `/projects/${PROJECT_ID}/conversations`,
        projectId: PROJECT_ID
      }
    };
  }
}

/**
 * Creates a new conversation with PlayLab AI
 * @returns {Promise<string>} The conversation ID
 */
export async function createConversation() {
  try {
    // Verify project ID format
    if (!PROJECT_ID || PROJECT_ID.includes('/')) {
      throw new Error('Invalid project ID format');
    }

    console.log('Creating conversation with PlayLab API...', {
      url: `${API_BASE_URL}/projects/${PROJECT_ID}/conversations`,
      projectId: PROJECT_ID
    });

    // Create conversation with minimal configuration and strict system instructions
    const response = await playlabClient.post(
      `/projects/${PROJECT_ID}/conversations`,
      {
        system_instructions: systemInstructions.content,
        metadata: {
          prevent_system_messages: true,
          hide_instructions: true,
          suppress_welcome: true
        }
      }
    );
    
    if (!response.data) {
      console.error('Empty response from PlayLab API');
      throw new Error('Empty response from PlayLab API');
    }

    console.log('PlayLab API response:', response.data);
    
    if (!response.data.conversation || !response.data.conversation.id) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid response structure from PlayLab API');
    }

    return response.data.conversation.id;
  } catch (error) {
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      headers: error.config?.headers,
      baseUrl: API_BASE_URL,
      endpoint: `/projects/${PROJECT_ID}/conversations`,
      projectId: PROJECT_ID
    };
    
    console.error('Error creating conversation:', errorDetails);
    
    // Check for specific error types
    if (error.response?.status === 404) {
      throw new Error(`API endpoint not found. Please verify the API URL and project ID. Details: ${JSON.stringify(errorDetails)}`);
    } else if (error.response?.status === 401) {
      throw new Error(`Authentication failed. Please check your API key. Details: ${JSON.stringify(errorDetails)}`);
    } else if (error.response?.status === 403) {
      throw new Error(`Access denied. Please check your project ID and permissions. Details: ${JSON.stringify(errorDetails)}`);
    }
    
    throw new Error(`Failed to create conversation: ${error.message}. Details: ${JSON.stringify(errorDetails)}`);
  }
}

/**
 * Sends a message to the PlayLab AI conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {string} message - The message to send
 * @returns {Promise<Object>} The AI's response
 */
export async function sendMessage(conversationId, message) {
  try {
    // Verify IDs
    if (!PROJECT_ID || PROJECT_ID.includes('/')) {
      throw new Error('Invalid project ID format');
    }
    if (!conversationId || conversationId.includes('/')) {
      throw new Error('Invalid conversation ID format');
    }

    const response = await playlabClient.post(
      `/projects/${PROJECT_ID}/conversations/${conversationId}/messages`,
      { 
        input: { 
          message,
          system_instructions: systemInstructions.content,
          suppress_system_messages: true
        }
      },
      { 
        responseType: 'stream',
        headers: {
          'Accept': 'text/event-stream',
          'X-Suppress-System-Messages': 'true'
        }
      }
    );

    return new Promise((resolve, reject) => {
      let fullContent = '';
      let role = 'assistant';
      let buffer = '';

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        lines.forEach((line) => {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.delta) {
                buffer += data.delta;
                
                // Check if we have a complete system message
                if (buffer.includes('### System Rules') || 
                    buffer.includes('Welcome to School chat bot') ||
                    buffer.includes('Today\'s date is') ||
                    buffer.includes('Always assist')) {
                  buffer = ''; // Clear the buffer if it contains system messages
                  return;
                }

                // If we have a complete sentence or paragraph, add it to the content
                if (buffer.includes('.') || buffer.includes('!') || buffer.includes('?')) {
                  // Only add if it's not a system message
                  if (!buffer.includes('###') && 
                      !buffer.includes('System Rules') && 
                      !buffer.includes('Welcome to School chat bot') &&
                      !buffer.includes('Today\'s date is') &&
                      !buffer.includes('Always assist')) {
                    fullContent += buffer;
                  }
                  buffer = '';
                }
              }
              if (data.role) {
                role = data.role;
              }
            } catch (e) {
              // Ignore parsing errors for malformed JSON
            }
          }
        });
      });

      response.data.on('end', () => {
        // Add any remaining non-system content
        if (buffer && 
            !buffer.includes('###') && 
            !buffer.includes('System Rules') && 
            !buffer.includes('Welcome to School chat bot') &&
            !buffer.includes('Today\'s date is') &&
            !buffer.includes('Always assist')) {
          fullContent += buffer;
        }

        // Clean up the content
        const finalContent = fullContent
          .replace(/\n{3,}/g, '\n\n')
          .replace(/^\s+|\s+$/g, '')
          .trim();

        resolve({
          content: finalContent,
          role: role
        });
      });

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        reject(new Error('Failed to stream message: ' + error.message));
      });
    });
  } catch (error) {
    console.error('Error sending message:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    throw new Error('Failed to send message: ' + (error.response?.data?.message || error.message));
  }
}

/**
 * Gets the conversation history
 * @param {string} conversationId - The ID of the conversation
 * @returns {Promise<Array>} The conversation history
 */
export async function getConversationHistory(conversationId) {
  try {
    // Verify IDs
    if (!PROJECT_ID || PROJECT_ID.includes('/')) {
      throw new Error('Invalid project ID format');
    }
    if (!conversationId || conversationId.includes('/')) {
      throw new Error('Invalid conversation ID format');
    }

    const response = await playlabClient.get(
      `/projects/${PROJECT_ID}/conversations/${conversationId}/messages`
    );

    if (!response.data || !Array.isArray(response.data.messages)) {
      console.error('Invalid API response:', response.data);
      throw new Error('Invalid response from PlayLab API');
    }

    return response.data.messages.map(msg => ({
      role: msg.role || 'assistant',
      content: msg.content
    }));
  } catch (error) {
    console.error('Error getting conversation history:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    throw new Error('Failed to get conversation history: ' + (error.response?.data?.message || error.message));
  }
}

const playlab = {
  createConversation,
  sendMessage,
  getConversationHistory,
  testPlaylabConnection
};

export default playlab; 