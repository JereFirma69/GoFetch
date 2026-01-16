import { useEffect } from 'react';

function ChatWidget() {
  useEffect(() => {
    // Load the PopupSmart chat script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://popupsmart.com/freechat.js';
    script.async = true;
    script.onload = () => {
      // Initialize the chat widget after script loads
      if (window.start && window.start.init) {
        window.start.init({
          title: "Spremni za šetnju?",
          message: "Pozdrav!\nUkoliko ti ili tvoj krznati prijatelj imate pitanja, slobodno nam pišite.\nNaš tim stoji Vam na raspolaganju.",
          color: "#000000",
          position: "left",
          placeholder: "Enter your message",
          withText: "Write with",
          viaWhatsapp: "Or write us directly via Whatsapp",
          gty: "Go to your",
          awu: "and write us",
          connect: "Connect now",
          button: "Pitanja?",
          device: "desktop",
          logo: "https://d2r80wdbkwti6l.cloudfront.net/4JsEbdlt153wlYxTKqheuYZ8EsURIPBS.jpg",
          person: "https://d2r80wdbkwti6l.cloudfront.net/EQavnKtKH10OAhZznVwvzSNoJ2LjqUl1.jpg",
          services: [{ name: "mail", content: "hirokul.es@gmail.com" }]
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}

export default ChatWidget;
