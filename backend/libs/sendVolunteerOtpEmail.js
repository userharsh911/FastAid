import { Resend } from "resend";

const buildVolunteerOtpHtml = ({ otpCode, expiryMinutes }) => {
    return `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
            <h2 style="margin:0 0 12px;color:#111827;">Verify Your Volunteer Account</h2>
            <p style="margin:0 0 12px;color:#374151;">Use the OTP below to verify your email address.</p>
            <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#dc2626;margin:16px 0;">${otpCode}</div>
            <p style="margin:0 0 8px;color:#4b5563;">This OTP will expire in ${expiryMinutes} minutes.</p>
            <p style="margin:0;color:#6b7280;font-size:12px;">If you did not request this, you can ignore this email.</p>
        </div>
    `;
};

export const sendVolunteerOtpEmail = async ({ email, otpCode, expiryMinutes }) => {
    const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
    const resendFromEmail = String(process.env.RESEND_FROM_EMAIL || "").trim();

    if (!resendApiKey || !resendFromEmail) {
        throw new Error("OTP email service is not configured");
    }

    const resendClient = new Resend(resendApiKey);

    const { error } = await resendClient.emails.send({
        from: resendFromEmail,
        to: email,
        subject: "Your Volunteer OTP - Emergent Guardian",
        html: buildVolunteerOtpHtml({ otpCode, expiryMinutes }),
        text: `Your volunteer verification OTP is ${otpCode}. It expires in ${expiryMinutes} minutes.`,
    });

    if (error) {
        const resendErrorMessage = typeof error?.message === "string" ? error.message : "Failed to send OTP email";
        throw new Error(resendErrorMessage);
    }
};
