// ──────────────────────────────────────────
// SpaceHub — Shared Frontend Utilities
// ──────────────────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = `toast toast--${type} show`;
    toast.innerHTML = `${type === 'success' ? '✓' : '✕'} ${message}`;
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function requireAuth(allowedRoles) {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
        window.location.href = 'login.html';
        return null;
    }
    const user = JSON.parse(userData);
    if (allowedRoles && !allowedRoles.includes(user.role || 'customer')) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

function handleLogout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

function toggleProfileMenu() {
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.classList.toggle('show');
}

document.addEventListener('click', (e) => {
    const menu = document.querySelector('.profile-menu');
    if (menu && !menu.contains(e.target)) {
        const dd = document.getElementById('profileDropdown');
        if (dd) dd.classList.remove('show');
    }
});

function formatCurrency(amount) {
    return '฿' + Number(amount).toLocaleString();
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString();
}

// ──────────────────────────────────────────
// Floating Chat Support Logic
// ──────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────
// Floating Chat Support Logic (Feature 1)
// ──────────────────────────────────────────────────────────────────────────

function initFloatingChat() {
    const toggle = document.getElementById('chatToggle');
    const chatWin = document.getElementById('chatWindow');
    const close = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    if (toggle && chatWin) {
        // Toggle the chat window visibility
        toggle.addEventListener('click', () => chatWin.classList.toggle('show'));

        // Close chat window when clicking the 'X' button
        if (close) {
            close.addEventListener('click', () => chatWin.classList.remove('show'));
        }

        // Message sending logic
        if (sendBtn && userInput) {
            const sendMessage = () => {
                const text = userInput.value.trim();
                if (!text) return;

                // Display user's message bubble
                const msg = document.createElement('div');
                msg.className = 'user-message';
                msg.innerText = text;
                chatMessages.appendChild(msg);

                // Clear input field and scroll to the latest message
                userInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // ──────────────────────────────────────────────────────────────────────────
                // Database-Connected Chat Logic
                // ──────────────────────────────────────────────────────────────────────────

                // Database-Connected Chat Logic (Improved for Demo)
                setTimeout(async () => {
                    const botMsg = document.createElement('div');
                    botMsg.style.cssText = "align-self: flex-start; background: white; padding: 8px 12px; border-radius: 12px 12px 12px 0; font-size: 0.85rem; box-shadow: var(--shadow-sm);";

                    let responseText = "";
                    const lowerText = text.toLowerCase();
                    const idMatch = text.match(/BK-?([\w\d]+)/i);

                    if (idMatch) {
                        // ดึงเฉพาะตัวเลขหรือรหัสหลัง BK มาเช็ก
                        const bookingIdRaw = idMatch[1].toUpperCase();
                        const fullBookingId = idMatch[0].toUpperCase();

                        // 1. ลองเช็กบนหน้าจอก่อน (กรณีอยู่หน้า My Bookings)
                        const allIDsOnScreen = Array.from(document.querySelectorAll('.booking-card__value'))
                            .map(el => el.innerText.toUpperCase());
                        const isFoundOnScreen = allIDsOnScreen.some(val => val.includes(fullBookingId));

                        if (isFoundOnScreen) {
                            responseText = `I have found your booking ${fullBookingId} on this page. It's currently being processed.`;
                        } else {
                            // 2. ถ้าไม่เจอในหน้าปัจจุบัน (เช่น อยู่หน้า Dashboard) ให้ไปถาม Database จริง
                            try {
                                // ส่งไปเช็กที่ API ของ Backend (ใช้ idMatch[1] เพื่อส่งเฉพาะตัวเลขรหัส)
                                const res = await fetch(`/api/bookings/${bookingIdRaw}`);
                                const data = await res.json();

                                if (res.ok && (data.exists || data.booking)) {
                                    responseText = `I've checked our database. Booking ${fullBookingId} is valid and currently ${data.booking?.status || 'active'}. How can I help you with this?`;
                                } else {
                                    responseText = `I'm sorry, I couldn't find Booking ID: ${fullBookingId} in our records. Please check your ID again.`;
                                }
                            } catch (error) {
                                // กรณีติดต่อ Backend ไม่ได้ ให้ตอบสุภาพไว้ก่อน
                                responseText = `I found the ID ${fullBookingId}, but I can't verify it right now. Please try again in the My Bookings page.`;
                            }
                        }
                    }
                    else if (lowerText.includes("hi") || lowerText.includes("hello")) {
                        responseText = "Hello! I'm here to help. To provide the best assistance, please tell me a bit about your issue (e.g., Booking error, Payment problem).";
                    }
                    else if (lowerText.includes("booking") || lowerText.includes("reserve")) {
                        responseText = "I see you're having trouble with a booking. Could you provide your Booking ID so I can check the status?";
                    }
                    else {
                        responseText = "I'm not quite sure I understand. Could you please specify your problem or provide a Booking ID (e.g., BK-7)?";
                    }

                    botMsg.innerText = responseText;
                    chatMessages.appendChild(botMsg);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            };

            // Trigger send on button click
            sendBtn.addEventListener('click', sendMessage);

            // Trigger send on 'Enter' key press
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
    }
}

// Function to generate a random Booking ID (e.g., BK-7A92)
function generateRandomID() {
    const chars = '0123456789ABCDEF';
    let result = 'BK-';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Example: const id = generateRandomID();

function notifyUserOfReply(ticketId) {
    const message = `Admin has replied to your Support Ticket #${ticketId}. Check your inbox!`;
    // เรียกใช้ฟังก์ชันแจ้งเตือนที่เราสร้างไว้ก่อนหน้านี้
    addMockNotification(message);

    // เปลี่ยนไอคอนกระดิ่งเป็นรูปจดหมายชั่วคราวเพื่อให้สะดุดตา
    const notiIcon = document.querySelector('.noti-icon');
    if (notiIcon) notiIcon.innerText = '📩';
}

// ในไฟล์ app.js
async function checkNewMessages() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) return;

    try {
        const res = await fetch(`/api/user/unread-messages?userId=${user.id}`);
        const data = await res.json();

        const badge = document.getElementById('notiBadge');
        const inboxCount = document.getElementById('inboxCount');

        if (data.unreadCount > 0) {
            badge.innerText = data.unreadCount;
            badge.style.display = 'flex'; // แสดงจุดแดงบนวงกลม Profile
            if (inboxCount) inboxCount.innerText = `(${data.unreadCount})`;
        } else {
            badge.style.display = 'none';
        }
    } catch (err) {
        console.error("Live check failed");
    }
}

// เริ่มทำงานและเช็คทุกๆ 5 วินาที
if (sessionStorage.getItem('user')) {
    checkNewMessages();
    setInterval(checkNewMessages, 5000);
}

async function syncUnreadNotifications() {
    const userData = sessionStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);

    try {
        // ยิงไปที่ Endpoint ที่เราสร้างไว้ใน server.js
        const res = await fetch(`/api/user/unread-messages?userId=${user.id}`);
        const data = await res.json();

        const badge = document.getElementById('inboxBadge');
        if (badge) {
            if (data.unreadCount > 0) {
                badge.innerText = data.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (err) {
        console.error("Notification sync error:", err);
    }
}

async function updateNotificationSystem() {
    const userData = sessionStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);

    try {
        const res = await fetch(`/api/user/notifications?userId=${user.id}`);
        const data = await res.json();

        // แสดงตัวเลขที่เมนู Messages
        const inboxBadge = document.getElementById('inboxBadge');
        if (inboxBadge) {
            inboxBadge.innerText = data.unreadMessages;
            inboxBadge.style.display = data.unreadMessages > 0 ? 'inline-flex' : 'none';
        }

        // แสดงแจ้งเตือนบนหน้าจอ (Toast) ถ้ามีการอัปเดตสถานะการจอง
        if (data.unreadBookings > 0) {
            showToast(`You have ${data.confirmedBookings} confirmed booking(s)!`, 'success');
        }
    } catch (err) {
        console.error("Notification sync error:", err);
    }
}

// ใน app.js แทนที่ฟังก์ชัน checkGlobalNotifications เดิมด้วยอันนี้:

async function checkGlobalNotifications() {
    const userData = sessionStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);

    try {
        const res = await fetch(`/api/user/notifications?userId=${user.id}`);
        const data = await res.json();

        // 1. อัปเดตตัวเลข Badge ที่เมนู Messages
        const badge = document.getElementById('inboxBadge');
        if (badge) {
            badge.innerText = data.unreadMessages;
            badge.style.display = data.unreadMessages > 0 ? 'inline-block' : 'none';
        }

        // 2. [เพิ่มใหม่] เช็คการจองของวันนี้ (Upcoming Today) สำหรับ User
        // ค้นหาส่วน Logic ที่เราเช็ควันที่เดิม แล้วแทนที่ด้วยชุดนี้ครับ:

        if (user.role === 'customer') {
            const bookingRes = await fetch(`/api/bookings/user/${user.id}`);
            const bookingData = await bookingRes.json();

            // 1. หาวันพรุ่งนี้ (Tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            // 2. หาวันนี้ (Today) สำหรับเผื่อกรณีอยากให้โชว์ทั้งวันนี้และวันพรุ่งนี้
            const todayStr = new Date().toISOString().split('T')[0];

            // 3. เช็คว่ามีการจองที่ตรงกับ "วันนี้" หรือ "วันพรุ่งนี้" หรือไม่
            const hasUpcoming = bookingData.bookings.some(b =>
                (b.booking_date.startsWith(todayStr) || b.booking_date.startsWith(tomorrowStr))
                && b.status === 'confirmed'
            );

            const alertBanner = document.getElementById('upcomingAlert');
            if (alertBanner) {
                if (hasUpcoming) {
                    alertBanner.style.display = 'flex';
                    const upcomingText = document.getElementById('upcomingText');
                    if (upcomingText) {
                        // ต้องมั่นใจว่ามีการใส่ข้อความลงไปตรงนี้
                        const isTomorrow = bookingData.bookings.some(b => b.booking_date.startsWith(tomorrowStr));
                        upcomingText.innerText = isTomorrow
                            ? "Reminder: You have a reservation scheduled for tomorrow!"
                            : "You have a reservation coming up today!";
                    }
                } else {
                    alertBanner.style.display = 'none';
                }
            }
        }

        // 3. Logic การแจ้งเตือนแบบ Toast (เด้งเตือน)

        // กรณีเป็น User: แจ้งเมื่อมีการ Confirm การจองใหม่
        if (data.newlyConfirmedBookings > 0) {
            const lastNotified = sessionStorage.getItem('last_confirmed_count');
            if (lastNotified != data.newlyConfirmedBookings) {
                showToast(`Your booking has been confirmed!`, 'success');
                sessionStorage.setItem('last_confirmed_count', data.newlyConfirmedBookings);
                if (typeof loadBookings === 'function') loadBookings();
            }
        }

        // กรณีเป็น Admin/Employee: แจ้งเมื่อมีรายการ Pending รออยู่
        if (data.pendingActionBookings > 0) {
            const lastPendingCount = sessionStorage.getItem('last_pending_count');
            if (lastPendingCount != data.pendingActionBookings) {
                showToast(`There are ${data.pendingActionBookings} bookings waiting for confirmation.`, 'info');
                sessionStorage.setItem('last_pending_count', data.pendingActionBookings);
                if (typeof loadReservations === 'function') loadReservations();
            }
        }

    } catch (err) { /* silent error */ }
}

// รันทุก 5-10 วินาที
setInterval(checkGlobalNotifications, 3000);

// สั่งให้ทำงานเมื่อโหลดหน้าจอ และเช็คซ้ำทุก 10 วินาที (Real-time กลายๆ)
document.addEventListener('DOMContentLoaded', () => {
    syncUnreadNotifications();
    setInterval(syncUnreadNotifications, 10000);
    initFloatingChat();
    checkGlobalNotifications();
});
