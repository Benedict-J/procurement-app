import { useEffect, useState } from "react";
import { Table, Button, Select, message, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { db } from "@/firebase/firebase"; 
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUserContext } from "@/contexts/UserContext"; 
import dayjs from "dayjs";
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/router"; 

const { Option } = Select;

const HistoryTable = () => {
    const { userProfile } = useUserContext(); 
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<SortOrder>("ascend");
    const [statusFilter, setStatusFilter] = useState<DataType[]>([]);
    const router = useRouter(); 

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userProfile) return;
    
            setLoading(true);
            const role = userProfile.role.toLowerCase();
            let data = [];
    
            console.log("Fetching history for role:", role); // Debug log
    
            try {
                if (role === "requester") {
                    const historyQuery = query(
                        collection(db, "requests"),
                        where("requesterId", "==", userProfile.userId),
                        where("requesterEntity", "==", userProfile.entity)
                    );
    
                    const querySnapshot = await getDocs(historyQuery);
                    data = querySnapshot.docs.map(doc => {
                        const docData = doc.data();
                        return {
                            key: doc.id,
                            id: doc.id,
                            requestNo: docData.requestNumber || "N/A",
                            requestDate: docData.createdAt ? dayjs(docData.createdAt).format("YYYY-MM-DD") : "N/A",
                            status: docData.status || "N/A",
                        };
                    });
    
                } else {
                    // Role selain requester, gabungkan `approvedBy` dan `rejectedBy`
                    const approvedQuery = query(
                        collection(db, "requests"),
                        where(`approvalStatus.${role}.approvedBy`, "==", userProfile.userId),
                        where("requesterEntity", "==", userProfile.entity)
                    );
    
                    const rejectedQuery = query(
                        collection(db, "requests"),
                        where(`approvalStatus.${role}.rejectedBy`, "==", userProfile.userId),
                        where("requesterEntity", "==", userProfile.entity)
                    );
    
                    const approvedDocs = await getDocs(approvedQuery);
                    const rejectedDocs = await getDocs(rejectedQuery);
    
                    // Gabungkan dokumen yang disetujui dan ditolak
                    const combinedDocs = [...approvedDocs.docs, ...rejectedDocs.docs];
                    data = combinedDocs.map(doc => {
                        const docData = doc.data();
                        const approvalData = docData.approvalStatus[role] || {};
    
                        return {
                            key: doc.id,
                            id: doc.id,
                            requestNo: docData.requestNumber || "N/A",
                            requestDate: docData.createdAt ? dayjs(docData.createdAt).format("YYYY-MM-DD") : "N/A",
                            status: docData.status || "N/A",
                            actionDate: approvalData.approvedAt || approvalData.rejectedAt || "N/A",
                            action: approvalData.approved === false ? "Rejected" : approvalData.approved ? "Approved" : "Pending",
                        };
                    });
                }
    
                setDataSource(data);
                console.log("Fetched history data:", data); // Debug log
            } catch (error) {
                console.error("Error fetching history:", error);
                message.error("Failed to load history.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchHistory();
    }, [userProfile, statusFilter]);

    interface DataType {
        key: React.Key;
        id: string;
        requestNo: string;
        requestDate: string;
        status: string;
        actionDate: string;
        action: string;
    }    

    // Kolom untuk peran Requester
    const requesterColumns: ColumnsType<DataType> = [
        { 
            title: "No.", 
            key: "no", 
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1
        },
        { 
            title: "No. Request", 
            dataIndex: "requestNo", 
            key: "requestNo", 
            align: "center" as const,
            sorter: (a, b) => {
                const numberA = parseInt(a.requestNo.replace(/\D/g, ''), 10); 
                const numberB = parseInt(b.requestNo.replace(/\D/g, ''), 10); 
                return numberA - numberB;
            },
        },
        {
            title: "Detail Request",
            key: "detail",
            align: "center" as const,
            render: (text: string, record: { requestNo: string }) => (
                <Button type="primary" size="small" onClick={() => handleDetail(record.requestNo)}>
                    Check
                </Button>
            ),
        },
        {
            title: "Request Date",
            dataIndex: "requestDate",
            key: "requestDate",
            align: "center",
            sorter: (a, b) => dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(), // Pengurutan berdasarkan tanggal
        },        
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            filters: [
                { text: "In Progress", value: "In Progress" },
                { text: "Rejected", value: "Rejected" },
                { text: "Approved", value: "Approved" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status: string, record: { requestNo: string }) => (
                <Button type="link" onClick={() => showFlowStep(record.requestNo)}>
                    {status}
                </Button>
            ),
        },
    ];

    // Kolom untuk Checker, Approval, Releaser
    const actionColumns: ColumnsType<DataType> = [
        { 
            title: "No.", 
            key: "no", 
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1
        },
        { 
            title: "No. Request", 
            dataIndex: "requestNo", 
            key: "requestNo", 
            align: "center" as const,
            sorter: (a, b) => {
                const numberA = parseInt(a.requestNo.replace(/\D/g, ''), 10); 
                const numberB = parseInt(b.requestNo.replace(/\D/g, ''), 10); 
                return numberA - numberB;
            },
        },
        {
            title: "Detail Request",
            key: "detail",
            align: "center" as const,
            render: (text: string, record: { requestNo: string }) => (
                <Button type="primary" size="small" onClick={() => handleDetail(record.requestNo)}>
                    Check
                </Button>
            ),
        },        
        {
            title: "Action Date",
            dataIndex: "actionDate",
            key: "actionDate",
            align: "center" as const,
            sorter: (a, b) => dayjs(a.actionDate).unix() - dayjs(b.actionDate).unix(),
            sortDirections: ['ascend', 'descend'],
            render: (text: string) => text || "N/A",
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            align: "center" as const,
            filters: [
                { text: "Approved", value: "Approved" },
                { text: "Rejected", value: "Rejected" },
            ],
            onFilter: (value, record) => record.action === value,
            render: (text: string) => text || "N/A", 
        },
    ];

    const handleDetail = (requestNo: string) => {
        // Navigasi ke halaman detail request menggunakan nomor request
        router.push(`/requester/detail-request?requestNo=${requestNo}`);
    };

    const showFlowStep = (requestNumber: string) => {
        router.push(`/requester/flow-steps?requestNumber=${requestNumber}`);
    };

    if (loading) {
        return <Spin/>;
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
                    bordered
                    scroll={{ x: 200 }}
                    style={{ backgroundColor: "#fff" }}
                    rowKey="key"
                />
            ) : (
                <Table
                    columns={actionColumns}
                    dataSource={dataSource}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ x: 200 }}
                    style={{ backgroundColor: "#fff" }}
                    rowKey="key"
                />
            )}
        </div>
    );
};

export default HistoryTable;
