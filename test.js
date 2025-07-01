const fs = require('fs');
const path = require('path');

// Define your variables
const admin = 'adminname'; // e.g., 'john'
const email = 'someone@example.com';
const clientName = 'ACME Corp';
const sendername = 'John Doe';
const desg = 'Manager';
const info = { messageId: '123456@domain.com' }; // Example info object

const userFile = path.join(__dirname, 'users', `${admin}.json`);
console.log("User file path:", userFile);

if (fs.existsSync(userFile)) {
  try {
    // Read and parse user data
    const fileContent = fs.readFileSync(userFile, 'utf-8');
    const userData = JSON.parse(fileContent);

    // Ensure mails array exists
    if (!Array.isArray(userData.mails)) userData.mails = [];

    // Push new email entry
    userData.mails.push({
      to: email,
      clientName,
      sendername,
      desg,
      subject: `Thanking you for Your Invaluable Contribution to Our Growth`,
      sentAt: new Date().toISOString(),
      messageId: info.messageId
    });

    // Write updated data
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
    console.log("Mail record saved successfully.");
  } catch (err) {
    console.error("Error reading or writing user file:", err.message);
  }
} else {
  console.error("User file does not exist:", userFile);
}