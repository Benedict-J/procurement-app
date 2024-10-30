import { Table, Button, Pagination, message, Modal } from "antd";
import { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { useUserContext } from "@/contexts/UserContext";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import dayjs from "dayjs";
import { Input } from "antd";
import { useRouter } from "next/router";

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

    const router = useRouter(); // Inisialisasi router
    const role = userProfile?.role;

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

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userProfile) return;

            let roleQuery;
            const division = userProfile.divisi;
            const entity = userProfile.entity;
            // Buat query berdasarkan role pengguna
            if (role === "Checker") {
                roleQuery = query(collection(db, "requests"),
                    where("approvalStatus.checker.approved", "==", false),
                    where("requesterDivision", "==", division),
                    where("requesterEntity", "==", entity));
            } else if (role === "Approval") {
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.checker.approved", "==", true),
                    where("approvalStatus.approval.approved", "==", false),
                    where("requesterEntity", "==", entity)
                );
            } else if (role === "Releaser") {
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.approval.approved", "==", true),
                    where("approvalStatus.releaser.approved", "==", false),
                    where("requesterEntity", "==", entity)
                );
            }

            if (roleQuery) {
                const querySnapshot = await getDocs(roleQuery);
                const requestData = querySnapshot.docs.map(doc => ({
                    key: doc.id,
                    id: doc.id,
                    name: doc.data().requesterName || "Unknown", // Pastikan field ini ada di Firestore
                    requestNo: doc.data().requestNumber || "N/A",
                    detail: `Detail for request ${doc.id}`,
                }));
                setDataSource(requestData);
            }
        };

        fetchRequests();
    }, [role]);

    // Fungsi untuk menangani klik tombol Check pada Detail Request
    const handleDetailClick = (requestNo: string) => {
        // Navigasi ke halaman detail dengan query string berdasarkan nomor request
        router.push(`/requester/detail-request?requestNo=${requestNo}`);
    };

    // Handler untuk approve
    const handleApprove = async (id: string) => {
        if (!userProfile) {
            console.error("User profile not found.");
            return;
        }

        const role = userProfile.role;
        const userId = userProfile.userId;
        const userName = userProfile.namaLengkap;


        let approvalField = "";
        if (role === "Checker") {
            approvalField = "approvalStatus.checker";
        } else if (role === "Approval") {
            approvalField = "approvalStatus.approval";
        } else if (role === "Releaser") {
            approvalField = "approvalStatus.releaser";
        } else {
            console.error("Role not authorized for approval.");
            return;
        }

        try {
            const requestDocRef = doc(db, "requests", id);

            // Update approval status
            await updateDoc(requestDocRef, {
                [`${approvalField}.approved`]: true,
                [`${approvalField}.approvedBy`]: userId,
                [`${approvalField}.approvedAt`]: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });

            // Menghapus item yang di-approve dari dataSource
            setDataSource((prevData) => prevData.filter((item) => item.id !== id));

            console.log(`Request ${id} approved by ${role}`);
            message.success(`Request approved successfully by ${userName}`);
        } catch (error) {
            console.error("Error approving request:", error);
            message.error("Failed to approve request.");
        }
    };

    // Handler untuk reject
    const handleReject = (id: string) => {
        setCurrentRejectId(id);
        setIsRejectModalVisible(true);
    };

    const submitReject = async () => {
        if (!userProfile || !currentRejectId) {
            message.error("Failed to reject request. Please try again.");
            return;
        }

        const role = userProfile.role;
        const requestDocRef = doc(db, "requests", currentRejectId);

        try {
            await updateDoc(requestDocRef, {
                [`approvalStatus.${role.toLowerCase()}`]: {
                    approved: false,
                    feedback: rejectFeedback,
                    rejectedAt: new Date().toISOString(),
                },
                status: "rejected", // Update status request menjadi "rejected"
            });

            // Menghapus request yang direject dari dataSource
            setDataSource((prevData) => prevData.filter((item) => item.id !== currentRejectId));

            message.success(`Request rejected successfully by ${role}`);

        } catch (error) {
            console.error("Error rejecting request:", error);
            message.error("Failed to reject request.");
        } finally {
            // Reset modal state
            setRejectFeedback("");
            setIsRejectModalVisible(false);
            setCurrentRejectId(null);
        }
    };


    // Handler untuk pagination
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
