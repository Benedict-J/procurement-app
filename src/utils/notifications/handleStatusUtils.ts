import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { sendEmailNotification } from "@/utils/notifications/emailNotifications";

interface Profile {
    role: string;
    entity: string;
    email: string;
}

// Interface didefinisikan di file yang sama
interface Profile {
    role: string;
    entity: string;
    email: string;
}

// Fetches email(s) for a specific role, entity, and division from Firestore.

const getRoleEmail = async (
    role: string,
    entity?: string,
    division?: string,
    selectedProfileIndex?: number
): Promise<string | string[] | null> => {
    try {
        console.log(`Searching for role: ${role}, entity: ${entity}, division: ${division}, selectedProfileIndex: ${selectedProfileIndex}`);

        // Query the Firestore collection "registeredUsers" and optionally filter by division
        const q = query(
            collection(db, "registeredUsers"),
            division ? where("divisi", "==", division) : undefined
        );

        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot Size:", querySnapshot.size);

        const emails: string[] = []; // Store matching emails

        // Iterate through the results
        for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            console.log("User Data:", userData);

            // Check if the "profile" field exists and is an array
            if (Array.isArray(userData.profile)) {
                // Filter profiles based on role, entity, and selectedProfileIndex
                const profiles = userData.profile.filter(
                    (p: Profile, index: number) =>
                        p.role === role &&
                        (role === "Releaser" || p.entity === entity) && // Releasers don't require entity matching
                        (selectedProfileIndex === undefined || selectedProfileIndex === index)
                );

                // Collect emails from the filtered profiles
                profiles.forEach((profile: Profile) => {
                    if (profile.email) {
                        emails.push(profile.email);
                    }
                });

                // If the role is not "Releaser" and there are matching profiles, return the first email
                if (role !== "Releaser" && profiles.length > 0) {
                    console.log("Single Profile Match Found:", profiles[0]);
                    return profiles[0].email || null;
                }
            }
        }

        // If the role is "Releaser" and emails are found, return all emails
        if (role === "Releaser" && emails.length > 0) {
            console.log("Releaser Emails Found:", emails);
            return emails;
        }

        console.error(`No user found for role: ${role}, entity: ${entity}, division: ${division}`);
        return null;
    } catch (error) {
        console.error("Error fetching role email:", error);
        return null;
    }
};

// Handles status change for a request and sends email notifications accordingly.
export const handleStatusChange = async (requestId: string) => {
    try {
        // Reference the request document in Firestore
        const requestDocRef = doc(db, "requests", requestId);
        const requestDoc = await getDoc(requestDocRef);

        // Check if the document exists
        if (!requestDoc.exists()) {
            console.error("Request document not found.");
            return;
        }

        // Extract request data and relevant fields
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

        // Ensure entity and division are available
        if (!requesterEntity || !requesterDivision) {
            console.error("Requester entity or division is missing.");
            return;
        }

        console.log("Current Status:", status);

        // Determine the last role that acted based on the latest timestamp
        let actionRole: string | null = null;
        let latestApprovalTime: string | null = null;

        if (approvalStatus) {
            for (const role in approvalStatus) {
                const roleData = approvalStatus[role];

                if (roleData?.approved || roleData?.rejected) {
                    const approvalTime = roleData.approvedAt || roleData.rejectedAt;

                    // Update if this is the latest action
                    if (
                        approvalTime &&
                        (!latestApprovalTime || approvalTime > latestApprovalTime)
                    ) {
                        latestApprovalTime = approvalTime;
                        actionRole = role.charAt(0).toUpperCase() + role.slice(1); // Capitalize the role
                    }
                }
            }
        }

        // If no role is determined, default to "Requester"
        if (!actionRole) {
            actionRole = "Requester";
        }

        console.log("Role yang bertindak:", actionRole);

        if (!actionRole) {
            console.error("No actionRole found. Skipping email notification.");
            return;
        }

        // Email notification logic based on role and status  
        switch (actionRole) {
            case "Requester":
                if (status === "In Progress") {
                    const checkerEmail = await getRoleEmail("Checker", requesterEntity, requesterDivision);
                    const emailToSend = Array.isArray(checkerEmail) ? checkerEmail[0] : checkerEmail;
                    if (checkerEmail) {
                        await sendEmailNotification(
                            emailToSend,
                            "New Request",
                            requestData.requestNumber,
                            requestData.createdAt,
                            "Requester",
                            `https://procurement-web-app.vercel.app/requester/detail-request?requestNo=${requestData.requestNumber}`,
                            false
                        );
                        console.log(`Email sent to Checker: ${checkerEmail}`);
                    }
                }
                break;
        
            case "Checker":
                if (status === "Rejected" && requesterEmail) {
                    await sendEmailNotification(
                        requesterEmail,
                        requestData.status,
                        requestData.requestNumber,
                        requestData.createdAt,
                        "Checker",
                        `https://procurement-web-app.vercel.app/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                        true
                    );
                    console.log(`Email sent to Requester (Rejected): ${requesterEmail}`);
                } else if (status === "In Progress") {
                    const approvalEmail = await getRoleEmail("Approval", requesterEntity, requesterDivision);
                    const emailToSend = Array.isArray(approvalEmail) ? approvalEmail[0] : approvalEmail;
                    if (approvalEmail) {
                        await sendEmailNotification(
                            emailToSend,
                            "New Request to Approve",
                            requestData.requestNumber,
                            requestData.createdAt,
                            "Checker",
                            `https://procurement-web-app.vercel.app/requester/detail-request?requestNo=${requestData.requestNumber}`,
                            false
                        );
                        console.log(`Email sent to Approval: ${approvalEmail}`);
                    }
        
                    if (requesterEmail) {
                        await sendEmailNotification(
                            requesterEmail,
                            "Request Approved by Checker",
                            requestData.requestNumber,
                            requestData.createdAt,
                            "Checker",
                            `https://procurement-web-app.vercel.app/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                            true
                        );
                        console.log(`Email sent to Requester (In Progress by Checker): ${requesterEmail}`);
                    }
                }
                break;
        
            case "Approval":
                if (status === "Rejected" && requesterEmail) {
                    await sendEmailNotification(
                        requesterEmail,
                        requestData.status,
                        requestData.requestNumber,
                        requestData.createdAt,
                        "Approval",
                        `https://procurement-web-app.vercel.app/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                        true
                    );
                    console.log(`Email sent to Requester (Rejected): ${requesterEmail}`);
                } else if (status === "In Progress") {
                    const releaserEmails = await getRoleEmail("Releaser");
                    if (Array.isArray(releaserEmails)) {
                        for (const email of releaserEmails) {
                            await sendEmailNotification(
                                email,
                                "Final Approval Needed",
                                requestData.requestNumber,
                                requestData.createdAt,
                                "Approval",
                                `https://procurement-web-app.vercel.app/requester/detail-request?requestNo=${requestData.requestNumber}`,
                                false
                            );
                            console.log(`Email sent to Releaser: ${email}`);
                        }
                    } else if (releaserEmails) {
                        await sendEmailNotification(
                            releaserEmails,
                            "Final Approval Needed",
                            requestData.requestNumber,
                            requestData.createdAt,
                            "Approval",
                            `https://procurement-web-app.vercel.app/detail-request?requestNo=${requestData.requestNumber}`,
                            false
                        );
                        console.log(`Email sent to Releaser: ${releaserEmails}`);
                    }
        
                    if (requesterEmail) {
                        await sendEmailNotification(
                            requesterEmail,
                            "Request Approved by Approval",
                            requestData.requestNumber,
                            requestData.createdAt,
                            "Approval",
                            `https://procurement-web-app.vercel.app/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                            true
                        );
                        console.log(`Email sent to Requester (In Progress by Approval): ${requesterEmail}`);
                    }
                }
                break;
        
            case "Releaser":
                if (status === "Rejected" && requesterEmail) {
                    await sendEmailNotification(
                        requesterEmail,
                        requestData.status,
                        requestData.requestNumber,
                        requestData.createdAt,
                        "Releaser",
                        `https://procurement-web-app.vercel.app/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                        true
                    );
                    console.log(`Email sent to Requester (Rejected): ${requesterEmail}`);
                } else if (status === "Approved") {
                    if (requesterEmail) {
                        await sendEmailNotification(
                            requesterEmail,
                            requestData.status,
                            requestData.requestNumber,
                            requestData.createdAt,
                            "Releaser",
                            `https://procurement-web-app.vercel.app/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                            true
                        );
                        console.log(`Email sent to Requester: ${requesterEmail}`);
                    }
                }
                break;
        
            default:
                console.log("No matching actionRole for email notification.");
                break;
        }
    } catch (error) {
        console.error("Error in handleStatusChange:", error);
    }
};