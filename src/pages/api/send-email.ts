import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { to, subject, text } = req.body as {
        to: string;
        subject: string;
        text: string;
      };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
      };
    
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully" });
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email", error });
      }
}