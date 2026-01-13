const baseStyles = {
  container: 'font-family: sans-serif; max-width: 600px; margin: 0 auto;',
  button:
    'display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;',
  muted: 'color: #666; font-size: 14px;',
  small: 'color: #666; font-size: 12px;',
};

export const resetPasswordTemplate = (url: string): string => `
<div style="${baseStyles.container}">
  <h2>Reset your password</h2>
  <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
  <a href="${url}" style="${baseStyles.button}">
    Reset Password
  </a>
  <p style="${baseStyles.muted}">If you didn't request this, you can safely ignore this email.</p>
  <p style="${baseStyles.small}">Or copy this link: ${url}</p>
</div>
`;

export const emailVerificationTemplate = (url: string): string => `
<div style="${baseStyles.container}">
  <h2>Verify your email</h2>
  <p>Click the button below to verify your email address.</p>
  <a href="${url}" style="${baseStyles.button}">
    Verify Email
  </a>
  <p style="${baseStyles.muted}">If you didn't create an account, you can safely ignore this email.</p>
  <p style="${baseStyles.small}">Or copy this link: ${url}</p>
</div>
`;

export const paymentFailedTemplate = (portalUrl: string): string => `
<div style="${baseStyles.container}">
  <h2>Payment Failed</h2>
  <p>We were unable to process your subscription payment. Please update your payment method to avoid service interruption.</p>
  <a href="${portalUrl}" style="${baseStyles.button}">
    Update Payment Method
  </a>
  <p style="${baseStyles.muted}">If you believe this is an error or need assistance, please contact support.</p>
</div>
`;
