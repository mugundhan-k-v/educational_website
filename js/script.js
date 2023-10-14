let menu = document.querySelector('#menu');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
  menu.classList.toggle('fa-times');
  navbar.classList.toggle('active');
}

window.onscroll = () =>{
  menu.classList.remove('fa-times');
  navbar.classList.remove('active');
}

//toggle in courses
const toggleButtons = document.querySelectorAll('.toggle-button');
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        content.classList.toggle('active');

        const icon = button.querySelector('i');
        icon.classList.toggle('rotate');
    });
});


//chatbot
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const voiceBtn = document.querySelector("#voice-btn");

let userMessage = null;
const API_KEY = "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";
const inputInitHeight = chatInput.scrollHeight;

const RATE_LIMIT_RPM = 3;

const courseDomains = ["machine learning","ml","cyber security", "block chain","internet of things","iot","data science","big data"];
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
};

const generateResponse = (chatElement, retryCount = 0) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userMessage }],
        }),
    };
    fetch(API_URL, requestOptions)
        .then((res) => {
            if (res.status === 429) {
                throw new Error("Rate limit exceeded");
            }
            return res.json();
        })
        .then((data) => {
            messageElement.textContent = data.choices[0].message.content.trim();
        })
        .catch((error) => {
            if (retryCount < 2) {
                const backoffTime = RATE_LIMIT_RPM * 60 * 1000 * Math.pow(2, retryCount);
                console.error("API Error:", error);
                console.log(`Retrying in ${backoffTime / 1000} seconds...`);
                setTimeout(() => generateResponse(chatElement, retryCount + 1), backoffTime);
            } else {
                messageElement.classList.add("error");
                messageElement.textContent = "Please try again later.";
            }
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const isMessageInCourseDomain = (message) => {
    const lowerCaseMessage = message.toLowerCase();
    return courseDomains.some((domain) => lowerCaseMessage.includes(domain));
};

const getCourseResponse = (message) => {
    const lowerCaseMessage = message.toLowerCase();
            if (lowerCaseMessage.includes("machine learning")) {
                return "You have choosed Machine Learning, Now you can ask me your doubt";
            } else if (lowerCaseMessage.includes("cyber security")) {
                return "You have choosed Cyber Security, Now you can ask me your doubt";
            } else if (lowerCaseMessage.includes("block chain")) {
                return "You have choosed Block Chain, Now you can ask me your doubt";
            }else if (lowerCaseMessage.includes("internet of things")) {
                return "You have choosed Internet Of Things, Now you can ask me your doubt";
            } else if (lowerCaseMessage.includes("data science")) {
                return "You have choosed Block Chain, Now you can ask me your doubt";
            }  else if (lowerCaseMessage.includes("big data")) {
                return "You have choosed Big Data, Now you can ask me your doubt";
            }else {
                return "We have a variety of courses in different domains. Could you please specify which domain you are interested in?";
            }
        };

const displayBotResponse = (response) => {
    const incomingChatLi = createChatLi(response, "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
};


let selectedDomain = null;

const handleChat = () => {

    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    if (selectedDomain) {
        const thinkingResponse = "Thinking...";
        const thinkingChatLi = createChatLi(thinkingResponse, "incoming");
        chatbox.appendChild(thinkingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            generateResponse(thinkingChatLi);
        }, 1000);
    } else {
        if (isMessageInCourseDomain(userMessage)) {
            selectedDomain = userMessage.toLowerCase();
            const selectedDomainResponse = `You've selected the ${selectedDomain} Course. How can I assist you with ${selectedDomain}?`;
            displayBotResponse(selectedDomainResponse);
        } else {
            const selectDomainResponse = "I'm here to help with our courses. Please select a domain (e.g., data science)";
            displayBotResponse(selectDomainResponse);
        }
    }

};

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Voice Recognition
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-US";

voiceBtn.addEventListener("click", () => {
    recognition.start();
    voiceBtn.classList.add("active");
});

recognition.addEventListener("result", (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    chatInput.value = transcript;
});

recognition.addEventListener("end", () => {
    voiceBtn.classList.remove("active");
});

