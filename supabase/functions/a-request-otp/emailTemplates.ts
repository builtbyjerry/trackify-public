export function getOtpEmailContent(purpose: string, otpCode: string) {
  switch (purpose) {
    case "password_reset":
      return {
        subject: "Password Reset OTP",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          <p>Your OTP code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

    case "pin_reset":
      return {
        subject: "Transaction PIN Reset OTP",
        html: `
          <h2>PIN Reset Request</h2>
          <p>You requested to reset your transaction PIN.</p>
          <p>Your OTP code is: <strong>${otpCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

    default:
      throw new Error("Invalid OTP purpose");
  }
}