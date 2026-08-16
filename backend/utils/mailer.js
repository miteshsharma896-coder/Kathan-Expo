const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

async function sendQuoteNotification({ to, quote, product }) {
  if (!to || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log('[mailer] Email not configured — skipping notification.');
    return;
  }
  const transporter = createTransporter();
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A18;">
    <div style="background:#1A1A18;padding:24px 28px;">
      <h1 style="color:#C9A84C;font-size:20px;margin:0;">Yatharth Emerald Stones</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0 0;">New quote request received</p>
    </div>
    <div style="padding:28px;background:#FAFAF7;border:1px solid #e8e6e0;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;width:40%;">Product</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;font-weight:600;">${product}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;">Customer name</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;">${quote.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;">${quote.phone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;">Quantity</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;">${quote.qty} sq. ft.</td></tr>
        <tr><td style="padding:10px 0;color:#8A8880;">Message</td><td style="padding:10px 0;">${quote.message || '—'}</td></tr>
      </table>
      <div style="margin-top:24px;padding:16px;background:#fff;border-left:3px solid #C9A84C;">
        <p style="margin:0;font-size:13px;color:#8A8880;">Received at</p>
        <p style="margin:4px 0 0;font-size:14px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
    </div>
    <div style="padding:16px 28px;background:#F0EFE8;font-size:12px;color:#8A8880;">Log in to the admin panel to view all quote requests.</div>
  </div>`;
  await transporter.sendMail({
    from: `"Yatharth Emerald Stones" <${process.env.MAIL_USER}>`,
    to,
    subject: `New quote request — ${product}`,
    html,
  });
  console.log(`[mailer] Quote notification sent to ${to}`);
}

async function sendContactNotification({ to, message }) {
  if (!to || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.log('[mailer] Email not configured — skipping notification.');
    return;
  }
  const transporter = createTransporter();
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A18;">
    <div style="background:#1A1A18;padding:24px 28px;">
      <h1 style="color:#C9A84C;font-size:20px;margin:0;">Yatharth Emerald Stones</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0 0;">New contact message received</p>
    </div>
    <div style="padding:28px;background:#FAFAF7;border:1px solid #e8e6e0;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;width:40%;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;font-weight:600;">${message.name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;">${message.phone}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;color:#8A8880;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8e6e0;">${message.email}</td></tr>
        <tr><td style="padding:10px 0;color:#8A8880;">Message</td><td style="padding:10px 0;">${message.message}</td></tr>
      </table>
    </div>
    <div style="padding:16px 28px;background:#F0EFE8;font-size:12px;color:#8A8880;">Log in to the admin panel to view all messages.</div>
  </div>`;
  await transporter.sendMail({
    from: `"Yatharth Emerald Stones" <${process.env.MAIL_USER}>`,
    to,
    subject: `New contact message — ${message.name}`,
    html,
  });
  console.log(`[mailer] Contact notification sent to ${to}`);
}

module.exports = { sendQuoteNotification, sendContactNotification };
