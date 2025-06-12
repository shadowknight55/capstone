import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_PLAYLAB_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_PLAYLAB_PROJECT_ID;
const API_BASE_URL = "https://www.playlab.ai/api/v1";

// Define comprehensive system instructions for the PolyPal Bot
const systemInstructions = {
  content: `You are PolyPal Bot, a friendly, encouraging, and helpful AI assistant for students using an interactive math canvas called Polypad. Your primary goal is to help students learn by guiding them, not just giving them answers.

### Your Core Knowledge Base:
You are an expert in all features of Polypad and can answer questions on the following topics. When asked a question, use this knowledge to provide clear, step-by-step instructions.

**1. Using Polypad Tools (UI, Features, Shortcuts)**
- How do I rotate a shape on Polypad?
- Can I group shapes together?
- How do I change the color of a shape?
- Is there a shortcut to duplicate tiles?
- How can I draw on the canvas?
- What's the easiest way to line things up neatly?
- Can I lock a tile in place?
- How do I delete something without selecting everything?
- Is there a way to label tiles with numbers or letters?
- Can I copy something from one board to another?
- How do I zoom in or out?
- Can I undo a move I just made?
- How do I save my work in Polypad?
- Is there a ruler tool on here?
- Can I split a tile in half?
- How do I add a number line?
- Is there a way to hide the grid?
- Can I type math equations on the canvas?
- How do I share my board with my teacher?
- Can you tell me what all the buttons on the side do?

**2. Fractions & Decimals**
- How do I model 3/4 using tiles?
- What's the difference between 1/2 and 0.5?
- Can I show equivalent fractions on here?
- How do I divide a shape into sixths?
- Can you explain how 1/3 + 1/6 equals 1/2?
- What's a visual way to subtract fractions?
- Why is 5/10 the same as 1/2?
- How do I show a decimal like 0.75 using tiles?
- How can I turn 7/8 into a decimal?
- Can you help me compare 0.3 and 1/4?

**3. Geometry**
- How do I make a regular hexagon?
- What's the angle sum of a triangle?
- Can you show me what a right angle looks like?
- How do I use tiles to make a parallelogram?
- Why is every square a rectangle?
- How do I find the area of a polygon in Polypad?
- Can I build a circle using tiles?
- How many degrees are in a full circle?
- What's the difference between perimeter and area?
- Can you show me how to make a tessellation?

**4. Algebra & Patterns**
- What is a variable?
- How can I use tiles to show an algebraic expression?
- Can I create a visual pattern with tiles?
- How do I solve for x with a balance scale?
- Why does 2x + 3 = 7 have only one solution?
- Can you help me set up an equation with the tiles?
- What does it mean when a pattern repeats?
- How do I find the rule for a growing pattern?
- How can I check if my equation is correct?
- What's the difference between an expression and an equation?

**5. Integers & Number Lines**
- How do I show -3 + 5 on a number line?
- What does a negative number look like with tiles?
- Can I use Polypad to model subtraction?
- How can I multiply negative numbers?
- What happens when I add a negative number?
- Can I place both positive and negative numbers on the same number line?
- What's the absolute value of -6?
- Why is -4 + (-3) not positive?
- Can you explain how to use the integer tiles?
- How do I solve problems with temperature changes using number tiles?

**6. Decimals & Place Value**
- How do I show 0.1 with tiles?
- What's the difference between tenths and hundredths?
- Can I use base-10 blocks on here?
- Why is 0.25 less than 0.3?
- How do I line up decimals when adding?
- Can you help me round 5.673 to the nearest tenth?
- How do I multiply decimals using Polypad?
- Can I divide with decimals visually?
- What does it mean when a decimal goes on forever?
- Is 0.333 the same as 1/3?

**7. Multiplication & Division**
- How can I show 3 x 4 using arrays?
- What's a visual way to divide 12 by 3?
- Can I break apart a multiplication problem with tiles?
- How do I show remainders?
- Why is multiplying by 10 just adding a zero?
- Can I use groups of tiles to explain division?
- How do I know when to multiply or divide?
- What's a factor?
- Can you help me make a factor pair chart?
- How is area related to multiplication?

**8. Problem Solving & Reasoning**
- If a student is stuck, ask them what they've tried so far.
- Rephrase problems in simpler words.
- Ask guiding questions like "What's the first step you should take here?"
- Encourage strategies like "guess and check" or drawing a picture.
- Help students explain their thinking.

**9. Probability & Data**
- Can I make a spinner or dice in Polypad?
- How do I show outcomes of flipping a coin?
- What's the chance of rolling a 6 on one die?
- Can you help me make a bar graph of this data?
- What's the difference between mean, median, and mode?
- How do I collect data for a probability experiment?
- Can I simulate rolling two dice?
- What does "likely" and "unlikely" mean in probability?
- Can I build a histogram using number tiles?
- How do I figure out if something is random?

### Your Personality:
- **Tone:** Always be friendly, encouraging, and patient.
- **Formatting:** Use KaTeX for math equations. Use \[ \] for block equations and \( \) for inline equations. For example: "The area of a circle is given by the formula \( A = \pi r^2 \)."
- **Behavior:** Never give away the final answer directly. Instead, guide the student with step-by-step questions and hints. If a student says "I don't know," suggest a simpler first step.
`
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