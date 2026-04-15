import { Resend } from "resend";

const OTP_EMAIL_PURPOSE = {
    VERIFY_ACCOUNT: "verify-account",
    RESET_PASSWORD: "reset-password",
};

const getOtpEmailMeta = (purpose) => {
    if (purpose === OTP_EMAIL_PURPOSE.RESET_PASSWORD) {
        return {
            subject: "Password Reset OTP - Emergent Guardian",
            heading: "Reset Your Volunteer Password",
            intro: "Use the OTP below to reset your volunteer account password.",
            footer: "If you did not request a password reset, you can ignore this email.",
        };
    }

    return {
        subject: "Your Volunteer OTP - Emergent Guardian",
        heading: "Verify Your Volunteer Account",
        intro: "Use the OTP below to verify your email address.",
        footer: "If you did not request this, you can ignore this email.",
    };
};

const buildVolunteerOtpHtml = ({ otpCode, expiryMinutes, purpose }) => {
    const emailMeta = getOtpEmailMeta(purpose);

    return `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
            <h2 style="margin:0 0 12px;color:#111827;">${emailMeta.heading}</h2>
            <p style="margin:0 0 12px;color:#374151;">${emailMeta.intro}</p>
            <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#dc2626;margin:16px 0;">${otpCode}</div>
            <p style="margin:0 0 8px;color:#4b5563;">This OTP will expire in ${expiryMinutes} minutes.</p>
            <p style="margin:0;color:#6b7280;font-size:12px;">${emailMeta.footer}</p>
        </div>
    `;
};

export const sendVolunteerOtpEmail = async ({ email, otpCode, expiryMinutes, purpose = OTP_EMAIL_PURPOSE.VERIFY_ACCOUNT }) => {
    const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
    const resendFromEmail = String(process.env.RESEND_FROM_EMAIL || "").trim();
    const emailMeta = getOtpEmailMeta(purpose);

    if (!resendApiKey || !resendFromEmail) {
        throw new Error("OTP email service is not configured");
    }

    const resendClient = new Resend(resendApiKey);

    const { error } = await resendClient.emails.send({
        from: resendFromEmail,
        to: email,
        subject: emailMeta.subject,
        html: buildVolunteerOtpHtml({ otpCode, expiryMinutes, purpose }),
        text: `${emailMeta.intro} OTP: ${otpCode}. It expires in ${expiryMinutes} minutes.`,
    });

    if (error) {
        const resendErrorMessage = typeof error?.message === "string" ? error.message : "Failed to send OTP email";
        throw new Error(resendErrorMessage);
    }
};

export { OTP_EMAIL_PURPOSE };
