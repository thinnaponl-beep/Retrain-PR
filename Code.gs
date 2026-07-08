/**
 * Retrain Management System (RMS) - Backend (GAS)
 * พัฒนา/ปรับปรุงโดย: สมหมาย (Gustavoz)
 */

const FOLDER_ID = "1SvciPXYXUBVjr2rYNhiHS55cQgAH_3wb";

/**
 * 1. ฟังก์ชัน doGet สำหรับ Routing เปิดหน้าเว็บ (รองรับ Multi-page)
 */
function doGet(e) {
  let page = 'Index'; 
  
  if (e && e.parameter && e.parameter.page === 'report') {
    page = 'Report';
  }

  let template = HtmlService.createTemplateFromFile(page);

  return template
    .evaluate()
    .setTitle(page === 'Report' ? 'RMS - Report Dashboard' : 'Retrain Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 🌟 2. ฟังก์ชันขอ URL ปัจจุบันจาก Server (การันตีว่าโหมด Dev/Exec จะไม่หลอน) 🌟
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * 3. ฟังก์ชันอัปโหลดไฟล์ (รวมการจัดการ Error แบบครอบคลุม)
 */
function uploadFileNative(data) {
  try {
    const decodedFile = Utilities.base64Decode(data.fileBase64);
    const blob = Utilities.newBlob(decodedFile, data.mimeType, data.fileName);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    
    // จัดการเรื่องสิทธิ์องค์กร
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      console.warn("ไม่สามารถเปิดแชร์แบบสาธารณะได้ (ติดสิทธิ์องค์กร): " + shareErr.message);
    }

    return {
      status: "success",
      url: file.getUrl(),
      name: file.getName()
    };
  } catch (error) {
    console.error("Upload Error: " + error.message);
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * 4. ฟังก์ชันส่ง Slack (เชื่อมต่อกับ Slack API)
 */
function sendSlackNotificationNative(slackId, message) {
  if (!slackId || !message) return { status: 'error', message: 'Missing parameters' };
  
  const url = "https://slack.com/api/chat.postMessage";
  const payload = {
    channel: slackId,
    text: message
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + SLACK_BOT_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (!result.ok) {
      throw new Error(result.error);
    }
    return { status: 'success' };
  } catch (error) {
    console.error("Slack Error:", error.message);
    throw new Error("ส่ง Slack ไม่สำเร็จ: " + error.message);
  }
}
