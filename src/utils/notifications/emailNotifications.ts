const sendEmailNotification = async (email: string, status: string, requestId: string) => {
    try {
      const subject = `Status Permintaan Anda: ${status}`;
      const text = `Permintaan Anda dengan ID ${requestId} telah ${status}.`;
  
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, text }),
      });
  
      if (!response.ok) {
        throw new Error('Gagal mengirim email');
      }
  
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };