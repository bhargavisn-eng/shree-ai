// ======================================================
// SHREE AI
// COMPLETE FRONTEND JAVASCRIPT
// ======================================================


// ======================================================
// API CONFIG
// ======================================================

const API_URL = "http://localhost:5000/api/chat";

const IMAGE_API_URL =
    "http://localhost:5000/api/image";

const UPI_INFO_URL =
    "http://localhost:5000/api/payment/upi-info";

const UPI_PAYMENT_URL =
    "http://localhost:5000/api/payment/upi";

const UPI_STATUS_URL =
    "http://localhost:5000/api/payment/status";


// ======================================================
// LOCAL STORAGE
// ======================================================

const HISTORY_KEY = "shree_ai_chat_history";
const SETTINGS_KEY = "shree_ai_settings";
const THEME_KEY = "shree_ai_theme";

const USER_EMAIL_KEY = "shree_ai_user_email";
const PRO_STATUS_KEY = "shree_ai_pro";

// 30 DAY PRO EXPIRY
const PRO_EXPIRES_KEY = "shree_ai_pro_expires";


// ======================================================
// GLOBAL STATE
// ======================================================

let isProUser = false;

let chatHistory = [];

let currentMessages = [];

let usageChart = null;

let proStatusTimer = null;

// 30 DAY PRO EXPIRY
let proExpiresAt = null;


// ======================================================
// DOM ELEMENTS
// ======================================================


// ---------- Main / Sidebar ----------

const main =
    document.getElementById("main");

const sidebar =
    document.getElementById("sidebar");

const menuBtn =
    document.getElementById("menu-btn");

const newChatBtn =
    document.getElementById("new-chat-btn");

const historyBtn =
    document.getElementById("history-btn");

const closeHistoryBtn =
    document.getElementById("close-history");

const clearHistoryBtn =
    document.getElementById("clear-history-btn");

const historyPanel =
    document.getElementById("history-panel");

const historyList =
    document.getElementById("history-list");


// ---------- Chat ----------

const chatContainer =
    document.getElementById("chat-container");

const chat =
    document.getElementById("chat");

const welcome =
    document.getElementById("welcome");

const message =
    document.getElementById("message");

const sendBtn =
    document.getElementById("send-btn");

const voiceBtn =
    document.getElementById("voice-btn");

const imageBtn =
    document.getElementById("generate-image-btn");

const messages =
    document.getElementById("messages");

const typing =
    document.getElementById("typing");

const logo =
    document.getElementById("logo");

const suggestions =
    document.querySelectorAll(".suggestion");


// ======================================================
// PLAN DOM
// ======================================================

const premiumBtn =
    document.getElementById("premium-btn");

const sidebarPremiumBtn =
    document.getElementById("sidebar-premium-btn");

const planText =
    document.getElementById("plan-text");

const sidebarPlanText =
    document.getElementById("sidebar-plan-text");

const proBadge =
    document.getElementById("pro-badge");

const plansModal =
    document.getElementById("plans-modal");

const closePlans =
    document.getElementById("close-plans");

const proBuyBtn =
    document.getElementById("pro-buy-btn");

const freePlanBtn =
    document.getElementById("free-plan-btn");


// ======================================================
// PAYMENT DOM
// ======================================================

const paymentModal =
    document.getElementById("payment-modal");

const closePayment =
    document.getElementById("close-payment");

const upiQR =
    document.getElementById("upi-qr");

const upiID =
    document.getElementById("upi-id");

const copyUpi =
    document.getElementById("copy-upi");

const paymentForm =
    document.getElementById("payment-form");

const paymentMessage =
    document.getElementById("payment-message");

const submitPaymentBtn =
    document.getElementById("submit-payment");


// ======================================================
// CUSTOMIZE DOM
// ======================================================

const customizeBtn =
    document.getElementById("customize-btn");

const customizeModal =
    document.getElementById("customize-modal");

const closeCustomize =
    document.getElementById("close-customize");

const saveCustomize =
    document.getElementById("save-customize");

const personality =
    document.getElementById("personality");

const language =
    document.getElementById("language");

const fontSize =
    document.getElementById("font-size");


// ======================================================
// THEME
// ======================================================

const themeBtn =
    document.getElementById("theme-btn");


// ======================================================
// CHART
// ======================================================

const chartBtn =
    document.getElementById("chart-btn");

const chartModal =
    document.getElementById("chart-modal");

const closeChart =
    document.getElementById("close-chart");


// ======================================================
// HELPER
// ======================================================

function elementExists(element) {

    return (
        element !== null &&
        element !== undefined
    );

}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;

}


// ======================================================
// LOAD SAVED DATA
// ======================================================

