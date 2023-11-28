const nodemailer = require("nodemailer");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const secretName = "gmailAppCode";
const region = "us-east-1";
const client = new SecretsManagerClient({ region: region });

async function getSecret() {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );
    console.log("response from secrets manager: ", response);
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("Error retrieving secret:", error);
    throw error;
  }
}

exports.handler = async (event) => {
  const { emails, link } = event;

  try {
    const secret = await getSecret();
    console.log("secret: ", secret);
    const password = secret.gmailAppCode;
    const IP = secret.ec2ip;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "patelkishan0599@gmail.com",
        pass: password,
      },
    });

    const mailOptions = {
      from: "patelkishan0599@gmail.com",
      to: emails.join(", "),
      subject: "Invitation to Collaborate",
      html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4A90E2;">You're Invited to Collaborate!</h2>
      <p>Hello,</p>
      <p>We're excited to invite you to collaborate on our document editing platform. This tool allows multiple users to edit documents in real-time, enhancing productivity and fostering teamwork.</p>
      <p>To get started, simply click on the link below:</p>
      <p><a href="http://${IP}:3000/${link}" style="background-color: #4A90E2; color: #ffffff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Join the Document</a></p>
      <p>If you have any questions or need help getting started, don't hesitate to reach out to us.</p>
      <p>Happy collaborating!</p>
      <p><b>The Collaborative Editor Team</b></p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      message: "Invitations sent successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      error: "Error sending invitations",
    };
  }
};
