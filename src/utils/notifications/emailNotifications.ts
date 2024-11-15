export const sendEmailNotification = async (
  email: string,
  status: string,
  requestNumber: string,
  submissionDate: string,
  actionRole: string,
  statusLink: string
) => {
  try {
      console.log("Preparing to send email notification to:", email);
      const subject = `Procurement Request: Status (${status})`;
      const text = `Your submission with Request No. ${requestNumber} submitted on ${submissionDate} has been ${status.toLowerCase()} by the ${actionRole}.
Follow this link to view your status: ${statusLink}`;

      console.log("Sending fetch request to /api/send-email");

      const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, subject, text }),
      });

      console.log("Response received:", response.status);

      if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from server:", errorText);
          throw new Error(`Gagal mengirim email: ${errorText}`);
      }

      const data = await response.json().catch(() => null);
      if (data) {
          console.log("Email sent successfully:", data.message);
      } else {
          console.log("Response body is not in JSON format.");
      }
  } catch (error) {
      console.error("Error sending email:", error);
  }
};