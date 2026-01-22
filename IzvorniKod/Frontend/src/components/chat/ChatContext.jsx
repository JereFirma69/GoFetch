import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createMockSocket } from "./mockSocket";
import { useReviews } from "../reviews/ReviewsContext";
import { initializeStreamChat, getOrCreateWalkChannel, sendMessage } from "../../utils/chatService";


const ChatContext = createContext();

export function ChatProvider({ walk, ownerId, walkerId, children }) {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // Testing purposes
  const channelRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const reviewRequestedRef = useRef(false);
  const { requestReview } = useReviews();

  useEffect(() => {
    if (!walk) {
      setLoading(false);
      return;
    }

    const endTime = new Date(walk.endTime).getTime();
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      setActive(false);

    if(!reviewRequestedRef.current){
      requestReview({
      walkId: walk.walkId,
      otherUserName: "other",
      role: "owner",
    }); //ako user uđe u aplikaciju i vidi da je šetnja završila
    reviewRequestedRef.current = true;
  }

      setLoading(false);

      return;
    }

    const initChat = async () => {
      try {
        setLoading(true);
        
        // Initialize Stream Chat client
        await initializeStreamChat();

        // Get or create channel for this walk
        const channel = await getOrCreateWalkChannel(walk.id, ownerId, walkerId);
        channelRef.current = channel;

        // Load existing messages
        const { messages: existingMessages } = await channel.query({
          messages: { limit: 50 },
        });

        setMessages(existingMessages || []);

        // Subscribe to new messages
        unsubscribeRef.current = channel.on("message.new", (event) => {
          setMessages((prev) => [...prev, event.message]);
        });

        setActive(true);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initChat();

    // Cleanup timer
    const timer = setTimeout(() => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (channelRef.current) {
        channelRef.current.stopWatching();
      }
      setActive(false);
    
    if (!reviewRequestedRef.current){ 
      requestReview({
      walkId: walk.walkId,
      otherUserName: "other",
      role: "owner",
    });
    reviewRequestedRef.current=true; //ako se refresha
  }
    }, remaining); //ako user koristi aplikaciju u trenutku zavrsetka setnje

    return () => {
      clearTimeout(timer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [walk, ownerId, walkerId]);

  const sendChatMessage = async (text) => {
    if (!text.trim() || !channelRef.current) return;
    
    try {
      await sendMessage(channelRef.current, text);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage: sendChatMessage, active, loading, isVisible, setIsVisible }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
