import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const handleStatusChange = async (requestId: string, status: string) => {
    try {
        const requestDocRef = doc(db, "requests", requestId);
        const requestDoc = await getDoc(requestDocRef);

        if (requestDoc.exists()) {
            const requesterEmail = requestDoc.data()?.requesterEmail;
            if (!requesterEmail) {
                throw new Error("Requester email not found.");
            }
            await sendEmailNotification(requesterEmail, status, requestId);
            console.log(`Email notification sent to ${requesterEmail} with status: ${status}`);
        } else {
            console.error("Request document not found.");
        }
    } catch (error) {
        console.error("Error in handleStatusChange:", error);
    }
};