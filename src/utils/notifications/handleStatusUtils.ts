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

const getRoleEmail = async (
    role: string,
    entity?: string,
    division?: string,
    selectedProfileIndex?: number
): Promise<string | string[] | null> => {
    try {
        console.log(`Searching for role: ${role}, entity: ${entity}, division: ${division}, selectedProfileIndex: ${selectedProfileIndex}`);

        const q = query(
            collection(db, "registeredUsers"),
            division ? where("divisi", "==", division) : undefined
        );

        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot Size:", querySnapshot.size);

        const emails: string[] = [];

        for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            console.log("User Data:", userData);

            if (Array.isArray(userData.profile)) {
                const profiles = userData.profile.filter(
                    (p: Profile, index: number) =>
                        p.role === role &&
                        (role === "Releaser" || p.entity === entity) &&
                        (selectedProfileIndex === undefined || selectedProfileIndex === index)
                );

                profiles.forEach((profile: Profile) => {
                    if (profile.email) {
                        emails.push(profile.email);
                    }
                });

                if (role !== "Releaser" && profiles.length > 0) {
                    console.log("Single Profile Match Found:", profiles[0]);
                    return profiles[0].email || null;
                }
            }
        }

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
            const emailToSend = Array.isArray(checkerEmail) ? checkerEmail[0] : checkerEmail;
            if (checkerEmail) {
                await sendEmailNotification(
                    emailToSend,
                    "New Request",
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Requester",
                    `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                    false
                );
                console.log(`Email sent to Checker: ${checkerEmail}`);
            }
        } else if (actionRole === "Checker") {
            if (status === "Rejected" && requesterEmail) {
                // Jika status Rejected, hanya kirim email ke requester
                await sendEmailNotification(
                    requesterEmail,
                    requestData.status,
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Checker",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
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
                        `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                        false
                    );
                    console.log(`Email sent to Approval: ${approvalEmail}`);
                }
            }
            if (status === "In Progress" && requesterEmail) {
                // Kirim email ke requester bahwa request sedang diproses
                await sendEmailNotification(
                    requesterEmail,
                    "Request Approved by Checker",
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Checker",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                    true
                );
                console.log(`Email sent to Requester (In Progress by Checker): ${requesterEmail}`);
            }
        } else if (actionRole === "Approval") {
            if (status === "Rejected" && requesterEmail) {
                // Jika status Rejected, hanya kirim email ke requester
                await sendEmailNotification(
                    requesterEmail,
                    requestData.status,
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Approval",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
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
                            `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
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
                        `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                        false
                    );
                    console.log(`Email sent to Releaser: ${releaserEmails}`);
                }
                // if (releaserEmail) {
                //     await sendEmailNotification(
                //         releaserEmail,
                //         "Final Approval Needed",
                //         requestData.requestNumber,
                //         requestData.createdAt,
                //         "Approval",
                //         `http://localhost:3000/requester/detail-request?requestNo=${requestData.requestNumber}`,
                //         false
                //     );
                //     console.log(`Email sent to Releaser: ${releaserEmail}`);
                // }
            }
            if (status === "In Progress" && requesterEmail) {
                // Kirim email ke requester bahwa request sedang diproses
                await sendEmailNotification(
                    requesterEmail,
                    "Request Approved by Approval",
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Approval",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                    true
                );
                console.log(`Email sent to Requester (In Progress by Approval): ${requesterEmail}`);
            }
        } else if (actionRole === "Releaser") {
            if (status === "Rejected" && requesterEmail) {
                // Jika status Rejected, hanya kirim email ke requester
                await sendEmailNotification(
                    requesterEmail,
                    requestData.status,
                    requestData.requestNumber,
                    requestData.createdAt,
                    "Releaser",
                    `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
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
                        `http://localhost:3000/requester/flow-steps?requestNumber=${requestData.requestNumber}`,
                        true
                    );
                    console.log(`Email sent to Requester: ${requesterEmail}`);
                }
            }
        }
    } catch (error) {
        console.error("Error in handleStatusChange:", error);
    }
};