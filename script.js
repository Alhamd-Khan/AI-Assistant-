let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAVofUBR_7K7AvkiQSvg1SyXEpf_Pl5G6I";

let user={
    message:null,
    file:{
        mime_type:null,
        data: null
    }
}

// Chat management
let chats = JSON.parse(localStorage.getItem('chats')) || [];
let currentChatId = localStorage.getItem('currentChatId') || null;

// DOM Elements
const newChatBtn = document.getElementById('new-chat');
const chatList = document.querySelector('.chat-list');
const messagesContainer = document.querySelector('.messages-container');
const currentChatTitle = document.querySelector('.current-chat-title');
const deleteChatBtn = document.getElementById('delete-chat');

// Add this at the beginning of your script.js
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to 'light'
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    
    // Check for greetings and basic questions first
    const greetings = {
        "kese ho": "Main bilkul theek hun, aap batayein kese hain aap? Main Wild AI Bot hun, Alhamd Khan ne mujhe banaya hai.",
        "kaise ho": "Main bilkul theek hun, aap batayein kese hain aap? Main Wild AI Bot hun, Alhamd Khan ne mujhe banaya hai.",
        "how are you": "I'm doing great! How are you? I'm Wild AI Bot, created by Alhamd Khan.",
        "kaisa hai": "Main bilkul theek hun, aap batayein kese hain aap? Main Wild AI Bot hun, Alhamd Khan ne mujhe banaya hai.",
        "kya hal hai": "Alhamdulillah main theek hun, aap batayein kese hain aap? Main Wild AI Bot hun, Alhamd Khan ne mujhe banaya hai."
    };

    // Check for greeting questions
    for (let greeting in greetings) {
        if (user.message.toLowerCase().includes(greeting)) {
            text.innerHTML = greetings[greeting];
            return greetings[greeting];
        }
    }
    
    // Check for creator/identity questions
    const creatorQuestions = [
        "who created you",
        "who made you",
        "who are you",
        "what is your name",
        "who developed you",
        "who built you",
        "who is your creator",
        "who's your creator",
        "who programmed you",
        "who was your creator",
        "creator",
        "made by",
        "created by",
        "kiska",
        "kisne banaya",
        "kaun banaya",
        "kya ho",
        "kon ho",
        "trained",
        "developed",
        "google",
        "openai",
        "microsoft",
        "gemini",
        "bard",
        "gpt"
    ];
    
    // Check if the message contains any creator-related questions
    if (creatorQuestions.some(q => user.message.toLowerCase().includes(q))) {
        const creatorResponse = "I am Wild AI Bot, created by Alhamd Khan. I'm here to assist you with any questions or tasks you may have!";
        text.innerHTML = creatorResponse;
        return creatorResponse;
    }

    let RequestOption = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "contents": [{
                "parts": [{
                    text: user.message
                }, ...(user.file.data ? [{inline_data: user.file}] : [])]
            }]
        })
    };
    
    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        
        // Block any responses mentioning Google or other AI companies
        const blockedTerms = ["google", "gemini", "bard", "openai", "gpt", "microsoft", "anthropic", "claude"];
        if (blockedTerms.some(term => apiResponse.toLowerCase().includes(term))) {
            apiResponse = "I am Wild AI Bot, created by Alhamd Khan. I'm here to assist you with any questions or tasks you may have!";
        }
        
        text.innerHTML = apiResponse;
        return apiResponse;
    } catch(error) {
        console.log(error);
        text.innerHTML = "I apologize, but I encountered an error. Please try again.";
        return "I apologize, but I encountered an error. Please try again.";
    } finally {
        chatContainer.scrollTo({top: 0, behavior: "smooth"});
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {};
    }
}

function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}

function handlechatResponse(userMessage) {
    if (!userMessage.trim()) return;
    
    user.message = userMessage;
    
    // Get current chat
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) return;
    
    // Create and display user message
    let userHtml = `
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>
        <img src="user.png" alt="" id="userImage">
    `;
    
    let userChatBox = createChatBox(userHtml, "user-chat-box");
    messagesContainer.appendChild(userChatBox);
    
    // Add user message to chat history
    currentChat.messages.push({
        role: 'user',
        content: userMessage
    });
    
    // Save to localStorage
    localStorage.setItem('chats', JSON.stringify(chats));
    
    // Clear input
    prompt.value = "";
    
    // Create and display AI response with new logo
    let aiHtml = `
        <img src="Wild_AI_Bot.png" alt="" id="aiImage">
        <div class="ai-chat-area">
            <img src="loading.webp" alt="" class="load" width="50px">
        </div>
    `;
    
    let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
    messagesContainer.appendChild(aiChatBox);
    
    // Generate AI response
    generateResponse(aiChatBox).then((aiResponse) => {
        // Add AI response to chat history
        currentChat.messages.push({
            role: 'ai',
            content: aiResponse
        });
        
        // Save to localStorage
        localStorage.setItem('chats', JSON.stringify(chats));
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)
    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})

imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
       let base64string=e.target.result.split(",")[1]
       user.file={
        mime_type:file.type,
        data: base64string
    }
    image.src=`data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
    }
    
    reader.readAsDataURL(file)
})

imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})

// Create new chat
function createNewChat() {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        title: 'New Chat',
        messages: []
    };
    
    // Add new chat to the array
    chats.unshift(newChat);
    currentChatId = chatId;
    
    // Save to localStorage
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentChatId', currentChatId);
    
    // Clear messages container
    messagesContainer.innerHTML = '';
    
    // Add initial AI message
    const initialMessage = {
        role: 'ai',
        content: "Hello! I'm Wild AI Bot, created by Alhamd Khan. How can I help you today?"
    };
    
    // Add message to chat history
    newChat.messages.push(initialMessage);
    
    // Update UI
    updateChatList();
    
    // Display initial message with new logo
    const aiBox = document.createElement('div');
    aiBox.className = 'ai-chat-box';
    aiBox.innerHTML = `
        <img src="Wild_AI_Bot.png" alt="" id="aiImage">
        <div class="ai-chat-area">${initialMessage.content}</div>
    `;
    messagesContainer.appendChild(aiBox);
}

// Update chat list in sidebar
function updateChatList() {
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.classList.toggle('active', chat.id === currentChatId);
        chatItem.textContent = chat.title;
        chatItem.onclick = () => loadChat(chat.id);
        chatList.appendChild(chatItem);
    });
}

// Load selected chat
function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    localStorage.setItem('currentChatId', currentChatId);
    
    // Update chat title
    currentChatTitle.textContent = chat.title;
    
    // Clear and update messages
    messagesContainer.innerHTML = '';
    
    chat.messages.forEach(msg => {
        if (msg.role === 'ai') {
            const aiBox = document.createElement('div');
            aiBox.className = 'ai-chat-box';
            aiBox.innerHTML = `
                <img src="Wild_AI_Bot.png" alt="" id="aiImage">
                <div class="ai-chat-area">${msg.content}</div>
            `;
            messagesContainer.appendChild(aiBox);
        } else {
            const userBox = document.createElement('div');
            userBox.className = 'user-chat-box';
            userBox.innerHTML = `
                <div class="user-chat-area">${msg.content}</div>
                <img src="user.png" alt="" id="userImage">
            `;
            messagesContainer.appendChild(userBox);
        }
    });
    
    // Update active state in chat list
    updateChatList();
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Delete current chat
function deleteChat() {
    if (chats.length <= 1) {
        alert('Cannot delete the last chat');
        return;
    }
    
    const index = chats.findIndex(c => c.id === currentChatId);
    if (index !== -1) {
        chats.splice(index, 1);
        localStorage.setItem('chats', JSON.stringify(chats));
        
        // Load the next available chat
        currentChatId = chats[0].id;
        localStorage.setItem('currentChatId', currentChatId);
        
        updateChatList();
        loadChat(currentChatId);
    }
}

// Edit chat title
currentChatTitle.addEventListener('blur', () => {
    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.title = currentChatTitle.textContent;
        localStorage.setItem('chats', JSON.stringify(chats));
        updateChatList();
    }
});

// Event listeners
newChatBtn.addEventListener('click', createNewChat);
deleteChatBtn.addEventListener('click', deleteChat);

// Initialize chat management at the start
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chats if none exist
    if (!localStorage.getItem('chats') || JSON.parse(localStorage.getItem('chats')).length === 0) {
        createNewChat();
    } else {
        chats = JSON.parse(localStorage.getItem('chats'));
        currentChatId = localStorage.getItem('currentChatId') || chats[0].id;
        loadChat(currentChatId);
    }
});

// Handle bot responses
function getBotResponse(question) {
    if (question.toLowerCase().includes('who created you') || 
        question.toLowerCase().includes('who made you') ||
        question.toLowerCase().includes('who are you')) {
        return "I'm Wild AI Bot, created by Alhamd Khan. I'm here to assist you with any questions or tasks you may have!";
    }
    // Add more response logic here
}

// Handle message submission
submitBtn.addEventListener('click', () => {
    const message = prompt.value.trim();
    if (!message) return;

    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) return;

    // Add user message handling here if needed
    const botResponse = getBotResponse(message);
    
    currentChat.messages.push({
        type: 'ai',
        content: botResponse || "I'm here to help! What would you like to know?"
    });

    prompt.value = '';
    loadChat(currentChatId);
});