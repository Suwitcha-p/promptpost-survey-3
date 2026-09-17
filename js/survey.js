let currentStep = 0;
const steps = document.querySelectorAll('.step');

function showStep(n) {
    steps.forEach((step, index) => {
        step.classList.remove('active');
        if (index === n) step.classList.add('active');
    });
    
    document.getElementById('prevBtn').style.display = n === 0 ? 'none' : 'inline-block';
    
    if (n === (steps.length - 1)) {
        document.getElementById('nextBtn').innerHTML = 'ส่งแบบสอบถาม';
        document.getElementById('nextBtn').classList.replace('btn-primary', 'btn-submit');
    } else {
        document.getElementById('nextBtn').innerHTML = 'ถัดไป';
        document.getElementById('nextBtn').classList.replace('btn-submit', 'btn-primary');
    }
    updateProgress();
}

function updateProgress() {
    const percent = ((currentStep + 1) / steps.length) * 100;
    document.getElementById('progressBar').style.width = percent + '%';
}

function nextPrev(n) {
    if (n == 1 && !validateForm()) return false;

    // ระบบ Screening (Terminate) ในส่วนที่ 1
    if (currentStep === 0 && n === 1) {
        const age = document.querySelector('input[name="q1_1"]:checked').value;
        const status = document.querySelector('input[name="q1_2"]:checked').value;
        
        // ถ้าน้อยกว่า 21, มากกว่า 25 หรือทำงานเกิน 1 ปี -> Terminate
        if (age === '<21' || age === '>25' || status === 'worked_>1y') {
            document.getElementById('surveyForm').style.display = 'none';
            document.getElementById('progressContainer').style.display = 'none';
            document.getElementById('terminateScreen').classList.remove('hidden');
            return false;
        }
    }

    currentStep = currentStep + n;

    if (currentStep >= steps.length) {
        submitForm();
        return false;
    }
    showStep(currentStep);
}

function validateForm() {
    let valid = true;
    const currentTab = steps[currentStep];
    const requiredInputs = currentTab.querySelectorAll('input[required], textarea[required]');
    
    // รีเซ็ตสีแดง
    currentTab.querySelectorAll('.question').forEach(q => q.classList.remove('error'));

    // ตรวจสอบว่า Radio/Checkbox ที่ required ถูกเลือกหรือไม่
    const radioGroups = new Set();
    requiredInputs.forEach(input => {
        if(input.type === 'radio' || input.type === 'checkbox') {
            radioGroups.add(input.name);
        }
    });

    radioGroups.forEach(name => {
        const checked = currentTab.querySelector(`input[name="${name}"]:checked`);
        if(!checked) {
            valid = false;
            currentTab.querySelector(`input[name="${name}"]`).closest('.question').classList.add('error');
        }
    });

    if(!valid) alert("กรุณาตอบคำถามที่มีเครื่องหมาย * ให้ครบถ้วน");
    return valid;
}

// จำกัดการเลือก Checkbox ในส่วนที่ 5 (ได้สูงสุด 2 ข้อ)
document.addEventListener('change', function(e) {
    if(e.target.name === 'q5_1') { // สมมติชื่อ name ของข้อส่วนที่ 5 คือ q5_1
        const checkedCount = document.querySelectorAll('input[name="q5_1"]:checked').length;
        if(checkedCount > 2) {
            e.target.checked = false;
            alert("เลือกได้สูงสุด 2 ข้อเท่านั้นครับ");
        }
    }
});

function toggleOther(radio, inputId, forceShow = false) {
    const input = document.getElementById(inputId);
    if (radio.value === 'other' || radio.value === 'ever' || forceShow) {
        input.style.display = 'block';
        input.required = true;
    } else {
        input.style.display = 'none';
        input.required = false;
        input.value = '';
    }
}

function toggleOtherCheckbox(checkbox, inputId) {
    const input = document.getElementById(inputId);
    if (checkbox.checked) {
        input.style.display = 'block';
        input.required = true;
    } else {
        input.style.display = 'none';
        input.required = false;
        input.value = '';
    }
}

function submitForm() {
    const formData = new FormData(document.getElementById('surveyForm'));
    const dataObj = Object.fromEntries(formData.entries());
    
    // บันทึกแบบ Array ใน LocalStorage เพื่อให้ Admin ดึงไปใช้
    let existingData = JSON.parse(localStorage.getItem('surveyData')) || [];
    dataObj.timestamp = new Date().toLocaleString();
    existingData.push(dataObj);
    localStorage.setItem('surveyData', JSON.stringify(existingData));

    // ซ่อนฟอร์ม โชว์หน้า Thank You
    document.getElementById('surveyForm').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('thankYouScreen').classList.remove('hidden');
}

// ระบบกดเข้า Admin มุมขวาบน
function adminLogin() {
    const pass = prompt("🔑 กรุณากรอกรหัสผ่าน Admin:");
    if (pass === "0637941837") {
        window.location.href = "admin.html";
    } else if (pass !== null && pass !== "") {
        alert("❌ รหัสผ่านไม่ถูกต้อง");
    }
}

showStep(currentStep);
