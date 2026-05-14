export const ACCOUNT_CREATION_TEMPLATE = (name, clientURL) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2DCCC9; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; line-height: 1.6; color: #333333; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { background-color: #2DCCC9; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
        .footer { background-color: #f9f9f9; color: #777777; padding: 20px; text-align: center; font-size: 12px; }
        .link { color: #2DCCC9; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin:0;">Welcome to Bitchat!</h1>
        </div>
        <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thanks for joining the community! Your account has been successfully created. We're excited to have you on board as we redefine real-time communication.</p>
            <p>To get started and explore your new dashboard, please verify your email address by clicking the button below:</p>
            <div class="button-container">
                <a href="${clientURL}" class="button">Get Started</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2026 Bitchat Inc. | Built for the next generation of chat.</p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
  `;
};