import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { useReviews } from "../reviews/ReviewsContext";
import { initializeStreamChat, getOrCreateWalkChannel, sendImageMessage, sendMessage } from "../../utils/chatService";


const ChatContext = createContext();

function computeEndTimeMs(rezervacija) {
  const termin = rezervacija?.termin ?? rezervacija?.Termin;
  const start = termin?.datumVrijemePocetka ?? termin?.DatumVrijemePocetka;
  const trajanjeMins = termin?.trajanjeMins ?? termin?.TrajanjeMins;
  if (!start || typeof trajanjeMins !== "number") return null;
  return new Date(start).getTime() + trajanjeMins * 60 * 1000;
}

export function ChatProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(false); // can-send
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [rezervacija, setRezervacija] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [walkerId, setWalkerId] = useState(null);
  const [endTimeMs, setEndTimeMs] = useState(null);
  const [ended, setEnded] = useState(false);

  const channelRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const reviewRequestedRef = useRef(false);
  const { requestReview } = useReviews();

  useEffect(() => {
    // Load the currently accepted booking (rezervacija) for this user.
    const load = async () => {
      if (!user?.userId) {
        setRezervacija(null);
        setOwnerId(null);
        setWalkerId(null);
        setEndTimeMs(null);
        setEnded(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const rezervacije = await api.get(`/calendar/rezervacije/me?status=prihvacena`);
        const now = Date.now();

        const normalized = (rezervacije ?? [])
          .map((r) => {
            const end = computeEndTimeMs(r);
            return { r, end };
          })
          .filter(({ end }) => typeof end === "number");

        // Pick the first not-yet-ended accepted booking; otherwise none.
        const activeBooking = normalized
          .filter(({ end }) => end > now)
          .sort((a, b) => a.end - b.end)[0]?.r;

        setRezervacija(activeBooking ?? null);

        if (!activeBooking) {
          setOwnerId(null);
          setWalkerId(null);
          setEndTimeMs(null);
          setEnded(false);
          setMessages([]);
          setActive(false);
          setLoading(false);
          return;
        }

        const termin = activeBooking.termin ?? activeBooking.Termin;
        const owner = activeBooking.owner ?? activeBooking.Owner;
        const walker = termin?.walker ?? termin?.Walker;

        const oId = owner?.idKorisnik ?? owner?.IdKorisnik;
        const wId = walker?.idKorisnik ?? walker?.IdKorisnik;
        const end = computeEndTimeMs(activeBooking);

        setOwnerId(oId);
        setWalkerId(wId);
        setEndTimeMs(end);
        setEnded(end != null ? Date.now() >= end : false);

        setLoading(false);
      } catch (error) {
        console.error("Error loading rezervacije for chat:", error);
        setLoading(false);
      }
    };

    load();
  }, [user?.userId]);

  useEffect(() => {
    // Initialize Stream + channel once we have an accepted booking and participants.
    const initChat = async () => {
      if (!rezervacija || ownerId == null || walkerId == null || endTimeMs == null) return;

      const now = Date.now();
      if (now >= endTimeMs) {
        setEnded(true);
        setActive(false);
        return;
      }

      try {
        setLoading(true);

        await initializeStreamChat();

        const bookingId = rezervacija.idRezervacija ?? rezervacija.IdRezervacija;
        const channel = await getOrCreateWalkChannel(bookingId, ownerId, walkerId);
        channelRef.current = channel;

        const { messages: existingMessages } = await channel.query({
          messages: { limit: 50 },
        });

        setMessages(existingMessages || []);

        unsubscribeRef.current = channel.on("message.new", (event) => {
          setMessages((prev) => [...prev, event.message]);
        });

        setActive(true);
        setEnded(false);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      unsubscribeRef.current = null;

      if (channelRef.current) {
        channelRef.current.stopWatching();
      }
      channelRef.current = null;
    };
  }, [rezervacija, ownerId, walkerId, endTimeMs]);

  useEffect(() => {
    // Disable chat sending after walk end, but keep chat visible.
    if (!rezervacija || endTimeMs == null) return;

    const remaining = endTimeMs - Date.now();
    if (remaining <= 0) {
      setEnded(true);
      setActive(false);
      return;
    }

    const timer = setTimeout(() => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      unsubscribeRef.current = null;

      if (channelRef.current) channelRef.current.stopWatching();
      setEnded(true);
      setActive(false);

      if (!reviewRequestedRef.current) {
        const status = rezervacija.statusRezervacija ?? rezervacija.StatusRezervacija;
        if (status !== "prihvacena") {
          reviewRequestedRef.current = true;
          return;
        }

        const bookingId = rezervacija.idRezervacija ?? rezervacija.IdRezervacija;

        const termin = rezervacija.termin ?? rezervacija.Termin;
        const walker = termin?.walker ?? termin?.Walker;
        const first = walker?.imeSetac ?? walker?.ImeSetac;
        const last = walker?.prezimeSetac ?? walker?.PrezimeSetac;
        const fullName = `${first ?? ""} ${last ?? ""}`.trim();

        requestReview({
          walkId: bookingId,
          otherUserName: fullName || "šetaca",
          role: "owner",
        });
        reviewRequestedRef.current = true;
      }
    }, remaining);

    return () => clearTimeout(timer);
  }, [rezervacija, endTimeMs, requestReview]);

  const sendChatMessage = async (text) => {
    if (ended) return;
    if (!text.trim() || !channelRef.current) return;
    
    try {
      await sendMessage(channelRef.current, text);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendChatImage = async (file, text = "") => {
    if (ended) return;
    if (!file || !channelRef.current) return;

    try {
      await sendImageMessage(channelRef.current, file, text);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage: sendChatMessage,
        sendImage: sendChatImage,
        active,
        ended,
        loading,
        isVisible,
        setIsVisible,
        rezervacija,
        endTime: endTimeMs != null ? new Date(endTimeMs).toISOString() : null,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
