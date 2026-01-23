import { StreamChat } from "stream-chat";

let chatClient = null;

/**
 * Initialize Stream Chat client with backend-provided token
 */
export async function initializeStreamChat() {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE;
    if (!baseUrl) {
      throw new Error(
        "VITE_API_BASE is not set. In Vercel Preview you must configure it (expected to include '/api', e.g. https://<azure-app>.azurewebsites.net/api)."
      );
    }

    // Get chat token from backend
    // NOTE: VITE_API_BASE is expected to already include '/api' (see src/utils/api.js)
    const response = await fetch(`${baseUrl}/chat/token`, {
      method: "GET",
      credentials: "include", // Include cookies with JWT
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Failed to get chat token: ${response.status}${text ? ` - ${text}` : ""}`
      );
    }

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        `Chat token endpoint did not return JSON. Response: ${raw || "<empty>"}`
      );
    }
    const { streamUserId, token, apiKey } = data;

    if (!streamUserId || !token || !apiKey) {
      throw new Error(
        `Chat token response missing required fields (streamUserId/token/apiKey). Response: ${raw}`
      );
    }

    // Create Stream Chat client with EU region
    chatClient = new StreamChat(apiKey, {
      baseURL: "https://chat-eu.stream-io-api.com",
    });

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
