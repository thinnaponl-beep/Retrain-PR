/**
 * Retrain Management System (RMS) - Backend (GAS)
 * พัฒนาโดย: สมหมาย (Gustavoz)
 */

// ⚠️ สำคัญ: นำ ID ของโฟลเดอร์ Google Drive ที่ต้องการให้ไฟล์ไปเซฟมาใส่ตรงนี้
const FOLDER_ID = "1SvciPXYXUBVjr2rYNhiHS55cQgAH_3wb";

/**
 * 1. ฟังก์ชัน doGet ทำหน้าที่แสดงผลหน้าเว็บ (UI) เมื่อมีคนเข้าลิงก์ Web App
 * (หมายเหตุ: ไฟล์ HTML หลักของคุณใน GAS ต้องตั้งชื่อว่า 'index' หรือเปลี่ยนชื่อในวงเล็บด้านล่างให้ตรงกัน)
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Retrain Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadFileNative(data) {
  try {
    const decodedFile = Utilities.base64Decode(data.fileBase64);
    const blob = Utilities.newBlob(decodedFile, data.mimeType, data.fileName);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      status: "success",
      url: file.getUrl(),
      name: file.getName()
    };
  } catch (error) {
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * 2. ฟังก์ชัน doPost ทำหน้าที่รับไฟล์จากหน้าเว็บไปเก็บใน Google Drive
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("ไม่มีข้อมูลส่งมาถึง Server");
    }

    const data = JSON.parse(e.postData.contents);
    const fileBase64 = data.fileBase64;
    const fileName = data.fileName;
    const mimeType = data.mimeType;

    if (!fileBase64 || !fileName) {
      throw new Error("ข้อมูลไฟล์ไม่ครบถ้วน (ต้องการ Base64 และ ชื่อไฟล์)");
    }

    // แปลงรหัส Base64 กลับเป็นไฟล์
    const decodedFile = Utilities.base64Decode(fileBase64);
    const blob = Utilities.newBlob(decodedFile, mimeType, fileName);

    // บันทึกไฟล์ลง Google Drive ตาม Folder ID
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    
    // เปิดสิทธิ์ให้ใครก็ตามที่มีลิงก์สามารถดูไฟล์นี้ได้
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // ส่ง URL ของไฟล์กลับไปให้หน้าเว็บ
    const responseData = {
      status: "success",
      url: file.getUrl(),
      id: file.getId(),
      name: file.getName(),
      size: file.getSize()
    };

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResponse = {
      status: "error",
      message: error.toString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. ฟังก์ชัน Helper สำหรับเรียกใช้ไฟล์ HTML ย่อย (Templating)
 * ฟังก์ชันนี้จำเป็นมากสำหรับคำสั่ง <?!= include('Sidebar'); ?> ในหน้า index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function uploadFileNative(data) {
  try {
    const decodedFile = Utilities.base64Decode(data.fileBase64);
    const blob = Utilities.newBlob(decodedFile, data.mimeType, data.fileName);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    
    // 🟢 เอา try-catch มาครอบตรงนี้ ถ้าองค์กรบล็อคก็ให้ข้ามไปเลย ไฟล์จะได้ส่งผ่าน
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      console.log("ไม่สามารถเปิดแชร์แบบสาธารณะได้ (ติดสิทธิ์องค์กร)");
    }

    return {
      status: "success",
      url: file.getUrl(),
      name: file.getName()
    };
  } catch (error) {
    return {
      status: "error",
      message: error.toString()
    };
  }
}
