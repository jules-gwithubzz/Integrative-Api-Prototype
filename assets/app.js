const prototypeOtp = "123456";

function sendPhoneOtp() {
  const phone = document.getElementById("phone").value.trim();

  if (!phone) {
    alert("Please enter your phone number.");
    return;
  }

  localStorage.setItem("otp_target", phone);
  localStorage.setItem("otp_type", "phone");

  window.location.href = "validate-otp.html";
}

function sendEmailOtp() {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  localStorage.setItem("otp_target", email);
  localStorage.setItem("otp_type", "email");

  window.location.href = "validate-otp.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("otpTarget");

  if (target) {
    target.textContent = localStorage.getItem("otp_target") || "your account";
  }

  const otpInputs = document.querySelectorAll(".otp");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");

      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });
});

function validateOtp() {
  const inputs = document.querySelectorAll(".otp");
  let otp = "";

  inputs.forEach(input => otp += input.value);

  const message = document.getElementById("message");

  if (otp === prototypeOtp) {
    localStorage.setItem("verified_user", localStorage.getItem("otp_target"));
    window.location.href = "mailbox.html";
  } else {
    message.textContent = "Invalid OTP. Please try again.";
    message.style.color = "#dc2626";
  }
}

/* Mailbox */
const inboxEmails = [
  {
    title: "Welcome to {Rename} Mail",
    from: "{Rename} Team",
    body: "Your secure mailbox is now ready. You can receive workspace updates, system notifications, and team messages."
  },
  {
    title: "OTP Verification Successful",
    from: "Security",
    body: "Your account verification was successful. This helps keep your mailbox protected."
  },
  {
    title: "Project Workspace Invitation",
    from: "Douglas Hill",
    body: "You have been added to a {Rename} workspace. Open your dashboard to view tasks, repositories, and updates."
  }
];

let sentEmails = JSON.parse(localStorage.getItem("sent_emails")) || [];
let currentBox = "inbox";

function loadMailbox() {
  const userEmail = document.getElementById("userEmail");

  if (userEmail) {
    userEmail.textContent = localStorage.getItem("verified_user") || "Verified User";
  }

  showInbox();
}

function renderEmails(emails) {
  const list = document.getElementById("mailList");
  list.innerHTML = "";

  if (emails.length === 0) {
    list.innerHTML = `
      <div class="mail-item">
        <strong>No emails found</strong>
        <small>This folder is empty.</small>
      </div>
    `;
    return;
  }

  emails.forEach((mail, index) => {
    const item = document.createElement("div");
    item.className = "mail-item";
    item.onclick = () => openEmail(mail, item);

    item.innerHTML = `
      <strong>${mail.title || mail.subject}</strong>
      <small>${mail.from ? "From: " + mail.from : "To: " + mail.to}</small>
    `;

    list.appendChild(item);

    if (index === 0) {
      item.classList.add("active");
      openEmail(mail, item);
    }
  });
}

function openEmail(mail, element) {
  document.querySelectorAll(".mail-item").forEach(item => {
    item.classList.remove("active");
  });

  if (element) {
    element.classList.add("active");
  }

  document.getElementById("previewTitle").textContent = mail.title || mail.subject;
  document.getElementById("previewMeta").textContent = mail.from
    ? `From: ${mail.from}`
    : `To: ${mail.to}`;
  document.getElementById("previewBody").textContent = mail.body;
}

function showInbox() {
  currentBox = "inbox";
  document.getElementById("mailTitle").textContent = "Inbox";
  renderEmails(inboxEmails);
}

function showSent() {
  currentBox = "sent";
  document.getElementById("mailTitle").textContent = "Sent History";
  renderEmails(sentEmails);
}

function openCompose() {
  document.getElementById("composeModal").classList.add("active");
}

function closeCompose() {
  document.getElementById("composeModal").classList.remove("active");
}

