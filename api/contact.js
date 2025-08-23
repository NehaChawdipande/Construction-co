// This is an example of a serverless function in Node.js
// It uses Express for routing and Nodemailer to send emails.

// First, you need to install the required packages:
// npm install express nodemailer body-parser

// In a real-world application, you would configure this as an
// API endpoint on a service like Vercel, AWS Lambda, or a simple Node.js server.

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Set up CORS (Cross-Origin Resource Sharing) headers
// This is necessary to allow your React app to make requests to this API.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all domains. For security, change '*' to your website's domain.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Define the API endpoint to handle the form submission.
// This endpoint URL should match the `apiEndpoint` variable in your React component.
app.post('/api/contact', async (req, res) => {
  // Extract data from the request body.
  const { name, email, message } = req.body;

  // Basic validation to ensure all fields are present.
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Create a Nodemailer transporter.
    // This is the object that will send the email.
    // You need to replace the placeholders with your own email service credentials.
    const transporter = nodemailer.createTransport({
      // Example: Using Gmail as a service.
      // You can use other services like Outlook, Yahoo, etc., or an SMTP server.
      service: 'Gmail',
      auth: {
        // You'll need to set up an "App Password" for Gmail for this to work.
        // It's a much more secure way than using your regular password.
        user: 'YOUR_EMAIL_ADDRESS@gmail.com', // Replace with your email address
        pass: 'YOUR_EMAIL_PASSWORD', // Replace with your generated app password
      },
    });

    // 2. Define the email content.
    const mailOptions = {
      from: email, // Sender's email from the form
      to: 'OWNER_EMAIL_ADDRESS@example.com', // Replace with the owner's email address
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <p>You have a new contact request:</p>
        <h3>Contact Details</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <h3>Message</h3>
        <p>${message}</p>
      `,
    };

    // 3. Send the email using the transporter.
    await transporter.sendMail(mailOptions);

    // If the email is sent successfully, return a success message.
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// A simple root endpoint for testing if the API is running.
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Contact API is running!' });
});

// This is for local testing. In a serverless environment, the platform
// handles starting the server.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
