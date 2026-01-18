export function createMockSocket(onMessage) {
  let interval = setInterval(() => {
    onMessage({
      id: crypto.randomUUID(),
      sender: "walker",
      text: "Pas je sretan :)",
      createdAt: new Date().toISOString(),
    });
  }, 20000);
  return {
    send(text) {
      onMessage({
        id: crypto.randomUUID(),
        sender: "owner",
        text,
        createdAt: new Date().toISOString(),
      });
    },
    close() {
      clearInterval(interval);
    },
  };
}
