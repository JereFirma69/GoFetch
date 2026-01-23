import { useChat } from "./ChatContext";
import ChatTimer from "./ChatTimer";
import {useState} from "react";

export default function ChatWidget({ walk, currentUserId }) {
  const { messages, sendMessage, active, loading, isVisible } = useChat();
  const [minimized, setMinimized] = useState(false);

  if (!isVisible || (walk && !active) || loading) return null;

  //minimiziranje chata
  const toggleMinimize = () => setMinimized(!minimized);

  //bubble
  if(minimized){
    return(
      <div
        className="fixed bottom-5 right-5 w-16 h-16 bg-teal-500 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:bg-teal-600 transition"
        onClick={toggleMinimize}
      >
        💬
      </div>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 h-[400px] bg-white border border-gray-300 rounded-xl shadow-lg flex flex-col">
      
      {/* header */}
      <div className="px-4 py-2 border-b border-gray-200 bg-teal-100 rounded-t-xl cursor-pointer hover:bg-teal-200 transition"
           onClick={toggleMinimize}>
        <h3 className="font-semibold text-sm">Chat: vlasnik ↔ šetač</h3>
        <ChatTimer endTime={walk.endTime} />
      </div>

      {/* poruke */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            Nema poruka. Započni razgovor!
          </div>
        ) : (
          messages.map((m) => {
            // Determine if message is from current user
            const isCurrentUser = m.user?.id === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] px-3 py-2 rounded-lg ${
                  isCurrentUser
                    ? "ml-auto bg-teal-500 text-white rounded-br-none"
                    : "mr-auto bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{m.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(m.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
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
