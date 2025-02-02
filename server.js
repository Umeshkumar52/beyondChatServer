const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { log } = require("console");
const port = 5000;
app.use(bodyParser.json());
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Dummy data simulating a web scraping result
const dummyScrapedData = [
  {
    id: 1,
    url: "http://localhost:3000/home",
    status: "Completed",
    content: "This is the content of the first scraped post.",
  },
  {
    id: 2,
    url: "http://localhost:3000/about",
    status: "Completed",
    content: "Content for the second scraped post.",
  },
  {
    id: 3,
    url: "http://localhost:3000/profile",
    status: "Processing",
    content: "Fetching data...",
  },
  {
    id: 4,
    url: "http://localhost:3000/carear",
    status: "pending",
    content: "This is the content of the fourth scraped post.",
  },
  {
    id: 5,
    url: "http://localhost:3000/blogs",
    status: "pending",
    content: "Content for the fifth scraped post.",
  },
];
let otp_store = {};
let organisationdata = [];
// API endpoint simulating a scrape result
app.get("/scrape", async (req, res) => {
  res.json(dummyScrapedData);
});
app.post("/sendmail", async (req, res) => {
  try {   
    const { email } = req.body;
    let transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "BeyondChats Chatbot Integration",
      html: `
        <p>Dear Developer,</p>
        <p>Integrate the chatbot by adding the following script in your website's <head>:</p>
        <pre><code>&lt;script src="https://your-chatbot-url.com/chatbot.js" async&gt;&lt;/script&gt;</code></pre>
        <p>After integration, click on the "Test Integration" button in your admin panel.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      status: "Success",
      message: `Instructions Sent to ${email} Successfully`,
    });
  } catch (error) {
   return res.status(500).json({ message: "Failed to send email instruction" });
  }
});
// send otp
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = crypto.randomInt(1000, 9999).toString();
  // otp expire in 5 minet
  otp_store[email] = {
    otp,
    expireAt: Date.now() + 5 * 60 * 1000,
  };
  // email transporter  
  const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  // mail option
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Your otp code`,
    text: `You OTP code is ${otp} .It is valid only for 5 minets`,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "OTP Send Successfully",
    });
  } catch (error) {
    res.status(201).json({      
      message: "Error Sending OTP",
    });
  }
});
// verify otp
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!otp_store[email]){
  return res.status(400).json({
    message: "Invalid OTP",
  });
  }  
  const { otp: storedotp, expireAt } = otp_store[email];
  if (Date.now > expireAt){
       return res.status(400).json({
    message: "OTP expired !",
  })}
  if (otp == storedotp) {
    delete otp_store[email];
    return res.status(200).json({
      message: "OTP Verified Successfully",
    });
  } else {
    return res.status(200).json({
      message: "Invalid OTP",
    });
  }
});
app.post("/organisationdata", (req, res) => {
  organisationdata.push(req.body);
  console.log(req.body);
  res.json({
    status: "successfully saved",
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
