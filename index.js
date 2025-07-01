const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const axios = require('axios');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., your form HTML)  
app.use(express.static(path.join(__dirname, 'public')));

// Load email HTML template once at startup
const htmlPath = path.join(__dirname, 'mail.html');
let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');

app.get('/', (req, res) => {
  res.send('API is working!');
});


app.post('/auth', async (req, res) => {
  const { email, appPassword } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: appPassword,
    }
  });

  try {
    // Use verify to test credentials (no email sent)
    await transporter.verify();
    res.json({ success: true });
  } catch (err) {
    console.error("Gmail auth failed:", err);
    res.json({ success: false });
  }
});



app.post('/send', async (req, res) => {
  const { clientName, sendername, desg, email, admin, auth, cc } = req.body;

  if (!clientName || !sendername || !desg || !email || !admin || !auth) {
    return res.status(400).send('Missing required fields.');
  }

  try {
    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: admin,
        pass: auth, // Use your Gmail App Password here
      },
    });

    // Replace placeholders in HTML template
    const htmlContent = htmlTemplate
      .replace('{{clientName}}', clientName)
      .replace('{{sendername}}', sendername)
      .replace('{{desg}}', desg);

    // Prepare CC field if provided
    let ccList = undefined;
    if (cc) {
      if (Array.isArray(cc)) {
        ccList = cc;
      } else if (typeof cc === 'string') {
        ccList = cc.split(',').map(addr => addr.trim()).filter(Boolean);
      }
      console.log('CC List:', ccList);
    }

    // Send mail
    let info = await transporter.sendMail({
      from: admin, // Use the admin Gmail address as sender
      to: email,
      cc: ccList && ccList.length > 0 ? ccList : undefined,
      subject: `Celebrating  25th Anniversary of Suma Soft`,
      html: htmlContent,
 attachments: [
    {
      filename: "Asset-2.png",
      path: "./Asset-2.png", // relative or absolute path
      cid: "logoimg", // this must match the 'cid' in <img src="cid:...">
    },  
    {
      filename: "Asset-3.png",
      path: "./Asset-3.png",
      cid: "sumacelebration"
    },
  ],

    });


    const userFile = path.join(__dirname, 'users', `${admin}.json`);
console.log("User file path:", userFile);

// Ensure 'users' directory exists
const usersDir = path.dirname(userFile);
if (!fs.existsSync(usersDir)) {
  fs.mkdirSync(usersDir, { recursive: true });
}

// Try to read or initialize the file
let userData = {};
if (fs.existsSync(userFile)) {
  try {
    const fileContent = fs.readFileSync(userFile, 'utf-8');
    userData = fileContent.trim() === '' ? {} : JSON.parse(fileContent);
  } catch (err) {
    console.warn("Invalid JSON. Reinitializing file.");
    userData = {};
  }
}

// Ensure mails array exists
if (!Array.isArray(userData.mails)) userData.mails = [];

// Add new mail entry
userData.mails.push({
  to: email,
  clientName,
  sendername,
  desg,
  subject: `Thanking you for Your Invaluable Contribution to Our Growth`,
  sentAt: new Date().toISOString(),
  messageId: info.messageId,
  cc: ccList && ccList.length > 0 ? ccList : undefined
});

// Write updated data
try {
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
  console.log("? Mail record saved.");
} catch (err) {
  console.error("? Error writing user file:", err.message);
}

   

    console.log('Email sent:', info.messageId);
    res.send(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email.');
  }
});


//email verifier
app.get('/verify', async (req, res) => {
  const email = req.query.email;
  const apiKey = process.env.HUNTER_API_KEY;

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required' });
  }

  try {
    const response = await axios.get('https://api.hunter.io/v2/email-verifier', {
      params: {
        email: email,
        api_key: apiKey,
      },
    });

    res.json({
      email: response.data.data.email,
      result: response.data.data.result, // deliverable, risky, etc.
      score: response.data.data.score,
      first_name: response.data.data.first_name,
      last_name: response.data.data.last_name,
      domain: response.data.data.domain,
    });
  } catch (error) {
    console.error('Hunter API error:', error.message);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});



app.get('/verify2', async (req, res) => {
  const email = req.query.email;
  const apiKey = process.env.ABSTRACT_API_KEY;

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required' });
  }
  const axios = require('axios');
              axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`)
                  .then(response => {
                      console.log(response.data);
                  })
                  .catch(error => {
                      console.log(error);
                  });
  });



app.post('/create-user-file', (req, res) => {
  const { userid } = req.body;
  if (!userid) return res.status(400).json({ message: "Missing userid" });

  const fileName = `${userid}.json`;
  const filePath = path.join(__dirname, 'users', fileName);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    return res.json({ message: "User file already exists" });
  }

  // Create new JSON file
  const initialData = { userid, createdAt: new Date().toISOString() };

  fs.writeFile(filePath, JSON.stringify(initialData, null, 2), (err) => {
    if (err) return res.status(500).json({ message: "Failed to create file" });
    res.json({ message: "User file created" });
  });
});



// Get all users' JSON data
app.get('/get-all-users', (req, res) => {
  const dirPath = path.join(__dirname, 'users');
  fs.readdir(dirPath, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read directory." });

    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const allData = [];

    jsonFiles.forEach(file => {
      const filePath = path.join(dirPath, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allData.push(content);
    });

    res.json(allData);
  });
});

// Get specific user JSON by email
app.get('/get-user/:email', (req, res) => {
  const email = req.params.email;
  const filePath = path.join(__dirname, 'users', `${email}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "User not found" });
  }

  const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  res.json(userData);
});

// Endpoint to get all unique email suggestions from user files


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