function loadSavedData() {


    // --------------------------------------------------
    // HISTORY
    // --------------------------------------------------

    try {

        const savedHistory =
            localStorage.getItem(HISTORY_KEY);


        if (savedHistory) {

            const parsed =
                JSON.parse(savedHistory);


            if (Array.isArray(parsed)) {

                chatHistory = parsed;

            } else {

                chatHistory = [];

            }

        } else {

            chatHistory = [];

        }

    } catch (error) {

        console.error(
            "History loading error:",
            error
        );

        chatHistory = [];

    }


    // --------------------------------------------------
    // SETTINGS
    // --------------------------------------------------

    try {

        const savedSettings =
            localStorage.getItem(
                SETTINGS_KEY
            );


        if (savedSettings) {

            const settings =
                JSON.parse(savedSettings);


            if (
                personality &&
                settings.personality
            ) {

                personality.value =
                    settings.personality;

            }


            if (
                language &&
                settings.language
            ) {

                language.value =
                    settings.language;

            }


            if (
                fontSize &&
                settings.fontSize
            ) {

                fontSize.value =
                    settings.fontSize;


                applyFontSize(
                    settings.fontSize
                );

            }

        }

    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );

    }


    // --------------------------------------------------
    // THEME
    // --------------------------------------------------

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    if (savedTheme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );

    }

}


// ======================================================
// SAVE HISTORY TO LOCAL STORAGE
// ======================================================

function saveHistory() {

    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(chatHistory)
        );

    } catch (error) {

        console.error(
            "Could not save history:",
            error
        );

    }

}


// ======================================================
// SCROLL CHAT
// ======================================================

function scrollChat() {

    if (!chatContainer) {
        return;
    }


    setTimeout(
        function () {

            chatContainer.scrollTop =
                chatContainer.scrollHeight;

        },
        50
    );

}


// ======================================================
// TYPING
// ======================================================

function showTyping() {

    if (!typing) {
        return;
    }

    typing.classList.remove(
        "hidden"
    );

}


function hideTyping() {

    if (!typing) {
        return;
    }

    typing.classList.add(
        "hidden"
    );

}


// ======================================================
// ADD USER MESSAGE
// ======================================================

function addUserMessage(text) {

    if (!messages) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        "message user-message";


    div.textContent =
        text;


    messages.appendChild(div);


    scrollChat();

}


// ======================================================
// ADD AI MESSAGE
// ======================================================

function addAIMessage(text) {

    if (!messages) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        "message ai-message";


    try {

        if (
            typeof marked !== "undefined"
        ) {

            div.innerHTML =
                marked.parse(
                    String(text)
                );

        } else {

            div.textContent =
                text;

        }

    } catch (error) {

        console.error(
            "Markdown error:",
            error
        );

        div.textContent =
            text;

    }


    messages.appendChild(div);


    scrollChat();

}


// ======================================================
// ADD IMAGE MESSAGE
// ======================================================

function addImageMessage(imageData) {

    if (!messages) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        "message ai-message";


    const img =
        document.createElement("img");


    img.src =
        imageData;


    img.alt =
        "Shree AI generated image";


    img.style.maxWidth =
        "100%";


    img.style.borderRadius =
        "12px";


    img.style.display =
        "block";


    div.appendChild(img);


    messages.appendChild(div);


    scrollChat();

}


// ======================================================
// SAVE CURRENT CHAT
// ======================================================

function saveCurrentChat() {

    if (
        !Array.isArray(currentMessages) ||
        currentMessages.length === 0
    ) {

        return;

    }


    const firstUserMessage =
        currentMessages.find(
            function (item) {

                return item.role === "user";

            }
        );


    if (!firstUserMessage) {
        return;
    }


    // --------------------------------------------------
    // Check whether this is the same conversation
    // --------------------------------------------------

    const existingIndex =
        chatHistory.findIndex(
            function (chat) {

                return (
                    JSON.stringify(chat.messages) ===
                    JSON.stringify(currentMessages)
                );

            }
        );


    if (existingIndex !== -1) {

        /*
         If conversation already exists,
         update it instead of creating duplicates.
        */

        chatHistory[existingIndex].messages =
            [...currentMessages];

        chatHistory[existingIndex].date =
            new Date().toLocaleString();

        chatHistory[existingIndex].title =
            String(
                firstUserMessage.content
            ).substring(0, 40);


        saveHistory();

        renderHistory();

        console.log(
            "Chat updated:",
            chatHistory[existingIndex]
        );

        return;

    }


    // --------------------------------------------------
    // Create new chat
    // --------------------------------------------------

    const newChat = {

        id: Date.now(),

        title:
            String(
                firstUserMessage.content
            ).substring(0, 40),

        messages:
            [...currentMessages],

        date:
            new Date().toLocaleString()

    };


    chatHistory.unshift(
        newChat
    );


    // Keep only latest 50
    if (chatHistory.length > 50) {

        chatHistory =
            chatHistory.slice(0, 50);

    }


    saveHistory();

    renderHistory();


    console.log(
        "Chat saved:",
        newChat
    );

}


