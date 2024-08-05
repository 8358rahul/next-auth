import User from '@/models/userModel';
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';

type sendEmailProps = {
  email: String,
  emailType: 'VERIFY' | 'RESET',
  userId: number
}
export const sendEmail = async (props: sendEmailProps) => {
  const { email, emailType, userId } = props;
  try { 
    const token = await bcryptjs.hash(userId.toString(), 12);
    const updateData = {
      [emailType === 'VERIFY' ? 'verifyToken' : 'forgotPasswordToken']: token,
      [emailType === 'VERIFY' ? 'verifyTokenExpiry' : 'forgotPasswordTokenExpiry']: Date.now() + 3600000, // 1 hour expiry
    };
    
    await User.findByIdAndUpdate(userId, updateData); 
    var transport = nodemailer.createTransport({ 
      host: process.env.SMTP_HOST ,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
      }
    });
    const sender = {
      email:process.env.SENDER_EMAIL|| "mailtrap@demomailtrap.com",
      name:process.env.SENDER_NAME || "Mailtrap Test",
    };
    const recipients = [{email: email }]; 
    const mailOptions: any = {
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password", 
      html: `<p>Click on the link to ${emailType === 'VERIFY' ? "verify your email" : "reset your password"} <a href="${process.env.DOMAIN}/${emailType}?${token}">Click here</a></p>`,
    };
    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;

  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}