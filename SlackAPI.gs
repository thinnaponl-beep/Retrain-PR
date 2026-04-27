/**
 * 🚀 Slack API - Backend Logic
 * ไฟล์สำหรับยิง API เข้า Slack โดยตรง (ไม่ต้องมี UI)
 */

// 🔴 เอา Bot Token ของ Slack App มาใส่ที่นี่ (เริ่มด้วย xoxb-...)
const SLACK_BOT_TOKEN = ""; 

/**
 * ฟังก์ชันสำหรับรับคำสั่งจากหน้าเว็บแล้วยิงเข้าแชทส่วนตัว (DM)
 */
function sendSlackNotificationNative(slackUserId, message) {
  try {
    if (!SLACK_BOT_TOKEN || SLACK_BOT_TOKEN.includes("YOUR-SLACK-BOT")) {
      throw new Error("ยังไม่ได้ตั้งค่า SLACK_BOT_TOKEN ในไฟล์ SlackAPI.gs");
    }

    const payload = {
      "channel": slackUserId, // รหัส User ID (เช่น U0123ABCD) จะส่งเข้า DM ให้คนๆ นั้นทันที
      "text": message,
      "as_user": true
    };

    

    const options = {
      "method": "post",
      "contentType": "application/json",
      "headers": {
        "Authorization": "Bearer " + SLACK_BOT_TOKEN
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", options);
    const result = JSON.parse(response.getContentText());

    if (result.ok) {
      return { status: "success", message: "ส่งแจ้งเตือนสำเร็จ" };
    } else {
      throw new Error("Slack Error: " + result.error);
    }

  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

function testSlackBot() {
  // 🔴 เปลี่ยนรหัส U... ด้านล่างนี้ ให้เป็น Slack Member ID ของคุณเอง
  var mySlackId = "U05N8DE0GMS"; 
  
  var result = sendSlackNotificationNative(mySlackId, "🚀 ทดสอบยิงบอทจาก Apps Script!");
  
  // พิมพ์ผลลัพธ์ออกมาดูใน Log
  Logger.log(result); 
}
