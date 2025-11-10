"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvitationEmail = sendInvitationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'michael@clozone.ai',
        pass: 'sqvk fyzb vdvh fhqa'
    }
});
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter error:', error);
    }
    else {
        console.log('✅ Email server is ready to send emails');
    }
});
async function sendInvitationEmail(data) {
    const { to, organizationName, inviterName, role, inviteUrl } = data;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${organizationName} on Clozone</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with Brand Color -->
          <tr>
            <td style="background: linear-gradient(135deg, #f26f25, #d95e1e); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                You're Invited!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Join ${organizationName} on Clozone
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                Welcome to the Team!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Clozone as ${role === 'admin' ? 'an Administrator' : 'a Team Member'}.
              </p>

              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Clozone is an AI-powered sales training platform that helps teams practice and perfect their sales conversations with realistic AI customers.
              </p>

              <!-- Role Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 8px 20px; background-color: ${role === 'admin' ? '#9333ea' : '#3b82f6'}; color: #ffffff; border-radius: 20px; font-size: 14px; font-weight: 600;">
                      ${role === 'admin' ? '👑 Admin Access' : '👤 Team Member'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding: 25px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                      📋 How to get started:
                    </p>
                    <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.8;">
                      1. Click the "Accept Invitation" button below<br>
                      2. Click "Sign Up" to create your account<br>
                      3. Enter <strong>${to}</strong> as your email<br>
                      4. Complete the registration process
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" 
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #f26f25, #d95e1e); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(242, 111, 37, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; color: #f26f25; font-size: 13px; word-break: break-all;">
                ${inviteUrl}
              </p>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                      <strong>🔒 Note:</strong> This invitation is specifically for <strong>${to}</strong>. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; text-align: center;">
                Questions? Contact us at <a href="mailto:michael@clozone.ai" style="color: #f26f25; text-decoration: none;">michael@clozone.ai</a>
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Clozone. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <!-- Additional Note -->
        <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px; text-align: center; max-width: 600px;">
          This invitation was sent to ${to} from ${organizationName} via Clozone
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
    try {
        await transporter.sendMail({
            from: '"Clozone" <michael@clozone.ai>',
            to: to,
            subject: `You've been invited to join ${organizationName} on Clozone`,
            html: emailHtml
        });
        console.log(`✅ Invitation email sent to ${to}`);
    }
    catch (error) {
        console.error('❌ Error sending invitation email:', error);
        throw error;
    }
}
exports.default = {
    sendInvitationEmail
};
//# sourceMappingURL=email.js.map