import ChatWidget from "./ChatWidget";
import { ChatProvider } from "./ChatContext";

export default function ChatContainer({ rezervacije }) {
  if (!rezervacije || rezervacije.length === 0) return null;

  return (
    <div
    style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 9999,
      background: "red",
      padding: "10px"
    }}>
      {}
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
