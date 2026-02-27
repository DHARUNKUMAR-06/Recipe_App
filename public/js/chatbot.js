async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  const userMessage = input.value;

  if (!userMessage.trim()) return;

  chatBox.innerHTML += `<p><b>You:</b> ${userMessage}</p>`;
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await res.json();
    chatBox.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;
  } catch (error) {
    console.error("Error communicating with chatbot:", error);
    chatBox.innerHTML += `<p><b>Bot:</b> Sorry, I am having trouble connecting to the server.</p>`;
  }
}