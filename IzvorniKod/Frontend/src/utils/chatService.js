import { StreamChat } from "stream-chat";

let chatClient = null;

/**
 * Initialize Stream Chat client with backend-provided token
 */
export async function initializeStreamChat() {
  try {
    // Get chat token from backend
    // NOTE: VITE_API_BASE is expected to already include '/api' (see src/utils/api.js)
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/chat/token`, {
      method: "GET",
      credentials: "include", // Include cookies with JWT
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat token: ${response.status}`);
    }

    const data = await response.json();
    const { streamUserId, token, apiKey } = data;

    // Create Stream Chat client
    chatClient = new StreamChat(apiKey);

    // Connect user to Stream
    await chatClient.connectUser(
      {
        id: String(streamUserId),
      },
      token
    );

    console.log("Stream Chat initialized successfully");
    return chatClient;
  } catch (error) {
    console.error("Error initializing Stream Chat:", error);
    throw error;
  }
}

/**
 * Get the initialized chat client
 */
export function getChatClient() {
  if (!chatClient) {
    throw new Error("Chat client not initialized. Call initializeStreamChat first.");
  }
  return chatClient;
}

/**
 * Disconnect from Stream Chat
 */
export async function disconnectStreamChat() {
  if (chatClient) {
    await chatClient.disconnectUser();
    chatClient = null;
  }
}

/**
 * Create or get a channel for a walk
 */
export async function getOrCreateWalkChannel(walkId, ownerId, walkerId) {
  const client = getChatClient();
  
  // Create a unique channel ID based on walk ID
  const channelId = `walk-${walkId}`;
  
  const channel = client.channel("messaging", channelId, {
    name: `Walk #${walkId}`,
    members: [String(ownerId), String(walkerId)],
  });

  // `watch()` will create the channel if it doesn't exist, and is safe to call repeatedly.
  await channel.watch();
  return channel;
}

/**
 * Send a message to a channel
 */
export async function sendMessage(channel, text) {
  try {
    await channel.sendMessage({
      text: text,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Upload an image to Stream and send it as a message attachment.
 */
export async function sendImageMessage(channel, file, text = "") {
  try {
    const upload = await channel.sendImage(file);
    const imageUrl = upload?.file;
    if (!imageUrl) {
      throw new Error("Image upload failed");
    }

    await channel.sendMessage({
      text,
      attachments: [
        {
          type: "image",
          image_url: imageUrl,
        },
      ],
    });
  } catch (error) {
    console.error("Error sending image message:", error);
    throw error;
  }
}
