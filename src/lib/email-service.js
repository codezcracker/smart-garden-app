import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Use environment variables for email configuration
  // Supports multiple providers: Gmail, SendGrid, SMTP, etc.
  const emailConfig = {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  };

  // If using Gmail with app-specific password
  if (process.env.EMAIL_PROVIDER === 'gmail' && emailConfig.auth.user && emailConfig.auth.pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });
  }
  // If using SendGrid
  else if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  // Generic SMTP
  else if (emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  // Fallback: Use console logging if email not configured
  else {
    console.warn('Email not configured. Password reset emails will be logged to console.');
    transporter = {
      sendMail: async (options) => {
        console.log('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html
        });
        return { messageId: 'console-log', accepted: [options.to] };
      }
    };
  }

  return transporter;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken, resetUrl) {
  try {
    const transporter = getTransporter();
    const appName = process.env.APP_NAME || 'Smart Garden';
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3001';

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"${appName}" <noreply@smartgarden.com>`,
    to: email,
    subject: `Reset Your ${appName} Password`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🌱 ${appName}</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your ${appName} account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello,
      
      We received a request to reset your password for your ${appName} account.
      
      Click this link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this password reset, please ignore this email.
      
      © ${new Date().getFullYear()} ${appName}
    `
  };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email, firstName) {
  try {
    const transporter = getTransporter();
    const appName = process.env.APP_NAME || 'Smart Garden';
    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3001';

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${appName}" <noreply@smartgarden.com>`,
      to: email,
      subject: `Welcome to ${appName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🌱 ${appName}</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827; margin-top: 0;">Welcome, ${firstName}!</h2>
            <p>Thank you for joining ${appName}. We're excited to help you grow your smart garden.</p>
            <p>Get started by:</p>
            <ul>
              <li>Setting up your first device</li>
              <li>Configuring your garden</li>
              <li>Exploring our plant database</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/dashboard" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">If you have any questions, feel free to reach out to our support team.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}




