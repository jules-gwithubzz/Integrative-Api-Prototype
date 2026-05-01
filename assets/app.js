/* ============================================================
   app.js — RepoHive shared logic
   Covers: auth, OTP, mailbox
   Note: ai-chatbot.html has its own inline script (Claude API)
   ============================================================ */

const prototypeOtp = '123456';

/* ── Auth ── */
function loginWithGoogle() {
  localStorage.setItem('verified_user', 'google.user@gmail.com');
  localStorage.setItem('auth_provider', 'google');
  localStorage.setItem('user_name', 'Google User');
  window.location.href = 'mailbox.html';
}

/* ── OTP: Send ── */
function sendPhoneOtp() {
  const phone = document.getElementById('phone').value.trim();
  if (!phone) { alert('Please enter your phone number.'); return; }
  localStorage.setItem('otp_target', phone);
  localStorage.setItem('otp_type', 'phone');
  window.location.href = 'validate-otp.html';
}

function sendEmailOtp() {
  const email = document.getElementById('email').value.trim();
  if (!email) { alert('Please enter your email address.'); return; }
  localStorage.setItem('otp_target', email);
  localStorage.setItem('otp_type', 'email');
  window.location.href = 'validate-otp.html';
}

/* ── OTP: Validate page init & verify ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Show target on validate page */
  const target = document.getElementById('otpTarget');
  if (target) {
    target.textContent = localStorage.getItem('otp_target') || 'your account';
  }

  /* Wire up OTP digit inputs */
  const otpInputs = document.querySelectorAll('.otp');
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '');
      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  if (otpInputs.length > 0) otpInputs[0].focus();
});

function validateOtp() {
  const inputs = document.querySelectorAll('.otp');
  let otp = '';
  inputs.forEach(input => otp += input.value);

  const message = document.getElementById('message');

  if (otp.length < 6) {
    message.textContent = 'Please enter all 6 digits.';
    message.className = 'err';
    message.style.display = 'block';
    return;
  }

  if (otp === prototypeOtp) {
    localStorage.setItem('verified_user', localStorage.getItem('otp_target') || 'user@repohive.app');
    message.textContent = '✓ Verified! Redirecting…';
    message.className = 'ok';
    message.style.display = 'block';
    setTimeout(() => window.location.href = 'mailbox.html', 1000);
  } else {
    message.textContent = '✗ Incorrect code. Please try again.';
    message.className = 'err';
    message.style.display = 'block';
    inputs.forEach(i => i.value = '');
    inputs[0].focus();
  }
}

/* ── Mailbox data ── */
const inboxEmails = [
  {
    title: 'Welcome to RepoHive Mail',
    from: 'RepoHive Team',
    body: 'Your secure mailbox is now ready. You can receive workspace updates, system notifications, and team messages here.'
  },
  {
    title: 'OTP Verification Successful',
    from: 'Security',
    body: 'Your account verification was successful. This helps keep your mailbox protected. If you did not initiate this, contact support immediately.'
  },
  {
    title: 'Project Workspace Invitation',
    from: 'Douglas Hill',
    body: "You have been added to a RepoHive workspace. Open your dashboard to view tasks, repositories, and updates."
  }
];

let sentEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
let currentBox = 'inbox';

/* ── Mailbox: init ── */
function loadMailbox() {
  const verified = localStorage.getItem('verified_user') || 'Verified User';
  const userEmail = document.getElementById('userEmail');
  if (userEmail) userEmail.textContent = verified;
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  if (userEmailDisplay) userEmailDisplay.textContent = verified;
  document.getElementById('sentCount').textContent = sentEmails.length;
  showInbox();
}

/* ── Mailbox: render ── */
function renderEmails(emails) {
  const list = document.getElementById('mailList');
  list.innerHTML = '';

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
    const item = document.createElement('div');
    item.className = 'mail-item';
    item.onclick = () => openEmail(mail, item);
    item.innerHTML = `
      <strong>${mail.title || mail.subject}</strong>
      <small>${mail.from ? 'From: ' + mail.from : 'To: ' + mail.to}</small>
    `;
    list.appendChild(item);

    if (index === 0) {
      item.classList.add('active');
      openEmail(mail, item);
    }
  });
}

function openEmail(mail, element) {
  document.querySelectorAll('.mail-item').forEach(i => i.classList.remove('active'));
  if (element) element.classList.add('active');
  document.getElementById('previewTitle').textContent = mail.title || mail.subject;
  document.getElementById('previewMeta').textContent = mail.from
    ? 'From: ' + mail.from
    : 'To: ' + mail.to;
  document.getElementById('previewBody').textContent = mail.body;
}

function showInbox(e) {
  currentBox = 'inbox';
  document.getElementById('mailTitle').textContent = 'Inbox';
  document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));
  if (e && e.currentTarget) e.currentTarget.classList.add('active');
  renderEmails(inboxEmails);
}

function showSent(e) {
  currentBox = 'sent';
  document.getElementById('mailTitle').textContent = 'Sent';
  document.querySelectorAll('.menu').forEach(m => m.classList.remove('active'));
  if (e && e.currentTarget) e.currentTarget.classList.add('active');
  sentEmails = JSON.parse(localStorage.getItem('sent_emails') || '[]');
  document.getElementById('sentCount').textContent = sentEmails.length;
  renderEmails(sentEmails);
}

/* ── Mailbox: compose ── */
function openCompose() {
  document.getElementById('composeModal').classList.add('active');
}

function closeCompose() {
  document.getElementById('composeModal').classList.remove('active');
}

function sendEmail() {
  const to      = document.getElementById('composeTo').value.trim();
  const subject = document.getElementById('composeSubject').value.trim();
  const body    = document.getElementById('composeBody').value.trim();

  if (!to || !subject || !body) { alert('Please complete all fields.'); return; }

  const email = { to, subject, body, date: new Date().toLocaleString() };
  sentEmails.unshift(email);
  localStorage.setItem('sent_emails', JSON.stringify(sentEmails));
  document.getElementById('sentCount').textContent = sentEmails.length;

  document.getElementById('composeTo').value    = '';
  document.getElementById('composeSubject').value = '';
  document.getElementById('composeBody').value  = '';

  closeCompose();
  showSent();
}

/* ── Mailbox: search ── */
function filterMail() {
  const keyword = document.getElementById('searchMail').value.toLowerCase();
  const emails  = currentBox === 'inbox' ? inboxEmails : sentEmails;
  const filtered = emails.filter(mail =>
    JSON.stringify(mail).toLowerCase().includes(keyword)
  );
  renderEmails(filtered);
}
