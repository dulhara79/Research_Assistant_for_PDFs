def loginTemplate(otp_code):
    return f"""
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>ScholarSense Login OTP</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="color:#2a4d8f; margin:0;">🔐 ScholarSense</h2>
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-size:16px; color:#333;">Hello,</p>
              <p style="font-size:16px; color:#333;">
                Use the One-Time Password (OTP) below to complete your login.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:30px 0;">
              <p style="font-size:18px; color:#2a4d8f; margin:0; font-weight:600;">Your Login OTP is:</p>
              <h1 style="font-size:36px; color:#000; margin:15px 0;">{otp_code}</h1>
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-size:14px; color:#555;">
                This OTP will expire in 5 minutes. Do not share it with anyone.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:25px; color:#aaa; font-size:12px;">
              © ScholarSense • Secure Academic Platform
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def registrationTemplate(otp_code):
    return f"""
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>ScholarSense Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="color:#2a4d8f; margin:0;">🎓 Welcome to ScholarSense!</h2>
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-size:16px; color:#333;">Hello,</p>
              <p style="font-size:16px; color:#333;">
                Thank you for signing up! Use the verification code below to activate your account.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:30px 0;">
              <p style="font-size:18px; color:#2a4d8f; margin:0; font-weight:600;">Your Verification Code:</p>
              <h1 style="font-size:36px; color:#000; margin:15px 0;">{otp_code}</h1>
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-size:14px; color:#555;">
                This code expires in 10 minutes. If you didn’t request this, please ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:25px; color:#aaa; font-size:12px;">
              © ScholarSense • Empowering Academic Excellence
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """
