import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { sendEmailNotification } from "@/utils/notifications/emailNotifications";

export const handleStatusChange = async (requestId: string, status: string) => {
    try {
        const requestDocRef = doc(db, "requests", requestId);
        const requestDoc = await getDoc(requestDocRef);

        if (requestDoc.exists()) {
            const requestData = requestDoc.data();

            const submissionDate = requestData?.createdAt
                ? requestData.createdAt
                : "Unknown Date";

            const requestNumber = requestData?.requestNumber;
            if (!requestNumber) {
                throw new Error("Request number not found in the document.");
            }
            const statusLink = `http://localhost:3000/requester/flow-steps?requestNumber=${requestNumber}`;

            const approvalStatus = requestData?.approvalStatus || {};
            let actionRole = null;
            let latestApprovalTime = null;

            for (const role in approvalStatus) {
                const roleData = approvalStatus[role];
            
                if (roleData?.approved || roleData?.rejected) {
                    const approvalTime = roleData.approvedAt || roleData.rejectedAt;
            
                    if (!latestApprovalTime || (approvalTime && approvalTime > latestApprovalTime)) {
                        actionRole = role.charAt(0).toUpperCase() + role.slice(1);
                        latestApprovalTime = approvalTime;
                    }
                }
            }

            console.log("Role yang bertindak:", actionRole);

            const requesterEmail = requestDoc.data()?.requesterEmail;
            await sendEmailNotification(
                requesterEmail,
                status,
                requestNumber,
                submissionDate,
                actionRole,
                statusLink
            );
            console.log(`Email notification sent to ${requesterEmail} with status: ${status}`);
        } else {
            console.error("Request document not found.");
        }
    } catch (error) {
        console.error("Error in handleStatusChange:", error);
    }
};