// =========================================================
// เลือกคำตอบแบบเลือกได้ 1 ข้อ
// =========================================================
function selectSingle(element, hasInput = false) {
  const parent = element.closest(".options-list");

  if (!parent) return;

  // ยกเลิกตัวเลือกเดิมทั้งหมด
  parent.querySelectorAll(".option-item").forEach(item => {
    item.classList.remove("selected");
  });

  // เลือกตัวเลือกที่กด
  element.classList.add("selected");

  const fieldName = parent.getAttribute("data-name");
  const textElement = element.querySelector(".option-text");

  if (!fieldName || !textElement) return;

  // อ่านข้อความของตัวเลือก
  let value = "";

  // กรณี option-text มี input อยู่ข้างใน
  if (fieldName === "lostDocExp") {
    value = textElement.childNodes[0]?.textContent.trim() || "";
  } else {
    value = textElement.innerText.trim();
  }

  surveyData[fieldName] = value;

  // =======================================================
  // ข้อ 2.2 : เอกสารสำคัญสูญหาย / ค้นหาไม่พบ
  // =======================================================
  if (fieldName === "lostDocExp") {

    const detailInput = document.getElementById("lost-doc-detail");

    if (!detailInput) return;

    // -------------------------------------------------------
    // เลือก "เคยประสบปัญหา"
    // -------------------------------------------------------
    if (value === "เคยประสบปัญหา") {

      detailInput.style.display = "block";
      detailInput.disabled = false;
      detailInput.required = true;

      // ให้ช่องกรอกใช้งานได้
      setTimeout(() => {
        detailInput.focus();
      }, 50);

    }

    // -------------------------------------------------------
    // เลือก "ไม่เคยประสบปัญหา"
    // -------------------------------------------------------
    else if (value === "ไม่เคยประสบปัญหา") {

      // ล้างข้อความเดิม
      detailInput.value = "";

      // ปิดช่อง
      detailInput.style.display = "none";
      detailInput.disabled = true;
      detailInput.required = false;

      // ล้างข้อมูลรายละเอียดด้วย
      surveyData.lostDocExp = "ไม่เคยประสบปัญหา";
    }
  }
}
