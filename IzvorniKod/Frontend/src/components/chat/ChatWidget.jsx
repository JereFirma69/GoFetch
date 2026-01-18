import { useChat } from "./ChatContext";
import ChatTimer from "./ChatTimer";
import {useState} from "react";

export default function ChatWidget({ walk }) {
  const { messages, sendMessage, active } = useChat();
   const [minimized, setMinimized] = useState(false);

  if (!active) return null;

  //minimiziranje chata
  const toggleMinimize = () => setMinimized(!minimized);

  //bubble
  if(minimized){
    return(
         <div
        className="fixed bottom-5 right-5 w-16 h-16 bg-teal-500 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer"
        onClick={toggleMinimize}
      >
        💬
      </div>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 h-[400px] bg-white border border-gray-300 rounded-xl shadow-lg flex flex-col">
      
      {/* header */}
      <div className="px-4 py-2 border-b border-gray-200 bg-teal-100 rounded-t-xl"
           onClick={toggleMinimize}>
        <h3 className="font-semibold text-sm">Chat: vlasnik ↔ šetač</h3>
        <ChatTimer endTime={walk.endTime} />
      </div>

      {/* poruke */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-lg ${
              m.sender === "owner"
                ? "ml-auto bg-teal-500 text-white"
                : "mr-auto bg-gray-200 text-gray-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* input i slanje poruka */}
      <div className="p-2 border-t border-gray-200">
        <input
          type="text"
          placeholder="Upiši poruku..."
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-teal-300"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
