export const sendEmailNotification = async (
    email: string,
    status: string,
    requestNumber: string,
    submissionDate: string,
    actionRole: string,
    statusLink: string,
    isActionNotification: boolean
  ) => {
    try {
      console.log("Preparing to send email notification to:", email);
  
      let subject = "";
      let text = "";
  
      if (isActionNotification) {
        if (status === "Rejected") {
          // Notifikasi ke Requester setelah tindakan Rejected
          subject = `Your Submission Has Been Rejected`;
          text = `Your submission has been reviewed but could not be approved at this stage. Here are the details:
  
          Request Number: ${requestNumber}
          Date of Submission: ${submissionDate}
          Check Status: Rejected by the ${actionRole}
  
          Next Steps: Please review the feedback provided and edit your request accordingly. Once updated, you can resubmit the request for further review.
  
          Edit your request through this link: ${statusLink}
  
          Thank you.`;
        } else {
          // Notifikasi ke Requester setelah tindakan Approved
          subject = `Your Submission Has Been Approved by the ${actionRole}`;
          text = `Your submission with the following details:
  
          Request Number: ${requestNumber}
          Date of Submission: ${submissionDate}
          Check status: approved by the ${actionRole}.
  
          Next Steps: ${
            actionRole === "Checker"
              ? "Your submission will be forwarded to Approval. Please wait for further information."
              : actionRole === "Approval"
              ? "Your submission will be forwarded to Releaser for final approval. Please wait for further information."
              : "Your submission has been fully approved. You can now proceed with the procurement process."
          }
  
          Check more about the request submitted through this link: ${statusLink}
  
          Thank you.`;
        }
      } else {
        // Notifikasi ke Checker, Approval, atau Releaser untuk request baru
        subject = `A New Submission is Awaiting Your Review`;
        text = `The submission with the following details:
  
        Request Number: ${requestNumber}
        Submission Date: ${submissionDate}
        Has been successfully submitted and is now awaiting your review.
  
        Check more about the request submitted through this link: ${statusLink}
  
        Thank you for your attention.`;
      }
  
      console.log("Email Subject:", subject);
      console.log("Email Text:", text);
  
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