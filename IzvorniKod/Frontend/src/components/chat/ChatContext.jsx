import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createMockSocket } from "./mockSocket";
import { useReviews } from "../reviews/ReviewsContext";

const ChatContext = createContext();

export function ChatProvider({ walk, children }) {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(false);
  const socketRef = useRef(null);

  const reviewRequestedRef = useRef(false);
  const { requestReview } = useReviews();

  useEffect(() => {
    if (!walk) return;

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

      return;
    }

    setActive(true);

    socketRef.current = createMockSocket((msg) =>
      setMessages((m) => [...m, msg])
    );

    const timer = setTimeout(() => {
      socketRef.current?.close();
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
      socketRef.current?.close();
    };
  }, [walk]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    socketRef.current?.send(text);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, active }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
