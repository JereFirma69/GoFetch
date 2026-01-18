import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createMockSocket } from "./mockSocket";

const ChatContext = createContext();

export function ChatProvider({ walk, children }) {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!walk) return;

    const endTime = new Date(walk.endTime).getTime();
    const remaining = endTime - Date.now();

    if (remaining <= 0) {
      setActive(false);
      return;
    }

    setActive(true);

    socketRef.current = createMockSocket((msg) =>
      setMessages((m) => [...m, msg])
    );

    const timer = setTimeout(() => {
      socketRef.current?.close();
      setActive(false);
    }, remaining);

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