// ======================================================
// RENDER HISTORY
// ======================================================

function renderHistory() {

    if (!historyList) {

        console.error(
            "history-list element not found"
        );

        return;

    }


    historyList.innerHTML = "";


    if (
        !Array.isArray(chatHistory) ||
        chatHistory.length === 0
    ) {

        historyList.innerHTML = `
            <div class="empty-history">
                🕘 No saved chats yet.
            </div>
        `;

        return;

    }


    chatHistory.forEach(
        function (savedChat, index) {

            const item =
                document.createElement("div");


            item.className =
                "history-item";


            item.innerHTML = `

                <div class="history-item-title">

                    💬
                    ${escapeHTML(
                        savedChat.title ||
                        "New Chat"
                    )}

                </div>

                <div class="history-item-date">

                    ${escapeHTML(
                        savedChat.date ||
                        ""
                    )}

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    loadChat(index);

                }
            );


            historyList.appendChild(
                item
            );

        }
    );

}


// ======================================================
// LOAD CHAT
// ======================================================

function loadChat(index) {

    const savedChat =
        chatHistory[index];


    if (!savedChat) {

        console.error(
            "Chat not found:",
            index
        );

        return;

    }


    // Restore conversation
    currentMessages =
        Array.isArray(
            savedChat.messages
        )
            ? [...savedChat.messages]
            : [];


    // Clear current screen
    if (messages) {

        messages.innerHTML = "";

    }


    // Hide welcome
    if (welcome) {

        welcome.style.display =
            "none";

    }


    // Restore every message
    currentMessages.forEach(
        function (item) {

            if (
                item.role === "user"
            ) {

                addUserMessage(
                    item.content
                );

            } else if (
                item.role === "assistant"
            ) {

                addAIMessage(
                    item.content
                );

            }

        }
    );


    // Close history panel
    closeHistoryPanel();


    scrollChat();


    console.log(
        "Loaded chat:",
        savedChat.title
    );

}


// ======================================================
// OPEN HISTORY
// ======================================================

function openHistory() {

    console.log(
        "Opening Chat History..."
    );


    // Always refresh list before opening
    renderHistory();


    if (!historyPanel) {

        console.error(
            "history-panel element not found"
        );

        return;

    }


    historyPanel.classList.add(
        "open"
    );

}


// ======================================================
// CLOSE HISTORY
// ======================================================

function closeHistoryPanel() {

    if (!historyPanel) {
        return;
    }


    historyPanel.classList.remove(
        "open"
    );

}


// ======================================================
// HISTORY BUTTON
// ======================================================

if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            openHistory();

        }
    );

}


// ======================================================
// CLOSE HISTORY BUTTON
// ======================================================

if (closeHistoryBtn) {

    closeHistoryBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            closeHistoryPanel();

        }
    );

}


// ======================================================
// CLEAR HISTORY
// ======================================================

if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener(
        "click",
        function () {

            if (
                !Array.isArray(chatHistory) ||
                chatHistory.length === 0
            ) {

                alert(
                    "There are no saved chats."
                );

                return;

            }


            const answer =
                confirm(
                    "Are you sure you want to clear all chat history?"
                );


            if (!answer) {
                return;
            }


            chatHistory = [];

            currentMessages = [];


            localStorage.removeItem(
                HISTORY_KEY
            );


            renderHistory();


            if (messages) {

                messages.innerHTML = "";

            }


            if (welcome) {

                welcome.style.display =
                    "flex";

            }


            if (logo) {

                logo.style.opacity =
                    "100%";

            }


            alert(
                "Chat history cleared."
            );

        }
    );

}


// ======================================================
// NEW CHAT
// ======================================================

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function () {

            currentMessages = [];


            if (messages) {

                messages.innerHTML = "";

            }


            if (welcome) {

                welcome.style.display =
                    "flex";

            }


            if (logo) {

                logo.style.opacity =
                    "100%";

            }


            if (message) {

                message.value = "";

                message.style.height =
                    "auto";

                message.focus();

            }


            closeHistoryPanel();


            console.log(
                "New chat started."
            );

        }
    );

}


// ======================================================
// SEND CHAT MESSAGE
// ======================================================

async function sendMessage() {

    if (!message) {
        return;
    }


    const text =
        message.value.trim();


    if (!text) {
        return;
    }


    // Show welcome off
    if (welcome) {

        welcome.style.display =
            "none";

    }


    if (logo) {

        logo.style.opacity =
            "0%";

    }


    // Show user message
    addUserMessage(text);


    // Store message
    currentMessages.push({

        role: "user",

        content: text

    });


    // Clear input
    message.value = "";

    message.style.height =
        "auto";


    showTyping();


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        message: text,

                        history:
                            currentMessages,

                        settings:
                            getSettings(),

                        pro:
                            isProUser

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Chat request failed"
            );

        }


        const reply =
            data.reply ||
            "Sorry, I couldn't generate a response.";


        currentMessages.push({

            role: "assistant",

            content: reply

        });


        hideTyping();


        addAIMessage(
            reply
        );


        // IMPORTANT
        // Save conversation after AI reply
        saveCurrentChat();


    } catch (error) {

        hideTyping();


        console.error(
            "Chat error:",
            error
        );


        addAIMessage(
            "❌ Chat error: " +
            error.message
        );

    }

}


// ======================================================
// SEND BUTTON
// ======================================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// ======================================================
// ENTER TO SEND
// ======================================================

if (message) {

    message.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    message.addEventListener(
        "input",
        function () {

            this.style.height =
                "auto";


            this.style.height =
                Math.min(
                    this.scrollHeight,
                    160
                ) + "px";

        }
    );

}


// ======================================================
// SUGGESTIONS
// ======================================================

suggestions.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                if (!message) {
                    return;
                }


                message.value =
                    this.textContent.trim();


                message.focus();


                sendMessage();

            }
        );

    }
);


// ======================================================
// MENU BUTTON
// ======================================================

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (!sidebar) {
                return;
            }


            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// ======================================================
// VOICE INPUT
// ======================================================

if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        function () {

            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;


            if (!SpeechRecognition) {

                alert(
                    "Voice input is not supported in this browser."
                );

                return;

            }


            const recognition =
                new SpeechRecognition();


            recognition.lang =
                "en-IN";


            recognition.interimResults =
                false;


            recognition.continuous =
                false;


            recognition.onstart =
                function () {

                    voiceBtn.textContent =
                        "🔴";

                };


            recognition.onend =
                function () {

                    voiceBtn.textContent =
                        "🎤";

                };


            recognition.onresult =
                function (event) {

                    const result =
                        event.results[0][0]
                            .transcript;


                    if (message) {

                        message.value =
                            result;

                        message.focus();

                    }

                };


            recognition.onerror =
                function (error) {

                    console.error(
                        "Voice error:",
                        error
                    );

                    voiceBtn.textContent =
                        "🎤";

                };


            recognition.start();

        }
    );

}


// ======================================================
// IMAGE GENERATION
// ======================================================

if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        generateImage
    );

}


async function generateImage() {

    if (!message) {
        return;
    }


    const prompt =
        message.value.trim();


    if (!prompt) {

        alert(
            "Describe the image you want first."
        );

        message.focus();

        return;

    }


    if (welcome) {

        welcome.style.display =
            "none";

    }


    addUserMessage(
        "🖼️ Generate: " +
        prompt
    );


    currentMessages.push({

        role: "user",

        content:
            "[Image generation] " +
            prompt

    });


    message.value = "";

    message.style.height =
        "auto";


    showTyping();


    try {

        const response =
            await fetch(
                IMAGE_API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        prompt: prompt

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Image generation failed"
            );

        }


        hideTyping();


        if (data.image) {

            addImageMessage(
                data.image
            );


            currentMessages.push({

                role: "assistant",

                content:
                    "[Generated image]"

            });


        } else if (data.url) {

            addImageMessage(
                data.url
            );


            currentMessages.push({

                role: "assistant",

                content:
                    "[Generated image]"

            });


        } else {

            addAIMessage(
                "❌ Image was not returned by the server."
            );

        }


        saveCurrentChat();


    } catch (error) {

        hideTyping();


        console.error(
            "Image error:",
            error
        );


        addAIMessage(
            "❌ Image error: " +
            error.message
        );

    }

}


// ======================================================
// SETTINGS
// ======================================================

function getSettings() {

    return {

        personality:
            personality
                ? personality.value
                : "friendly",

        language:
            language
                ? language.value
                : "English",

        fontSize:
            fontSize
                ? fontSize.value
                : "16"

    };

}


function applyFontSize(size) {

    document.documentElement.style.setProperty(
        "--chat-font-size",
        String(size) + "px"
    );

}


// ======================================================
// CUSTOMIZE
// ======================================================

if (customizeBtn) {

    customizeBtn.addEventListener(
        "click",
        function () {

            if (!customizeModal) {
                return;
            }


            customizeModal.classList.remove(
                "hidden"
            );

        }
    );

}


if (closeCustomize) {

    closeCustomize.addEventListener(
        "click",
        function () {

            if (customizeModal) {

                customizeModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


if (saveCustomize) {

    saveCustomize.addEventListener(
        "click",
        function () {

            const settings =
                getSettings();


            localStorage.setItem(
                SETTINGS_KEY,
                JSON.stringify(settings)
            );


            applyFontSize(
                settings.fontSize
            );


            if (customizeModal) {

                customizeModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ======================================================
// THEME
// ======================================================

if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-theme"
            );


            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );


            localStorage.setItem(
                THEME_KEY,
                isLight
                    ? "light"
                    : "dark"
            );

        }
    );

}


// ======================================================
// OPEN PLANS
// ======================================================

function openPlans() {

    if (!plansModal) {
        return;
    }


    plansModal.classList.remove(
        "hidden"
    );

}


if (premiumBtn) {

    premiumBtn.addEventListener(
        "click",
        openPlans
    );

}


if (sidebarPremiumBtn) {

    sidebarPremiumBtn.addEventListener(
        "click",
        openPlans
    );

}


// ======================================================
// CLOSE PLANS
// ======================================================

if (closePlans) {

    closePlans.addEventListener(
        "click",
        function () {

            if (plansModal) {

                plansModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ======================================================
// OPEN PRO PAYMENT
// ======================================================

if (proBuyBtn) {

    proBuyBtn.addEventListener(
        "click",
        async function () {

            if (isProUser) {

                alert(
                    "👑 You are already a Pro user."
                );

                return;

            }


            if (plansModal) {

                plansModal.classList.add(
                    "hidden"
                );

            }


            if (paymentModal) {

                paymentModal.classList.remove(
                    "hidden"
                );

            }


            if (paymentMessage) {

                paymentMessage.textContent =
                    "";

            }


            await loadUpiInfo();

        }
    );

}


// ======================================================
// CLOSE PAYMENT
// ======================================================

if (closePayment) {

    closePayment.addEventListener(
        "click",
        function () {

            if (paymentModal) {

                paymentModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ======================================================
// LOAD UPI INFO
// ======================================================

async function loadUpiInfo() {

    try {

        const response =
            await fetch(
                UPI_INFO_URL
            );


        const data =
            await response.json();


        console.log(
            "UPI information:",
            data
        );


        if (upiQR) {

            if (data.qr) {

                upiQR.src =
                    data.qr;

            } else if (
                data.qrCode
            ) {

                upiQR.src =
                    data.qrCode;

            }

        }


        if (upiID) {

            if (data.upiId) {

                upiID.textContent =
                    data.upiId;

            } else if (
                data.upi
            ) {

                upiID.textContent =
                    data.upi;

            }

        }


    } catch (error) {

        console.error(
            "UPI info error:",
            error
        );


        if (upiID) {

            upiID.textContent =
                "Unable to load UPI ID";

        }

    }

}


// ======================================================
// COPY UPI
// ======================================================

if (copyUpi) {

    copyUpi.addEventListener(
        "click",
        async function () {

            const id =
                upiID
                    ? upiID.textContent.trim()
                    : "";


            if (
                !id ||
                id === "Loading..."
            ) {

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    id
                );


                copyUpi.textContent =
                    "Copied!";


                setTimeout(
                    function () {

                        copyUpi.textContent =
                            "Copy";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Clipboard error:",
                    error
                );


                alert(
                    "Could not copy the UPI ID."
                );

            }

        }
    );

}


// ======================================================
// PAYMENT FORM
// ======================================================

if (paymentForm) {

    paymentForm.addEventListener(
        "submit",
        submitPayment
    );

}


async function submitPayment(event) {

    event.preventDefault();


    const nameInput =
        document.getElementById(
            "payment-name"
        );

    const emailInput =
        document.getElementById(
            "payment-email"
        );

    const transactionInput =
        document.getElementById(
            "transaction-id"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const email =
        emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";


    const transactionId =
        transactionInput
            ? transactionInput.value.trim()
            : "";


    if (
        !name ||
        !email ||
        !transactionId
    ) {

        if (paymentMessage) {

            paymentMessage.textContent =
                "❌ Please fill all payment details.";

        }

        return;

    }


    try {

        if (submitPaymentBtn) {

            submitPaymentBtn.disabled =
                true;

            submitPaymentBtn.textContent =
                "Submitting...";

        }


        const response =
            await fetch(
                UPI_PAYMENT_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        transactionId:
                            transactionId,

                        plan: "Pro",

                        amount: 199

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Payment response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.error ||
                "Payment submission failed"
            );

        }


        // Save email
        localStorage.setItem(
            USER_EMAIL_KEY,
            email
        );


        // Payment is pending
        isProUser = false;


        localStorage.setItem(
            PRO_STATUS_KEY,
            "false"
        );


        // Clear old expiry
        localStorage.removeItem(
            PRO_EXPIRES_KEY
        );


        proExpiresAt = null;


        setFreeUI();


        if (paymentMessage) {

            paymentMessage.textContent =
                "✅ Payment details submitted. " +
                "Please wait for admin verification.";

        }


        if (submitPaymentBtn) {

            submitPaymentBtn.textContent =
                "Submitted ✓";

        }


        // Start checking automatically
        startProStatusPolling();


        await checkProStatus();


        setTimeout(
            function () {

                if (paymentModal) {

                    paymentModal.classList.add(
                        "hidden"
                    );

                }

            },
            2500
        );


    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        if (paymentMessage) {

            paymentMessage.textContent =
                "❌ " +
                error.message;

        }


        if (submitPaymentBtn) {

            submitPaymentBtn.disabled =
                false;

            submitPaymentBtn.textContent =
                "Submit Payment Details";

        }

    }

}


// ======================================================
// SET PRO UI
// ======================================================

function setProUI(expiresAt) {

    isProUser = true;


    proExpiresAt =
        expiresAt ||
        localStorage.getItem(
            PRO_EXPIRES_KEY
        );


    if (proExpiresAt) {

        localStorage.setItem(
            PRO_EXPIRES_KEY,
            proExpiresAt
        );

    }


    document.body.classList.add(
        "pro-user"
    );


    if (planText) {

        planText.textContent =
            "Pro Plan";

    }


    if (sidebarPlanText) {

        sidebarPlanText.textContent =
            "Pro Active";

    }


    if (premiumBtn) {

        premiumBtn.classList.add(
            "pro-active"
        );

    }


    if (sidebarPremiumBtn) {

        sidebarPremiumBtn.classList.add(
            "pro-active"
        );

    }


    if (proBadge) {

        proBadge.classList.remove(
            "hidden"
        );


        if (proExpiresAt) {

            const expiryDate =
                new Date(
                    proExpiresAt
                );


            if (!isNaN(expiryDate.getTime())) {

                proBadge.textContent =
                    "⭐ Pro • Expires " +
                    expiryDate.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

            } else {

                proBadge.textContent =
                    "⭐ Pro Active";

            }

        } else {

            proBadge.textContent =
                "⭐ Pro Active";

        }

    }


    if (proBuyBtn) {

        proBuyBtn.disabled =
            true;

        proBuyBtn.textContent =
            "✓ Pro Active";

    }


    if (freePlanBtn) {

        freePlanBtn.textContent =
            "Free Plan";

    }


    console.log(
        "👑 Shree AI: PRO PLAN"
    );


    console.log(
        "Pro expires:",
        proExpiresAt
    );

}


// ======================================================
// CHECK PRO STATUS
// ======================================================

async function checkProStatus() {

    const email =
        localStorage.getItem(
            USER_EMAIL_KEY
        );


    // No email = Free
    if (!email) {

        isProUser = false;

        proExpiresAt = null;

        localStorage.removeItem(
            PRO_EXPIRES_KEY
        );

        setFreeUI();

        return false;

    }


    console.log(
        "Checking Pro status for:",
        email
    );


    try {

        const response =
            await fetch(
                `${UPI_STATUS_URL}?email=${encodeURIComponent(
                    email
                )}&t=${Date.now()}`
            );


        const data =
            await response.json();


        console.log(
            "Backend Pro status:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not check Pro status"
            );

        }


        // ==================================================
        // BACKEND VERIFIED + NOT EXPIRED
        // ==================================================

        const verified =
            data.success === true &&
            data.pro === true &&
            data.status === "verified";


        if (verified) {

            const expiresAt =
                data.expiresAt ||
                data.payment?.expiresAt ||
                null;


            // ----------------------------------------------
            // Check expiry date on frontend too
            // ----------------------------------------------

            if (expiresAt) {

                const expiryTime =
                    new Date(
                        expiresAt
                    ).getTime();


                const now =
                    Date.now();


                if (
                    !isNaN(expiryTime) &&
                    now >= expiryTime
                ) {

                    isProUser = false;

                    proExpiresAt = null;


                    localStorage.setItem(
                        PRO_STATUS_KEY,
                        "false"
                    );


                    localStorage.removeItem(
                        PRO_EXPIRES_KEY
                    );


                    setFreeUI();


                    console.log(
                        "⏰ Pro subscription expired."
                    );


                    return false;

                }

            }


            isProUser = true;


            localStorage.setItem(
                PRO_STATUS_KEY,
                "true"
            );


            if (expiresAt) {

                localStorage.setItem(
                    PRO_EXPIRES_KEY,
                    expiresAt
                );

            }


            setProUI(
                expiresAt
            );


            // DO NOT STOP POLLING
            // Polling must continue so expiry
            // can be detected automatically.

            return true;

        }


        // ==================================================
        // BACKEND SAYS EXPIRED
        // ==================================================

        if (
            data.status === "expired"
        ) {

            isProUser = false;

            proExpiresAt = null;


            localStorage.setItem(
                PRO_STATUS_KEY,
                "false"
            );


            localStorage.removeItem(
                PRO_EXPIRES_KEY
            );


            setFreeUI();


            console.log(
                "⏰ Pro subscription expired."
            );


            return false;

        }


        // ==================================================
        // STILL PENDING / NOT VERIFIED
        // ==================================================

        isProUser = false;

        proExpiresAt = null;


        localStorage.setItem(
            PRO_STATUS_KEY,
            "false"
        );


        localStorage.removeItem(
            PRO_EXPIRES_KEY
        );


        setFreeUI();


        return false;


    } catch (error) {

        console.error(
            "Pro status check failed:",
            error
        );


        /*
         If backend is temporarily unavailable,
         keep already-cached Pro UI ONLY when
         the cached expiry date is still valid.
        */


        const cachedPro =
            localStorage.getItem(
                PRO_STATUS_KEY
            );


        const cachedExpiry =
            localStorage.getItem(
                PRO_EXPIRES_KEY
            );


        if (
            cachedPro === "true" &&
            cachedExpiry
        ) {

            const expiryTime =
                new Date(
                    cachedExpiry
                ).getTime();


            if (
                !isNaN(expiryTime) &&
                Date.now() < expiryTime
            ) {

                isProUser = true;

                proExpiresAt =
                    cachedExpiry;


                setProUI(
                    cachedExpiry
                );


                return true;

            }

        }


        // No valid cached Pro subscription
        isProUser = false;

        proExpiresAt = null;


        localStorage.setItem(
            PRO_STATUS_KEY,
            "false"
        );


        localStorage.removeItem(
            PRO_EXPIRES_KEY
        );


        setFreeUI();


        return false;

    }

}


// ======================================================
// AUTOMATIC PRO STATUS CHECK
// ======================================================

function startProStatusPolling() {

    stopProStatusPolling();


    const email =
        localStorage.getItem(
            USER_EMAIL_KEY
        );


    if (!email) {
        return;
    }


    proStatusTimer =
        setInterval(
            async function () {

                console.log(
                    "🔄 Checking Pro verification / expiry..."
                );


                const wasPro =
                    isProUser;


                const verified =
                    await checkProStatus();


                // Newly activated
                if (
                    verified &&
                    !wasPro
                ) {

                    alert(
                        "👑 Your Shree AI Pro has been activated!"
                    );

                }


                // Expired while user was using app
                if (
                    wasPro &&
                    !verified
                ) {

                    alert(
                        "⏰ Your Shree AI Pro subscription has expired."
                    );

                }

            },
            10000
        );

}


function stopProStatusPolling() {

    if (proStatusTimer) {

        clearInterval(
            proStatusTimer
        );

        proStatusTimer = null;

    }

}


// ======================================================
// FREE UI
// ======================================================

function setFreeUI() {

    isProUser = false;

    proExpiresAt = null;


    document.body.classList.remove(
        "pro-user"
    );


    if (planText) {

        planText.textContent =
            "Free Plan";

    }


    if (sidebarPlanText) {

        sidebarPlanText.textContent =
            "Premium";

    }


    if (premiumBtn) {

        premiumBtn.classList.remove(
            "pro-active"
        );

    }


    if (sidebarPremiumBtn) {

        sidebarPremiumBtn.classList.remove(
            "pro-active"
        );

    }


    if (proBadge) {

        proBadge.classList.add(
            "hidden"
        );

    }


    if (proBuyBtn) {

        proBuyBtn.disabled =
            false;

        proBuyBtn.textContent =
            "Pay ₹199 with UPI";

    }


    if (freePlanBtn) {

        freePlanBtn.textContent =
            "Current Plan";

    }


    console.log(
        "👤 Shree AI: FREE PLAN"
    );

}


// ======================================================
// CHART
// ======================================================

if (chartBtn) {

    chartBtn.addEventListener(
        "click",
        function () {

            if (!chartModal) {
                return;
            }


            chartModal.classList.remove(
                "hidden"
            );


            createUsageChart();

        }
    );

}


if (closeChart) {

    closeChart.addEventListener(
        "click",
        function () {

            if (chartModal) {

                chartModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


function createUsageChart() {

    const canvas =
        document.getElementById(
            "usage-chart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;

    }


    if (usageChart) {

        usageChart.destroy();

    }


    usageChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Saved Chats"
                    ],

                    datasets: [

                        {

                            label:
                                "Chats",

                            data: [
                                chatHistory.length
                            ]

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


// ======================================================
// BACKDROP CLOSE
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target === plansModal
        ) {

            plansModal.classList.add(
                "hidden"
            );

        }


        if (
            event.target === paymentModal
        ) {

            paymentModal.classList.add(
                "hidden"
            );

        }


        if (
            event.target === customizeModal
        ) {

            customizeModal.classList.add(
                "hidden"
            );

        }


        if (
            event.target === chartModal
        ) {

            chartModal.classList.add(
                "hidden"
            );

        }

    }
);


// ======================================================
// ESCAPE KEY CLOSE
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        if (
            plansModal &&
            !plansModal.classList.contains("hidden")
        ) {

            plansModal.classList.add(
                "hidden"
            );

        }


        if (
            paymentModal &&
            !paymentModal.classList.contains("hidden")
        ) {

            paymentModal.classList.add(
                "hidden"
            );

        }


        if (
            customizeModal &&
            !customizeModal.classList.contains("hidden")
        ) {

            customizeModal.classList.add(
                "hidden"
            );

        }


        if (
            chartModal &&
            !chartModal.classList.contains("hidden")
        ) {

            chartModal.classList.add(
                "hidden"
            );

        }


        closeHistoryPanel();

    }
);


// ======================================================
// CLOSE SIDEBAR WHEN CLICKING MAIN
// ======================================================

if (main) {

    main.addEventListener(
        "click",
        function () {

            if (
                window.innerWidth <= 900 &&
                sidebar
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );

}


// ======================================================
// INITIALIZE SHREE AI
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "======================================"
        );

        console.log(
            "🤖 Shree AI Loading..."
        );

        console.log(
            "======================================"
        );


        // 1. Load local data
        loadSavedData();


        // 2. Render history immediately
        renderHistory();


        // 3. Check Pro status
        await checkProStatus();


        // 4. Always keep checking Pro status
        //    so activation AND expiry are detected
        startProStatusPolling();


        console.log(
            "======================================"
        );

        console.log(
            "🚀 Shree AI Ready"
        );

        console.log(
            "Pro user:",
            isProUser
        );

        console.log(
            "Pro expires:",
            proExpiresAt
        );

        console.log(
            "Saved chats:",
            chatHistory.length
        );

        console.log(
            "======================================"
        );

    }
);


// ======================================================
// FORCE HISTORY BUTTON
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    const historyButton =
        document.getElementById("history-btn");

    const historyPanelElement =
        document.getElementById("history-panel");

    const historyCloseButton =
        document.getElementById("close-history");

    const historyListElement =
        document.getElementById("history-list");


    console.log("History button:", historyButton);
    console.log("History panel:", historyPanelElement);
    console.log("History list:", historyListElement);


    // ------------------------------------------
    // OPEN HISTORY
    // ------------------------------------------

    if (historyButton) {

        historyButton.onclick = function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("🕘 HISTORY BUTTON CLICKED");

            // Refresh history
            try {

                const saved =
                    localStorage.getItem(
                        "shree_ai_chat_history"
                    );

                const history =
                    saved
                        ? JSON.parse(saved)
                        : [];


                historyListElement.innerHTML = "";


                if (
                    !Array.isArray(history) ||
                    history.length === 0
                ) {

                    historyListElement.innerHTML = `
                        <div class="empty-history">
                            🕘 No saved chats yet.
                        </div>
                    `;

                } else {

                    history.forEach(
                        function (item, index) {

                            const div =
                                document.createElement("div");

                            div.className =
                                "history-item";


                            div.innerHTML = `
                                <strong>
                                    💬 ${escapeHTML(
                                        item.title ||
                                        "New Chat"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        item.date || ""
                                    )}
                                </small>
                            `;


                            div.onclick =
                                function () {

                                    loadChat(index);

                                    historyPanelElement.classList.remove(
                                        "open"
                                    );

                                };


                            historyListElement.appendChild(
                                div
                            );

                        }
                    );

                }


                // OPEN PANEL
                historyPanelElement.classList.add(
                    "open"
                );


                // Force visible
                historyPanelElement.style.display =
                    "block";


                historyPanelElement.style.transform =
                    "translateX(0)";


                console.log(
                    "✅ History panel opened"
                );

            } catch (error) {

                console.error(
                    "History error:",
                    error
                );

            }

        };

    } else {

        console.error(
            "❌ history-btn NOT FOUND"
        );

    }


    // ------------------------------------------
    // CLOSE HISTORY
    // ------------------------------------------

    if (historyCloseButton) {

        historyCloseButton.onclick =
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                historyPanelElement.classList.remove(
                    "open"
                );

                historyPanelElement.style.transform =
                    "translateX(-100%)";

            };

    }

});