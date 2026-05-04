import nodemailer from 'nodemailer';

// Create a reusable transporter using Gmail.
// Requires GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.
// Generate an App Password at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send an enrollment status notification email to a student.
 * @param {object} options
 * @param {string} options.studentEmail - Recipient email address
 * @param {string} options.studentName  - Recipient display name
 * @param {string} options.courseName   - Name of the course
 * @param {string} options.unitCode     - Unit code of the course
 * @param {'approved'|'rejected'} options.status - New status
 */
export async function sendEnrollmentNotification({ studentEmail, studentName, courseName, unitCode, status }) {
  // Skip silently if email credentials are not configured.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email notification skipped: GMAIL_USER or GMAIL_APP_PASSWORD not set in .env');
    return;
  }

  const isApproved = status === 'approved';
  const subject = isApproved
    ? `✅ Enrolment Approved – ${unitCode}`
    : `❌ Enrolment Not Approved – ${unitCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'};">
        ${isApproved ? 'Enrolment Approved' : 'Enrolment Not Approved'}
      </h2>
      <p>Dear ${studentName},</p>
      <p>
        Your pre-enrolment preference for <strong>${courseName} (${unitCode})</strong> has been
        <strong style="color: ${isApproved ? '#16a34a' : '#dc2626'};">${status}</strong>.
      </p>
      ${isApproved
        ? `<p>You are now enrolled in this unit. Please check your student portal for further details.</p>`
        : `<p>Unfortunately your preference for this unit was not approved. Please contact your academic advisor if you have questions.</p>`
      }
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated message from the CIHE Pre-Enrolment System. Please do not reply to this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"CIHE Pre-Enrolment" <${process.env.GMAIL_USER}>`,
    to: studentEmail,
    subject,
    html,
  });

  console.log(`Enrolment notification sent to ${studentEmail} — ${status}`);
}
