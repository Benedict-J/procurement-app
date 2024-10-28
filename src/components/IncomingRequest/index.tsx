import { Table, Button, Pagination, message } from "antd";
import { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { useUserContext } from "@/contexts/UserContext";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import dayjs from "dayjs";

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

    const role = userProfile?.role;

    // Kolom untuk tabel
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
        },
        {
            title: "Detail Request",
            dataIndex: "detail",
            key: "detail",
            align: "center",
            render: (text, record) => (
                <Button type="primary" size="small" onClick={() => handleDetailClick(record.id)}>
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
            let roleQuery;

            // Buat query berdasarkan role pengguna
            if (role === "Checker") {
                roleQuery = query(collection(db, "requests"), where("approvalStatus.checker.approved", "==", false));
            } else if (role === "Approval") {
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.checker.approved", "==", true),
                    where("approvalStatus.approval.approved", "==", false)
                );
            } else if (role === "Releaser") {
                roleQuery = query(
                    collection(db, "requests"),
                    where("approvalStatus.approval.approved", "==", true),
                    where("approvalStatus.releaser.approved", "==", false)
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

    const handleDetailClick = (id: string) => {
        console.log("Check details for request ID:", id);
        // Navigasi atau tampilkan detail request
    };

    // Handler untuk approve
    const handleApprove = async (id: string) => {
        if (!userProfile) {
            console.error("User profile not found.");
            return;
        }

        const role = userProfile.role;

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
                [`${approvalField}.date`]: dayjs().format("YYYY-MM-DD"),
            });

            console.log(`Request ${id} approved by ${role}`);
            message.success(`Request approved successfully by ${role}`);
        } catch (error) {
            console.error("Error approving request:", error);
            message.error("Failed to approve request.");
        }
    };

    // Handler untuk reject
    const handleReject = (id: string) => {
        console.log("Reject request ID:", id);
        // Panggil fungsi reject di sini
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
        </div>
    );
};

export default IncomingRequest;
