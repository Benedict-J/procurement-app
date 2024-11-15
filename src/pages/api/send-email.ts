import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Received request in /api/send-email");
    
    if (req.method !== "POST") {
        console.log("Method not allowed");
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { to, subject, text } = req.body;
    console.log("Email details:", { to, subject, text });

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
        console.log("Attempting to send email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Full SMTP Response:", info);
        
        // Pastikan hanya JSON yang dikembalikan ke klien
        const responseMessage = { message: "Email sent successfully" };
        console.log("Returning JSON response:", responseMessage);
        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Failed to send email" });
    }
}