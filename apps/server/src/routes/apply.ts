import { Router } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { createValidator } from '../middleware/validation';

const router = Router();

const applySchema = z.object({
  studentName: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  schoolEmail: z.string().email('Invalid email address').endsWith('.ng', 'Must be a Nigerian school email'),
  rationale: z.string().min(10, 'Please write at least 10 characters').max(1000).trim(),
  socialLinks: z.string().max(500).trim().optional().default(''),
});

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

router.post(
  '/apply',
  createValidator(applySchema),
  async (req, res) => {
    const { studentName, schoolEmail, rationale, socialLinks } = req.body;

    const mailOptions = {
      from: '"Grind Creator App" <no-reply@grind.market>',
      to: process.env.ADMIN_EMAIL || 'goodnessiyamah1@gmail.com',
      subject: `New Creator Application — ${studentName}`,
      html: `
        <h2>New Creator Application</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%">
          <tr><td><strong>Name</strong></td><td>${studentName}</td></tr>
          <tr><td><strong>School Email</strong></td><td>${schoolEmail}</td></tr>
          <tr><td><strong>Rationale</strong></td><td>${rationale}</td></tr>
          <tr><td><strong>Social Links</strong></td><td>${socialLinks || 'None provided'}</td></tr>
        </table>
      `,
    };

    try {
      const transporter = getTransporter();
      if (transporter) {
        await transporter.sendMail(mailOptions);
      } else {
        // Log to console in dev/demo mode when email env vars aren't set
        console.log('Creator application (email not configured):', { studentName, schoolEmail });
      }

      res.status(200).json({
        success: true,
        message: 'Application submitted successfully. You will hear back within 48 hours.',
      });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to submit application. Please try again.' });
    }
  }
);

export default router;