function sendEmail() {
  const to = document.getElementById("composeTo").value.trim();
  const subject = document.getElementById("composeSubject").value.trim();
  const body = document.getElementById("composeBody").value.trim();

  if (!to || !subject || !body) {
    alert("Please complete all fields.");
    return;
  }

  const email = {
    to,
    subject,
    body,
    date: new Date().toLocaleString()
  };

  sentEmails.unshift(email);
  localStorage.setItem("sent_emails", JSON.stringify(sentEmails));

  document.getElementById("sentCount").textContent = sentEmails.length;

  document.getElementById("composeTo").value = "";
  document.getElementById("composeSubject").value = "";
  document.getElementById("composeBody").value = "";

  closeCompose();
  showSent();
}

function filterMail() {
  const keyword = document.getElementById("searchMail").value.toLowerCase();
  const emails = currentBox === "inbox" ? inboxEmails : sentEmails;

  const filtered = emails.filter(mail => {
    return JSON.stringify(mail).toLowerCase().includes(keyword);
  });

  renderEmails(filtered);
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  setTimeout(() => {
    appendMessage(generateBotReply(message), "bot");
  }, 500);
}

function quickAsk(text) {
  document.getElementById("chatInput").value = text;
  sendChat();
}

function handleChatKey(event) {
  if (event.key === "Enter") {
    sendChat();
  }
}

function appendMessage(text, sender) {
  const chatWindow = document.getElementById("chatWindow");

  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${sender}`;

  wrapper.innerHTML = `
    <div class="avatar">${sender === "user" ? "👤" : "🤖"}</div>
    <div class="bubble">${text}</div>
  `;

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function generateBotReply(message) {
  const text = message.toLowerCase();

  if (text.includes("email") || text.includes("summarize")) {
    return "Your latest mailbox activity shows new workspace updates, OTP verification confirmation, and project invitation emails.";
  }

  if (text.includes("sent")) {
    return "You can open the Sent History section in the mailbox to review all emails you composed and sent in this prototype.";
  }

  if (text.includes("compose")) {
    return "Sure. A professional email should include a clear subject, short greeting, direct message, and polite closing.";
  }

  if (text.includes("task") || text.includes("project")) {
    return "{Rename} helps you organize tasks, repositories, project updates, and team collaboration in one workspace.";
  }

  return "I can help with mailbox summaries, email drafting, sent history, workspace updates, and {Rename} navigation.";
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  showTyping();

  setTimeout(() => {
    removeTyping();
    appendMessage(generateBotReply(message), "bot");
  }, 900);
}

function handleChatKey(event) {
  if (event.key === "Enter") {
    sendChat();
  }
}

function appendMessage(text, sender) {
  const chatWindow = document.getElementById("chatWindow");

  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${sender}`;

  wrapper.innerHTML = `
    <div class="avatar">${sender === "user" ? "👤" : "🤖"}</div>
    <div class="bubble">${text}</div>
  `;

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() {
  const chatWindow = document.getElementById("chatWindow");

  const typing = document.createElement("div");
  typing.className = "chat-message bot";
  typing.id = "typingIndicator";

  typing.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="bubble">
      <div class="typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();
}

function generateBotReply(message) {
  const text = message.toLowerCase();

  if (text.includes("email") || text.includes("summarize")) {
    return "Your mailbox shows recent updates about OTP verification, workspace invitations, and {Rename} activity notifications.";
  }

  if (text.includes("sent")) {
    return "Your sent email history is available inside the mailbox page. It stores composed messages in this prototype.";
  }

  if (text.includes("compose")) {
    return "Sure. Start with a clear subject, write a short message, and end with a polite closing.";
  }

  if (text.includes("otp")) {
    return "OTP verification helps protect user access by confirming ownership of a phone number or email address.";
  }

  return "I can help you understand {Rename} mailbox access, OTP verification, email actions, and workspace updates.";
}

function loginWithGoogle() {
  const googleUser = {
    name: "Google User",
    email: "google.user@gmail.com",
    provider: "google"
  };

  localStorage.setItem("verified_user", googleUser.email);
  localStorage.setItem("auth_provider", googleUser.provider);
  localStorage.setItem("user_name", googleUser.name);

  window.location.href = "mailbox.html";
}
