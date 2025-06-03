import { createConversation, sendMessage, getConversationHistory } from '@/lib/playlab';

export async function POST(request) {
  try {
    const { action, conversationId, message } = await request.json();

    // Validate required fields based on action
    if (action === 'send' && (!conversationId || !message)) {
      return Response.json(
        { error: 'Missing required fields: conversationId and message are required for send action' },
        { status: 400 }
      );
    }

    if (action === 'history' && !conversationId) {
      return Response.json(
        { error: 'Missing required field: conversationId is required for history action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create': {
        try {
          const id = await createConversation();
          return Response.json({ conversationId: id });
        } catch (error) {
          console.error('Error creating conversation:', error);
          return Response.json(
            { error: error.message || 'Failed to create conversation' },
            { status: 500 }
          );
        }
      }

      case 'send': {
        try {
          // Create a TransformStream to handle the streaming response
          const encoder = new TextEncoder();
          const stream = new TransformStream();
          const writer = stream.writable.getWriter();

          // Start the message stream in the background
          sendMessage(conversationId, message)
            .then(async (response) => {
              try {
                await writer.write(encoder.encode(JSON.stringify(response)));
                await writer.close();
              } catch (error) {
                console.error('Error writing to stream:', error);
                await writer.abort(error);
              }
            })
            .catch(async (error) => {
              console.error('Error in message stream:', error);
              await writer.abort(error);
            });

          // Return the stream as the response
          return new Response(stream.readable, {
            headers: {
              'Content-Type': 'application/json',
              'Transfer-Encoding': 'chunked'
            }
          });
        } catch (error) {
          console.error('Error sending message:', error);
          return Response.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
          );
        }
      }

      case 'history': {
        try {
          const messages = await getConversationHistory(conversationId);
          return Response.json({ messages });
        } catch (error) {
          console.error('Error getting conversation history:', error);
          return Response.json(
            { error: error.message || 'Failed to get conversation history' },
            { status: 500 }
          );
        }
      }

      default:
        return Response.json(
          { error: `Invalid action: ${action}. Supported actions are: create, send, history` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 