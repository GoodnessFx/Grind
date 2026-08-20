import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

// TODO: Move this to environment variables for production
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'placeholder@gmail.com',
    pass: process.env.EMAIL_PASS || 'placeholder',
  },
});

router.post('/apply', async (req, res) => {
  const { studentName, schoolEmail, rationale, socialLinks } = req.body;

  if (!schoolEmail) {
    return res.status(400).json({ error: 'School email is required for creator verification.' });
  }

  const mailOptions = {
    from: '"Grind Creator App" <no-reply@grind.app>',
    to: 'goodnessiyamah1@gmail.com',
    subject: `New Creator Application from ${studentName}`,
    text: `
      New Creator Application Received!
      
      Name: ${studentName}
      School Email: ${schoolEmail}
      Rationale: ${rationale}
      Social Links: ${socialLinks}
      
      Please review and verify this user in the admin dashboard.
    `,
  };

  try {
    // Send email to admin
    await transporter.sendMail(mailOptions);
    
    // TODO: Actually save the application state to the Database (Supabase) 
    // pending verification by goodnessiyamah1@gmail.com
    
    res.status(200).json({ message: 'Application submitted successfully. Waiting for admin approval.' });
  } catch (error) {
    console.error('Error sending application email:', error);
    res.status(500).json({ error: 'Failed to submit application. Please try again later.' });
  }
});

export default router;
