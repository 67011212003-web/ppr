/* 1. Global State Management */
let cart = JSON.parse(localStorage.getItem('eggPamCart')) || [];
const PROMPTPAY_ID = "0812345678"; // *** เปลี่ยนเป็นเบอร์ PromptPay ของคุณ ***

/**
 * 2. Facebook SDK Initialization
 */
window.fbAsyncInit = function() {
    FB.init({
        appId      : 'YOUR_FACEBOOK_APP_ID', // *** ใส่ App ID จริงของคุณ ***
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
    });

    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            updateUserUI(true);
        }
    });
};

/* 3. Bootstrapping */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    console.log('%c🌿 PPR Shop System Ready', 'color: #4CAF50; font-weight: bold;');
    updateCartCount();
    updateUserUI();
    if (document.getElementById('cart-items')) renderCart();
}

/**
 * 4. Cart Logic with Categories
 */
function addToCart(name, price, category = "ทั่วไป") {
    const found = cart.find(item => item.name === name);
    if (found) {
        found.qty += 1;
    } else {
        cart.push({ name, price, qty: 1, category: category });
    }
    saveCart();
    showToast(`เพิ่ม ${name} (${category}) ลงตะกร้าแล้ว 🥚`);
}

function saveCart() {
    localStorage.setItem('eggPamCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) {
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        el.innerText = totalQty;
        el.style.display = totalQty > 0 ? 'block' : 'none';
    }
}

/**
 * 5. Rendering & Dynamic Pricing
 */
function renderCart() {
    const itemsEl = document.getElementById('cart-items');
    if (!itemsEl) return;
    
    if (cart.length === 0) {
        document.getElementById('cart-empty-msg').style.display = 'block';
        document.getElementById('cart-table').style.display = 'none';
        return;
    }

    itemsEl.innerHTML = cart.map((item, i) => `
        <tr class="fade-in">
            <td>
                <div style="display:flex; flex-direction:column;">
                    <small style="color:#388e3c; font-size:0.7rem;">[${item.category}]</small>
                    <span style="font-weight:500;">${item.name}</span>
                </div>
            </td>
            <td>฿${item.price.toLocaleString()}</td>
            <td>
                <div class="qty-control" style="display:flex; align-items:center; gap:10px; justify-content:center;">
                    <button onclick="changeQty(${i}, -1)" class="qty-btn">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${i}, 1)" class="qty-btn">+</button>
                </div>
            </td>
            <td style="font-weight:600;">฿${(item.price * item.qty).toLocaleString()}</td>
            <td><button onclick="removeItem(${i})" style="color:#ff8a65; border:none; background:none; cursor:pointer;">✕</button></td>
        </tr>
    `).join('');

    updateSummary();
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = parseInt(document.querySelector('input[name="shipping"]:checked')?.value || 0);
    const finalTotal = subtotal + shipping;

    // อัปเดตตัวเลขในหน้าจอ
    if (document.getElementById('subtotal')) document.getElementById('subtotal').innerText = subtotal.toLocaleString();
    if (document.getElementById('shipping-fee')) document.getElementById('shipping-fee').innerText = shipping.toLocaleString();
    if (document.getElementById('final-total')) document.getElementById('final-total').innerText = finalTotal.toLocaleString();
    if (document.getElementById('pay-amount')) document.getElementById('pay-amount').innerText = finalTotal.toLocaleString();

    // ⚡ สร้าง Dynamic QR Code
    updateDynamicQR(finalTotal);
}

function updateDynamicQR(amount) {
    const qrImg = document.getElementById('main-qr');
    if (qrImg && amount > 0) {
        // ใช้ promptpay.io API สร้าง QR ตามยอดเงิน
        qrImg.src = `https://promptpay.io/${PROMPTPAY_ID}/${amount}.png`;
    }
}

function updateShipping(fee) {
    updateSummary();
}

function changeQty(index, diff) {
    cart[index].qty += diff;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
}

/**
 * 6. Checkout & Line Integration
 */
function confirmPayment() {
    const name = document.getElementById('cust-name')?.value;
    const phone = document.getElementById('cust-phone')?.value;
    const addr = document.getElementById('cust-address')?.value;
    const slip = document.getElementById('slip-upload')?.files[0];

    if (!name || !phone || !addr || !slip) {
        alert("⚠️ กรุณากรอกข้อมูลให้ครบและแนบหลักฐานการโอนเงินครับ");
        return;
    }

    // สร้างข้อความแจ้งเตือน (ส่งเข้า LINE สรุปออเดอร์)
    let msg = `🛒 *คำสั่งซื้อใหม่จาก PPR Shop*\n`;
    msg += `👤 คุณ: ${name}\n📞 โทร: ${phone}\n📍 ที่อยู่: ${addr}\n`;
    msg += `━━━━━━━━━━━━━━\n`;
    cart.forEach(item => {
        msg += `• [${item.category}] ${item.name} x${item.qty}\n`;
    });
    msg += `━━━━━━━━━━━━━━\n`;
    msg += `💰 ยอดรวม: ฿${document.getElementById('final-total').innerText}\n`;
    msg += `🕒 ${new Date().toLocaleString('th-TH')}`;

    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(msg)}`;
    
    // เคลียร์ตะกร้าและไปที่ LINE
    localStorage.removeItem('eggPamCart');
    window.open(lineUrl, '_blank');
    window.location.href = 'index.html';
}

/**
 * 7. Utility
 */
function showToast(msg) {
    const x = document.getElementById("toast");
    if (!x) { console.log(msg); return; }
    x.innerText = msg;
    x.classList.add("show");
    setTimeout(() => x.classList.remove("show"), 3000);
}