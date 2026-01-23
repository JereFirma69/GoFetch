import { useChat } from "./ChatContext";
import ChatTimer from "./ChatTimer";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function ChatWidget() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.userId;

  const { messages, sendMessage, sendImage, loading, isVisible, rezervacija, endTime, ended } = useChat();
  const [minimized, setMinimized] = useState(false);
  const fileInputRef = useRef(null);

  if (!isVisible || loading || !rezervacija) return null;

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
        {endTime ? <ChatTimer endTime={endTime} /> : null}
        {ended ? <div className="text-xs text-gray-500">Chat je arhiviran (slanje onemogućeno).</div> : null}
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
            const isCurrentUser = String(m.user?.id) === String(currentUserId);
            return (
              <div
                key={m.id}
                className={`max-w-[75%] px-3 py-2 rounded-lg ${
                  isCurrentUser
                    ? "ml-auto bg-teal-500 text-white rounded-br-none"
                    : "mr-auto bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {m.text ? <p>{m.text}</p> : null}

                {(m.attachments ?? []).map((a, idx) => {
                  if (a.type === "image" && (a.image_url || a.thumb_url)) {
                    const src = a.image_url || a.thumb_url;
                    return (
                      <img
                        key={`${m.id}-att-${idx}`}
                        src={src}
                        alt="attachment"
                        className="mt-2 rounded-md max-h-40 object-cover"
                      />
                    );
                  }
                  return null;
                })}
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
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className={`px-2 py-2 rounded-lg border text-sm ${ended ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
            disabled={ended}
            onClick={() => fileInputRef.current?.click()}
            title="Pošalji fotografiju"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              await sendImage(file);
            }}
          />

          <input
            type="text"
            placeholder={ended ? "Chat je arhiviran" : "Upiši poruku..."}
            disabled={ended}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring focus:ring-teal-300 ${ended ? "bg-gray-50 text-gray-400" : ""}`}
            onKeyDown={(e) => {
              if (ended) return;
              if (e.key === "Enter") {
                sendMessage(e.target.value);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
