// Email service using Resend
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

/**
 * Send email using Resend
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to ACT Prep, ${name}!</h2>
      <p>Thank you for joining our ACT preparation platform. You're now ready to start practicing and improving your test scores.</p>
      <p>Get started by selecting a subject and test mode to begin your practice sessions.</p>
      <div style="margin: 20px 0;">
        <a href="https://act-prep-web.vercel.app/test-selection" 
           style="background: #007aff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Start Practicing
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you have any questions, feel free to reach out to our support team.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to ACT Prep!',
    html,
  });
};

/**
 * Send test completion email
 */
export const sendTestCompletionEmail = async (email: string, name: string, subject: string, score: number) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Test Completed, ${name}!</h2>
      <p>Great job completing your ${subject} practice test!</p>
      <div style="background: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Your Score: ${score}%</h3>
        <p style="margin: 0; color: #666;">Keep practicing to improve your performance!</p>
      </div>
      <div style="margin: 20px 0;">
        <a href="https://act-prep-web.vercel.app/dashboard" 
           style="background: #007aff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          View Results
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `${subject} Test Completed - Score: ${score}%`,
    html,
  });
};
