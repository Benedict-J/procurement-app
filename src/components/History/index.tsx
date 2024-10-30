import { useEffect, useState } from "react";
import { Table, Button, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { db } from "@/firebase/firebase"; 
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useUserContext } from "@/contexts/UserContext"; 
import dayjs from "dayjs";
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/router"; // Import useRouter untuk navigasi

const { Option } = Select;

const HistoryTable = () => {
    const { userProfile } = useUserContext(); 
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<SortOrder>("ascend");
    const [statusFilter, setStatusFilter] = useState("All");
    const router = useRouter(); // Inisialisasi router

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userProfile) return;

            setLoading(true);
            let historyQuery;

            const role = userProfile.role;

            // Buat query berdasarkan peran pengguna
            if (role === "Requester") {
                historyQuery = query(
                    collection(db, "requests"),
                    where("requesterId", "==", userProfile.userId),
                    orderBy("createdAt", sortOrder === "ascend" ? "asc" : "desc")
                );
            } else {
                historyQuery = query(
                    collection(db, "requests"),
                    where(`approvalStatus.${role.toLowerCase()}.approvedBy`, "==", userProfile.userId),
                    orderBy("actionDate", sortOrder === "ascend" ? "asc" : "desc")
                );
            }

            if (statusFilter !== "All") {
                historyQuery = query(
                    historyQuery,
                    where("status", "==", statusFilter)
                );
            }

            try {
                const querySnapshot = await getDocs(historyQuery);
                const data = querySnapshot.docs.map(doc => ({
                    key: doc.id,
                    id: doc.id,
                    requestNo: doc.data().requestNumber || "N/A",
                    requestDate: doc.data().createdAt ? dayjs(doc.data().createdAt).format("YYYY-MM-DD") : "N/A",
                    status: doc.data().status || "N/A",
                    actionDate: doc.data().actionDate ? dayjs(doc.data().actionDate).format("YYYY-MM-DD") : "N/A",
                    action: doc.data().approvalStatus?.checker?.approved ? "Approved" : "Rejected",
                }));
                setDataSource(data);
            } catch (error) {
                console.error("Error fetching history:", error);
                message.error("Failed to load history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userProfile, sortOrder, statusFilter]);

    interface DataType {
        key: React.Key;
        id: string;
        requestNo: string;
        requestDate: string;
        status: string;
    }    

    // Kolom untuk peran Requester
    const requesterColumns: ColumnsType<DataType> = [
        { title: "No.", dataIndex: "key", key: "no", align: "center" as const },
        { title: "No. Request", dataIndex: "requestNo", key: "requestNo", align: "center" as const },
        {
            title: "Detail Request",
            key: "detail",
            align: "center" as const,
            render: (text: string, record: { requestNo: string }) => (
                <Button type="link" onClick={() => handleDetail(record.requestNo)}>View Details</Button>
            ),
        },
        {
            title: "Request Date",
            dataIndex: "requestDate",
            key: "requestDate",
            align: "center" as const,
            sorter: true,
            sortOrder: sortOrder,
            onHeaderCell: () => ({
                onClick: () => setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
            }),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            filters: [
                { text: "In Progress", value: "In Progress" },
                { text: "Rejected", value: "Rejected" },
                { text: "Done", value: "Done" },
            ],
            filteredValue: statusFilter !== "All" ? [statusFilter] : null,
            onFilter: (value: string | number | boolean, record: {status: string}) => record.status.includes(value as string),
            render: (status: string) => (
                <Button type="link" onClick={() => showFlowStep(status)}>
                    {status}
                </Button>
            ),
        },
    ];

    // Kolom untuk Checker, Approval, Releaser
    const actionColumns = [
        { title: "No.", dataIndex: "key", key: "no", align: "center" as const},
        { title: "No. Request", dataIndex: "requestNo", key: "requestNo", align: "center" as const},
        {
            title: "Detail Request",
            key: "detail",
            align: "center" as const,
            render: (text: string, record: { requestNo: string }) => (
                <Button type="link" onClick={() => handleDetail(record.requestNo)}>View Details</Button>
            ),
        },
        { title: "Action Date", dataIndex: "actionDate", key: "actionDate", align: "center" as const},
        { title: "Action", dataIndex: "action", key: "action", align: "center" as const},
    ];

    const handleDetail = (requestNo: string) => {
        // Navigasi ke halaman detail request menggunakan nomor request
        router.push(`/requester/detail-request/${requestNo}`); // Sesuaikan dengan jalur yang diinginkan
    };

    const showFlowStep = (status: string) => {
        console.log(`Flow step for status: ${status}`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }
    
    if (!userProfile) {
        return <p>Error: User profile not found</p>;
    }

    return (
        <div>
            {userProfile.role === "Requester" ? (
                <Table
                    columns={requesterColumns}
                    dataSource={dataSource}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="key"
                />
            ) : (
                <Table
                    columns={actionColumns}
                    dataSource={dataSource}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="key"
                />
            )}
        </div>
    );
};

export default HistoryTable;
