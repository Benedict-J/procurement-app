import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { sendEmailNotification } from "@/utils/notifications/emailNotifications";

const getRoleEmail = async (role: string, entity?: string, division?: string, selectedProfileIndex ?: number): Promise<string | null> => {
    try {
        console.log(`Searching for role: ${role}, entity: ${entity}, division: ${division}, selectedProfileIndex: ${selectedProfileIndex}`);

        const q = query(
            collection(db, "registeredUsers"),
            division ? where("divisi", "==", division) : undefined
        );

        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot Size:", querySnapshot.size);

        for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            console.log("User Data:", userData);

            if (Array.isArray(userData.profile)) {
                const profileMatch = userData.profile.find(
                    (p: any, index: number) => 
                        p.role === role &&
                        (role === "Releaser" || p.entity === entity) && // Abaikan entity untuk Releaser
                        (selectedProfileIndex === undefined || selectedProfileIndex === index)
                );
                if (profileMatch) {
                    console.log("Profile Match Found:", profileMatch);
                    return profileMatch.email || null;
                }
            }
        }

        console.error(`No user found for role: ${role}, entity: ${entity}, division: ${division}`);
        return null;
    } catch (error) {
        console.error("Error fetching role email:", error);
        return null;
    }
};

export const handleStatusChange = async (requestId: string) => {
    try {
        const requestDocRef = doc(db, "requests", requestId);
        const requestDoc = await getDoc(requestDocRef);

        if (!requestDoc.exists()) {
            console.error("Request document not found.");
            return;
        }

        const requestData = requestDoc.data();
        const {
            requesterEmail,
            requesterDivision,
            requesterEntity,
            approvalStatus,
            status,
        } = requestData;

        console.log("Data request dari Firestore:", requestData);
        console.log("Requester Entity:", requesterEntity);
        console.log("Requester Division:", requesterDivision);

        if (!requesterEntity || !requesterDivision) {
            console.error("Requester entity or division is missing.");
            return;
        }

        console.log("Current Status:", status);

        // Cari role terakhir yang bertindak berdasarkan timestamp
        let actionRole: string | null = null;
        let latestApprovalTime: string | null = null;

        if (approvalStatus) {
            for (const role in approvalStatus) {
                const roleData = approvalStatus[role];

                if (roleData?.approved || roleData?.rejected) {
                    const approvalTime = roleData.approvedAt || roleData.rejectedAt;

                    // Periksa apakah ini tindakan terakhir berdasarkan waktu
                    if (
                        approvalTime &&
                        (!latestApprovalTime || approvalTime > latestApprovalTime)
                    ) {
                        latestApprovalTime = approvalTime;
                        actionRole = role.charAt(0).toUpperCase() + role.slice(1);
                    }
                }
            }
        }

        if (!actionRole) {
            actionRole = "Requester";
        }

        console.log("Role yang bertindak:", actionRole);

        if (!actionRole) {
            console.error("No actionRole found. Skipping email notification.");
            return;
        }

        // Alur pengiriman email
        if (actionRole === "Requester" && status === "In Progress") {
            const checkerEmail = await getRoleEmail("Checker", requesterEntity, requesterDivision);
            if (checkerEmail) {
                await sendEmailNotification(
                    checkerEmail,
                    "New Request",
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Requester",
                    `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                    false
                );
                console.log(`Email sent to Checker: ${checkerEmail}`);
            }
        } else if (actionRole === "Checker" && status === "In Progress") {
            const approvalEmail = await getRoleEmail("Approval", requesterEntity);
            if (approvalEmail) {
                await sendEmailNotification(
                    approvalEmail,
                    "New Request to Approve",
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Checker",
                    `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                    false
                );
                console.log(`Email sent to Approval: ${approvalEmail}`);
            }
            if (requesterEmail) {
                await sendEmailNotification(
                    requesterEmail,
                    requestData.status,
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Checker",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                    true
                );
                console.log(`Email sent to Requester: ${requesterEmail}`);
            }
        } else if (actionRole === "Approval" && status === "In Progress") {
            const releaserEmail = await getRoleEmail("Releaser");
            if (releaserEmail) {
                await sendEmailNotification(
                    releaserEmail,
                    "Final Approval Needed",
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Approval",
                    `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                    false
                );
                console.log(`Email sent to Releaser: ${releaserEmail}`);
            }
            if (requesterEmail) {
                await sendEmailNotification(
                    requesterEmail,
                    requestData.status,
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Approval",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                    true
                );
                console.log(`Email sent to Requester: ${requesterEmail}`);
            }
        } else if (actionRole === "Releaser" && status === "Approved") {
            if (requesterEmail) {
                await sendEmailNotification(
                    requesterEmail,
                    requestData.status,
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Releaser",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                    true
                );
                console.log(`Email sent to Requester: ${requesterEmail}`);
            }
        }
    } catch (error) {
        console.error("Error in handleStatusChange:", error);
    }
};