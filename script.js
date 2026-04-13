const GEMINI_API_KEY = "AIzaSyBmZRQtzPR4Kr1ol6LZ_abVUgkNNFmZCus";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + GEMINI_API_KEY;

let chats = [[]];
let currentChatIndex = 0;
let filePreviewMsg = null;
let isRegister = false;

async function fetchGeminiResponse(parts) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: parts
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "AI không trả lời.";
        }

    } catch (error) {
        console.error("Lỗi API:", error);
        return "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI.";
    }
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const fileInput = document.getElementById("fileInput");
    const chatBox = document.getElementById("chatBox");

    const text = input.value.trim();
    const file = fileInput.files[0];

    if (text === "" && !file) return;

    if (filePreviewMsg) {
        filePreviewMsg.remove();
        filePreviewMsg = null;
    }

    let fileData = null;
    if (file) {
        fileData = await readFileAsBase64(file);
    }

    chats[currentChatIndex].push({ role: "user", text, file: fileData ? { mimeType: file.type, data: fileData } : null });
    input.value = "";
    fileInput.value = "";
    document.getElementById('filePreview').style.display = 'none';
    renderChat();

    createMessageBurst();

    const loadingId = "loading-" + Date.now();
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot";
    loadingDiv.id = loadingId;
    loadingDiv.innerText = "Đang suy nghĩ...";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const parts = [];
    if (text) parts.push({ text });
    if (fileData) parts.push({ inlineData: { mimeType: file.type, data: fileData } });

    const botResponse = await fetchGeminiResponse(parts);

    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) loadingElement.remove();

    chats[currentChatIndex].push({
        role: "bot",
        text: botResponse,
        file: null
    });

    renderChatWithTyping(botResponse);
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data: prefix
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderChat() {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    chats[currentChatIndex].forEach(msg => {
        const div = document.createElement("div");
        div.className = "message " + msg.role;

        if (msg.file) {
            if (msg.file.mimeType.startsWith('image/')) {
                const img = document.createElement("img");
                img.src = `data:${msg.file.mimeType};base64,${msg.file.data}`;
                img.style.maxWidth = "100%";
                img.style.borderRadius = "10px";
                div.appendChild(img);
            } else {
                const link = document.createElement("a");
                link.href = `data:${msg.file.mimeType};base64,${msg.file.data}`;
                link.download = "uploaded_file";
                link.innerText = "📎 Tệp tin đã tải lên";
                link.style.color = "#00d4ff";
                div.appendChild(link);
            }
        }

        if (msg.text) {
            const textDiv = document.createElement("div");
            textDiv.innerHTML = marked.parse(msg.text);
            div.appendChild(textDiv);
        }

        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderChatWithTyping(botText) {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = "message bot";
    chatBox.appendChild(div);

    let index = 0;
    const typingSpeed = 50; // ms per character

    function typeWriter() {
        if (index < botText.length) {
            div.innerText += botText.charAt(index);
            index++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(typeWriter, typingSpeed);
        } else {
            // After typing, render Markdown
            div.innerHTML = marked.parse(botText);
        }
    }

    typeWriter();
}

function playFXEnter() {
    try {
        const fx = new Audio("../Music/FX.Enter.mp3");
        fx.volume = 0.1;
        fx.play();
    } catch (e) {
        console.warn("Không thể phát FX.Enter.mp3", e);
    }
}
function playFXSend() {
    try {
        const fx = new Audio("../Music/FX.Send.mp3");
        fx.volume = 0.2;
        fx.play();
    } catch (e) {
        console.warn("Không thể phát FX.Send.mp3", e);
    }
}

async function sendMessage() {
    playFXSend();
    const input = document.getElementById("userInput");
    const fileInput = document.getElementById("fileInput");
    const chatBox = document.getElementById("chatBox");

    const text = input.value.trim();
    const file = fileInput.files[0];

    if (text === "" && !file) return;

    let fileData = null;
    if (file) {
        fileData = await readFileAsBase64(file);
    }

    chats[currentChatIndex].push({ role: "user", text, file: fileData ? { mimeType: file.type, data: fileData } : null });
    input.value = "";
    fileInput.value = "";
    renderChat();

    createMessageBurst();

    const loadingId = "loading-" + Date.now();
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot";
    loadingDiv.id = loadingId;
    loadingDiv.innerText = "Đang suy nghĩ...";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const parts = [];
    if (text) parts.push({ text });
    if (fileData) parts.push({ inlineData: { mimeType: file.type, data: fileData } });

    const botResponse = await fetchGeminiResponse(parts);

    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) loadingElement.remove();

    chats[currentChatIndex].push({
        role: "bot",
        text: botResponse,
        file: null
    });

    renderChatWithTyping(botResponse);
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data: prefix
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderChat() {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    chats[currentChatIndex].forEach(msg => {
        const div = document.createElement("div");
        div.className = "message " + msg.role;

        if (msg.file) {
            if (msg.file.mimeType.startsWith('image/')) {
                const img = document.createElement("img");
                img.src = `data:${msg.file.mimeType};base64,${msg.file.data}`;
                img.style.maxWidth = "100%";
                img.style.borderRadius = "10px";
                div.appendChild(img);
            } else {
                const link = document.createElement("a");
                link.href = `data:${msg.file.mimeType};base64,${msg.file.data}`;
                link.download = "uploaded_file";
                link.innerText = "📎 Tệp tin đã tải lên";
                link.style.color = "#00d4ff";
                div.appendChild(link);
            }
        }

        if (msg.text) {
            const textDiv = document.createElement("div");
            textDiv.innerHTML = marked.parse(msg.text);
            div.appendChild(textDiv);
        }

        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderChatWithTyping(botText) {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = "message bot";
    chatBox.appendChild(div);

    let index = 0;
    const typingSpeed = 50; // ms per character

    function typeWriter() {
        if (index < botText.length) {
            div.innerText += botText.charAt(index);
            index++;
            chatBox.scrollTop = chatBox.scrollHeight;
            setTimeout(typeWriter, typingSpeed);
        } else {
            div.innerHTML = marked.parse(botText);
        }
    }

    typeWriter();
}

function playFXEnter() {
    try {
        const fx = new Audio("../Music/FX.Enter.mp3");
        fx.volume = 0.5;
        fx.play();
    } catch (e) {
        console.warn("Không thể phát FX.Enter.mp3", e);
    }
}
function newChat() {
    playFXEnter();
    if (filePreviewMsg) {
        filePreviewMsg.remove();
        filePreviewMsg = null;
    }
    chats.push([]);
    currentChatIndex = chats.length - 1;
    renderHistory();
    renderChat();
}

function renderHistory() {
    const history = document.getElementById("history");
    history.innerHTML = "";
    chats.forEach((chat, index) => {
        const div = document.createElement("div");
        div.className = "history-item";
        let preview = chat.length > 0 ? chat[0].text.substring(0, 20) + "..." : "Chat mới " + (index + 1);
        if (chat.length > 0 && chat[0].file) preview = "📎 " + preview;
        div.innerText = preview;
        div.onclick = () => {
            currentChatIndex = index;
            renderChat();
        };
        history.appendChild(div);
    });
}

document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function showLogin() { 
    isRegister = false; 
    document.getElementById("modalTitle").innerText = "Sign in"; 
    document.querySelector("#authModal button:nth-child(5)").innerText = "Đăng nhập"; 
    document.getElementById("tenUser").style.display = "none";
    document.getElementById("authModal").style.display = "flex"; 
}
function showRegister() { 
    isRegister = true; 
    document.getElementById("modalTitle").innerText = "Register"; 
    document.querySelector("#authModal button:nth-child(5)").innerText = "Đăng ký"; 
    document.getElementById("tenUser").style.display = "block";
    document.getElementById("authModal").style.display = "flex"; 
}
function closeModal() { document.getElementById("authModal").style.display = "none"; }
function showRegisterForm() { showRegister(); }
async function handleAuth() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const tenUser = document.getElementById("tenUser").value;
    if (!email || !password || (isRegister && !tenUser)) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    const url = isRegister 
        ? "http://localhost:8080/register.php" 
        : "http://localhost:8080/login.php";
    const body = isRegister ? { email, password, tenUser } : { email, password };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            closeModal();
            // Có thể lưu trạng thái đăng nhập
        }
    } catch (error) {
        alert("Lỗi kết nối!");
    }
}

function toggleMusic() {
    const music = document.getElementById("backgroundMusic");
    const toggleBtn = document.getElementById("musicToggle");
    if (music.paused) {
        // Fade in
        music.volume = 0;
        music.play();
        toggleBtn.textContent = "🎵 Music: On";
        fadeIn(music);
    } else {
        // Fade out
        fadeOut(music, () => {
            music.pause();
            toggleBtn.textContent = "🎵 Music: Off";
        });
    }
}

const MUSIC_TARGET_VOLUME = 0.1; // 10%

function setVolumeTransition(audio, targetVolume, duration = 600, callback) {
    const startVolume = audio.volume;
    const volumeDelta = targetVolume - startVolume;
    if (duration <= 0 || volumeDelta === 0) {
        audio.volume = targetVolume;
        if (callback) callback();
        return;
    }

    const interval = 25;
    const steps = Math.ceil(duration / interval);
    let stepCount = 0;

    const fade = setInterval(() => {
        stepCount++;
        const progress = stepCount / steps;
        audio.volume = Math.min(1, Math.max(0, startVolume + volumeDelta * progress));

        if (stepCount >= steps) {
            clearInterval(fade);
            audio.volume = targetVolume;
            if (callback) callback();
        }
    }, interval);
}

function fadeIn(audio) {
    setVolumeTransition(audio, MUSIC_TARGET_VOLUME, 600);
}

function fadeOut(audio, callback) {
    setVolumeTransition(audio, 0, 600, () => {
        if (callback) callback();
    });
}

function stopMusic() {
    const music = document.getElementById("backgroundMusic");
    const playBtn = document.getElementById("playMusic");
    const stopBtn = document.getElementById("stopMusic");
    music.pause();
    music.currentTime = 0;
    playBtn.style.display = "inline";
    stopBtn.style.display = "none";
}

function loadMusic() {
    const fileInput = document.getElementById("musicFile");
    const music = document.getElementById("backgroundMusic");
    const playBtn = document.getElementById("playMusic");
    if (fileInput.files[0]) {
        const fileURL = URL.createObjectURL(fileInput.files[0]);
        music.src = fileURL;
        playBtn.style.display = "inline";
    }
}

function createMessageBurst() {
    const sendBtn = document.querySelector('.chat-input button:last-child');
    if (!sendBtn) return;
    const rect = sendBtn.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
        const dot = document.createElement('span');
        dot.className = 'particle-burst';
        dot.style.left = `${rect.left + rect.width/2 + (Math.random()-0.5)*20}px`;
        dot.style.top = `${rect.top + rect.height/2 + (Math.random()-0.5)*20}px`;
        dot.style.background = `hsl(${Math.random() * 360}, 90%, 65%)`;
        const angle = Math.random() * Math.PI * 2;
        const radius = 50 + Math.random() * 40;
        dot.style.setProperty('--dx', `${Math.cos(angle) * radius}px`);
        dot.style.setProperty('--dy', `${Math.sin(angle) * radius}px`);
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 800);
    }
}

window.addEventListener('load', () => {
    const music = document.getElementById("backgroundMusic");
    music.volume = 0;
    music.play().then(() => {
        document.getElementById("musicToggle").textContent = "🎵 Music: On";
        fadeIn(music);
    }).catch(() => {
        // Autoplay may be blocked by browser
        document.getElementById("musicToggle").textContent = "🎵 Music: Off";
    });
});

// Đảm bảo music luôn giữ 10% khi bật lại từ pause
function setMusicToTenPercent() {
    const music = document.getElementById("backgroundMusic");
    if (music) {
        music.volume = MUSIC_TARGET_VOLUME;
    }
}


// Event listener for file input preview
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const chatBox = document.getElementById("chatBox");
    if (filePreviewMsg) {
        filePreviewMsg.remove();
    }
    if (file) {
        filePreviewMsg = document.createElement('div');
        filePreviewMsg.className = 'message user preview';
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxWidth = '200px';
            img.style.borderRadius = '10px';
            filePreviewMsg.appendChild(img);
        }
        const p = document.createElement('p');
        p.textContent = `Tệp đã chọn: ${file.name}`;
        p.style.margin = '5px 0';
        p.style.color = '#00d4ff';
        filePreviewMsg.appendChild(p);
        chatBox.appendChild(filePreviewMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        filePreviewMsg = null;
    }
});
