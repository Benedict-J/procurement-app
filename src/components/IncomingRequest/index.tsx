import { Table, Button, Pagination, message, Modal } from "antd";
import { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { useUserContext } from "@/contexts/UserContext";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import dayjs from "dayjs";
import { Input } from "antd";
import { useRouter } from "next/router";
import { handleStatusChange } from "@/utils/notifications/handleStatusUtils";
import { formatDate } from "@/utils/format";

const { TextArea } = Input;

interface DataType {
    key: React.Key;
    name: string;
    id: string;
    requestNo: string;
    detail: string;
}

const IncomingRequest = () => {
    const { userProfile } = useUserContext();
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [rejectFeedback, setRejectFeedback] = useState("");
    const [currentRejectId, setCurrentRejectId] = useState<string | null>(null);

    // router initialization
    const router = useRouter(); 

    // set table columns
    const columns: TableColumnsType<DataType> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            align: "center",
        },
        {
            title: "No. Request",
            dataIndex: "requestNo",
            key: "requestNo",
            align: "center",
            sorter: (a, b) => {
                const numberA = parseInt(a.requestNo.replace(/\D/g, ''), 10); 
                const numberB = parseInt(b.requestNo.replace(/\D/g, ''), 10); 
                return numberA - numberB;
            },
        },
        {
            title: "Detail Request",
            dataIndex: "detail",
            key: "detail",
            align: "center",
            render: (text, record) => (
                <Button type="primary" size="small" onClick={() => handleDetailClick(record.requestNo)}>
                    Check
                </Button>
            ),
        },
        {
            title: "Action",
            key: "action",
            align: "center",
            render: (_, record) => (
                <>
                    <Button type="primary" style={{ marginRight: 8 }} size="small" onClick={() => handleApprove(record.id)}>
                        Approve
                    </Button>
                    <Button type="default" danger size="small" onClick={() => handleReject(record.id)}>
                        Reject
                    </Button>
                </>
            ),
        },
    ];

    const fetchRequests = async () => {
        if (!userProfile) return;

        let roleQuery;
        const division = userProfile.divisi;
        const entity = userProfile.entity;
        const role = userProfile.role;

        // Query for each role
        switch (role) {
            case "Checker":
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.checker.approved", "==", false),
                    where("approvalStatus.checker.rejected", "==", false),
                    where("requesterDivision", "==", division),
                    where("requesterEntity", "==", entity),
                    where("status", "==", "In Progress")
                );
                break;
    
            case "Approval":
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.checker.approved", "==", true),
                    where("approvalStatus.approval.approved", "==", false),
                    where("approvalStatus.approval.rejected", "==", false),
                    where("requesterEntity", "==", entity),
                    where("status", "==", "In Progress")
                );
                break;
    
            case "Releaser":
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.approval.approved", "==", true),
                    where("approvalStatus.releaser.approved", "==", false),
                    where("approvalStatus.releaser.rejected", "==", false),
                    where("status", "==", "In Progress")
                );
                break;
    
            default:
                console.warn(`Role ${role} tidak memiliki query yang sesuai.`);
                return;
        }

        if (roleQuery) {
            const querySnapshot = await getDocs(roleQuery);
            const requestData = querySnapshot.docs.map(doc => ({
                key: doc.id,
                id: doc.id,
                name: doc.data().requesterName || "Unknown", 
                requestNo: doc.data().requestNumber || "N/A",
                detail: `Detail for request ${doc.id}`,
            }));
            setDataSource(requestData);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [userProfile]);

    const handleDetailClick = (requestNo: string) => {
        router.push(`/requester/detail-request?requestNo=${requestNo}`);
    };

    // Handler for approving
    const handleApprove = async (id: string) => {
        if (!userProfile) return;

        const role = userProfile.role.toLowerCase();
        const userId = userProfile.userId;

        try {
            const requestDocRef = doc(db, "requests", id);
            const updates: any = {
                [`approvalStatus.${role}.approved`]: true,
                [`approvalStatus.${role}.approvedBy`]: userId,
                [`approvalStatus.${role}.approvedAt`]: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            };

            if (role === 'releaser') {
                updates['status'] = "Approved";
            }

            await updateDoc(requestDocRef, updates);

            // Send Notifications
            setDataSource(prevData => prevData.filter(item => item.id !== id));
            message.success(`Request approved successfully by ${userProfile.namaLengkap}`);
            await handleStatusChange(id)
        } catch (error) {
            console.error("Error approving request:", error);
            message.error("Failed to approve request.");
        }
    };

    // Handler for rejecting
    const handleReject = (id: string) => {
        setCurrentRejectId(id);
        setIsRejectModalVisible(true);
    };

    // Handler for submit rejecting
    const submitReject = async () => {
        if (!userProfile || !currentRejectId) return;

        const role = userProfile.role.toLowerCase();

        try {
            const requestDocRef = doc(db, "requests", currentRejectId);
            await updateDoc(requestDocRef, {
                [`approvalStatus.${role}.rejected`]: true,
                [`approvalStatus.${role}.rejectedBy`]: userProfile.userId,
                [`approvalStatus.${role}.rejectedAt`]: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                [`approvalStatus.${role}.feedback`]: rejectFeedback,
                status: "Rejected",
            });

            // Send Notifications
            setDataSource(prevData => prevData.filter(item => item.id !== currentRejectId));
            message.success(`Request rejected successfully by ${userProfile.role}`);
            await handleStatusChange(currentRejectId);
        } catch (error) {
            console.error("Error rejecting request:", error);
            message.error("Failed to reject request.");
        } finally {
            setRejectFeedback("");
            setIsRejectModalVisible(false);
            setCurrentRejectId(null);
        }
    };


    // Handler for pagination
    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    return (
        <div>
            <Table<DataType>
                columns={columns}
                dataSource={dataSource}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: dataSource.length,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50, 100],
                }}
                bordered
                scroll={{ x: 200 }}
                style={{ backgroundColor: "#fff" }}
                onChange={handleTableChange}
            />
            <Modal
                title="Reject Request"
                open={isRejectModalVisible}
                onOk={submitReject}
                onCancel={() => setIsRejectModalVisible(false)}
                okText="Submit"
                cancelText="Cancel"
            >
                <p>Please provide feedback for the rejection:</p>
                <TextArea
                    rows={4}
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                    placeholder="Enter feedback here..."
                />
            </Modal>
        </div>
    );
};

export default IncomingRequest;
