import ChatWidget from "./ChatWidget";
import { ChatProvider } from "./ChatContext";

export default function ChatContainer({ rezervacije }) {
  if (!rezervacije || rezervacije.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Scroll wrapper */}
      <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1">
        {rezervacije.map((rez) => (
          <ChatProvider
            key={rez.idRezervacija ?? rez.IdRezervacija}
            rezervacija={rez}
          >
            <ChatWidget />
          </ChatProvider>
        ))}
      </div>
    </div>
  );
}
