// จำลองฐานข้อมูลใน LocalStorage
let db = JSON.parse(localStorage.getItem('ppr_users')) || [];
let currentMode = 'login';

// 1. สลับหน้าจอ Login / Register
function switchTab(mode) {
    currentMode = mode;
    const title = document.getElementById('auth-title');
    const nameField = document.getElementById('name-field');
    const submitBtn = document.getElementById('submit-btn');
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(t => t.classList.remove('active'));
    if(mode === 'login') {
        tabs[0].classList.add('active');
        title.innerText = "ยินดีต้อนรับกลับมา";
        nameField.style.display = "none";
        submitBtn.innerText = "เข้าสู่ระบบ";
    } else {
        tabs[1].classList.add('active');
        title.innerText = "สร้างบัญชีใหม่";
        nameField.style.display = "block";
        submitBtn.innerText = "ยืนยันการสมัครสมาชิก";
    }
}

// 2. จัดการการสมัคร/เข้าสู่ระบบ
function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('user-email').value;
    const pass = document.getElementById('user-pass').value;
    const name = document.getElementById('user-name').value;

    if (currentMode === 'register') {
        // ตรวจสอบอีเมลซ้ำ
        if (db.find(u => u.email === email)) {
            alert("อีเมลนี้ถูกใช้งานแล้ว!");
            return;
        }
        // บันทึกยูสเซอร์ใหม่
        const newUser = { name, email, pass, pic: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}` };
        db.push(newUser);
        localStorage.setItem('ppr_users', JSON.stringify(db));
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        switchTab('login');
    } else {
        // ล็อกอิน
        const user = db.find(u => u.email === email && u.pass === pass);
        if (user) {
            sessionStorage.setItem("userName", user.name);
            sessionStorage.setItem("userPic", user.pic);
            alert(`สวัสดีคุณ ${user.name} ✨`);
            window.location.href = "index.html";
        } else {
            alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }
    }
}

// 3. จำลอง Facebook Login (กรณีเปลี่ยนใจมาใช้ระบบนี้แทน SDK)
function loginWithFacebook() {
    alert("ระบบกำลังเชื่อมต่อ Facebook API...");
    // ในสถานการณ์จริง จะใช้ FB.login() ตรงนี้
    // อันนี้จำลองว่าสำเร็จ:
    sessionStorage.setItem("userName", "Facebook User");
    sessionStorage.setItem("userPic", "https://i.pravatar.cc/150?u=fb");
    window.location.href = "index.html";
}