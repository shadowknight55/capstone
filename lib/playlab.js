import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_PLAYLAB_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_PLAYLAB_PROJECT_ID;
const API_BASE_URL = "https://www.playlab.ai/api/v1";

// Create a new conversation and return the conversation ID
export async function createConversation() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations`,
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.conversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error.response?.data || error.message);
    throw error;
  }
}

// Send a message and stream the AI's response (Node.js only)
export async function sendMessage(conversationId, message, onDelta) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`,
      { input: { message } },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    return new Promise((resolve, reject) => {
      let fullContent = "";
      response.data.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        lines.forEach((line) => {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.delta) {
                fullContent += data.delta;
                if (onDelta) onDelta(data.delta); // callback for streaming
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        });
      });

      response.data.on("end", () => {
        resolve(fullContent);
      });

      response.data.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error;
  }
}

// Get the conversation history for a given conversationId
export async function getConversationHistory(conversationId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${PROJECT_ID}/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // Return an array of messages (role/content)
    return response.data.messages.map(msg => ({
      role: msg.role || 'assistant',
      content: msg.content
    }));
  } catch (error) {
    console.error("Error getting conversation history:", error.response?.data || error.message);
    throw error;
  }
}

