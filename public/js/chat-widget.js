// chat-widget.js
function initChatWidget() {
    // Inject CSS
    const chatStyle = document.createElement('style');
    chatStyle.innerHTML = `
        /* ===== CHAT WIDGET CONTAINER ===== */
        #chat-widget-wrapper {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            pointer-events: none;
        }

        /* ===== MAIN CHAT WINDOW ===== */
        #chat-widget-window {
            width: 320px;
            height: 480px;
            background: var(--surface, #ffffff);
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            border: 1px solid var(--border-color, #d1fae5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
            margin-bottom: 15px;
        }

        #chat-widget-window.chat-widget-open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }

        #chat-widget-header {
            background: linear-gradient(135deg, var(--primary, #10b981), var(--secondary, #84cc16));
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            user-select: none;
            height: 60px;
            box-sizing: border-box;
        }

        .chat-title {
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .chat-title svg, .chat-title img {
            width: 32px;
            height: 32px;
            fill: white;
            object-fit: contain;
        }

        #chat-close-icon {
            cursor: pointer;
            font-size: 1.2rem;
            transition: transform 0.2s ease;
        }

        #chat-close-icon:hover {
            transform: scale(1.2);
        }

        #chat-widget-body {
            display: flex;
            flex-direction: column;
            flex: 1;
            background: var(--surface, #ffffff);
        }

        #chatBox {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: var(--bg-color, #f8fafc);
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        #chatBox p {
            margin: 0;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 0.9rem;
            max-width: 85%;
            line-height: 1.4;
            word-wrap: break-word;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .chat-user {
            align-self: flex-end;
            background: var(--primary, #10b981);
            color: white;
            border-bottom-right-radius: 2px !important;
        }

        .chat-bot {
            align-self: flex-start;
            background: white;
            color: var(--dark, #064e3b);
            border: 1px solid var(--border-color, #d1fae5);
            border-bottom-left-radius: 2px !important;
        }

        .chat-bot.error {
            color: var(--danger, #ef4444);
        }

        #chat-widget-input-area {
            padding: 15px;
            background: white;
            border-top: 1px solid var(--border-color, #d1fae5);
            display: flex;
            gap: 10px;
            box-sizing: border-box;
        }

        #chat-widget-input-area input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid var(--border-color, #d1fae5);
            border-radius: 50px;
            outline: none;
            font-size: 0.9rem;
            min-width: 0;
            color: var(--dark, #064e3b);
            background: var(--surface, #ffffff);
            transition: border-color 0.3s ease;
        }

        #chat-widget-input-area input:focus {
            border-color: var(--primary, #10b981);
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        #chat-widget-input-area button {
            background: var(--primary, #10b981);
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease, transform 0.1s ease;
        }

        #chat-widget-input-area button:hover {
            background: var(--primary-dark, #059669);
            transform: translateY(-1px);
        }

        /* ===== FLOATING ACTION BUTTON (FAB) ===== */
        #chat-widget-fab {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary, #10b981), var(--secondary, #84cc16));
            border-radius: 50%;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            color: white;
            pointer-events: auto;
        }

        #chat-widget-fab:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
        }

        #chat-widget-fab svg, #chat-widget-fab img {
            width: 45px;
            height: 45px;
            fill: white;
            transition: transform 0.3s ease;
            object-fit: contain;
        }

        #chat-widget-fab.chat-widget-fab-active {
            opacity: 0;
            pointer-events: none;
            transform: scale(0.8);
        }
    `;
    document.head.appendChild(chatStyle);

    // Recipe/Food Icon SVG
    const recipeIconSvg = `
        <img src="/images/green_robot_face.png" alt="Robot Icon" />
    `;

    // Create Chat Widget HTML Structure
    const chatWidgetHTML = `
    <div id="chat-widget-wrapper">
        <div id="chat-widget-window">
            <div id="chat-widget-header">
                <span class="chat-title">
                    ${recipeIconSvg}
                    Recipe Assistant
                </span>
                <span id="chat-close-icon" onclick="toggleChatWidget()">✖</span>
            </div>
            <div id="chat-widget-body">
                <div id="chatBox">
                    <p class="chat-bot"><b>Bot:</b> Hello! Ask me about recipes (e.g., chicken, veg, rice).</p>
                </div>
                <div id="chat-widget-input-area">
                    <input type="text" id="userInputWidget" placeholder="Ask something..." onkeypress="handleChatKeyPress(event)" />
                    <button onclick="sendMessageWidget()">Send</button>
                </div>
            </div>
        </div>
        <div id="chat-widget-fab" onclick="toggleChatWidget()">
            ${recipeIconSvg}
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
    initChatWidget();
}

window.toggleChatWidget = function () {
    const chatWindow = document.getElementById('chat-widget-window');
    const fabButton = document.getElementById('chat-widget-fab');

    if (chatWindow.classList.contains('chat-widget-open')) {
        chatWindow.classList.remove('chat-widget-open');
        fabButton.classList.remove('chat-widget-fab-active');
    } else {
        chatWindow.classList.add('chat-widget-open');
        fabButton.classList.add('chat-widget-fab-active');
        document.getElementById('userInputWidget').focus();
    }
}

window.sendMessageWidget = async function () {
    const input = document.getElementById("userInputWidget");
    const chatBox = document.getElementById("chatBox");
    const userMessage = input.value;

    if (!userMessage.trim()) return;

    chatBox.innerHTML += `<p class="chat-user"><b>You:</b> ${userMessage}</p>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await res.json();
        chatBox.innerHTML += `<p class="chat-bot"><b>Bot:</b> ${data.reply}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        if (data.redirect) {
            setTimeout(() => {
                if (data.redirect === "LOGOUT_TRIGGER" && typeof logout === 'function') {
                    logout();
                } else {
                    window.location.href = data.redirect;
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Error communicating with chatbot:", error);
        chatBox.innerHTML += `<p class="chat-bot error"><b>Bot:</b> Sorry, connection error.</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

window.handleChatKeyPress = function (event) {
    if (event.key === 'Enter') {
        sendMessageWidget();
    }
}
