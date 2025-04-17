export const passwordResetTemplate = (token: string): string => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return `
Hello,

You have requested to reset your password. Please click the link below to set a new password:

${resetUrl}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
${process.env.PROJECT_NAME} Team
`;
};
