import { useEffect, useState } from "react";
import { Table, Button, Select, message, Spin, Pagination, Input, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { db } from "@/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUserContext } from "@/contexts/UserContext";
import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/router";
import { formatDate } from "@/utils/format";

const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoryTable = () => {
    const { userProfile } = useUserContext();
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<SortOrder>("ascend");
    const [statusFilter, setStatusFilter] = useState<DataType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchText, setSearchText] = useState("");
    const [selectedDateRange, setSelectedDateRange] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const router = useRouter();

    // Fetches the history data based on the user role
    const fetchHistory = async () => {
        if (!userProfile || !userProfile.role) {
            setDataSource([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const role = userProfile.role.toLowerCase();
        let data = [];

        console.log("Fetching history for role:", role);
        try {
            // Fetch data for requester role
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
                        requestDate: formatDate(docData.createdAt),
                        status: docData.status || "N/A",
                    };
                });

            } else {
                // Fetch data for roles other than requester
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

                const combinedDocs = [...approvedDocs.docs, ...rejectedDocs.docs];
                data = combinedDocs.map(doc => {
                    const docData = doc.data();
                    const approvalData = docData.approvalStatus[role] || {};
                    return {
                        key: doc.id,
                        id: doc.id,
                        requestNo: docData.requestNumber || "N/A",
                        requestDate: formatDate(docData.createdAt),
                        status: docData.status || "N/A",
                        actionDate: formatDate(approvalData.approvedAt || approvalData.rejectedAt),
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

    useEffect(() => {
        fetchHistory();
    }, [userProfile]);

    // Handles search input for request numbers
    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    // Handles the date range filter changes
    const handleDateChange = (dates: any) => {
        setSelectedDateRange(dates || []);
    };

    // Handles the status filter changes
    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
    };

    // Filters the table data based on search, date range, and status
    const filteredData = dataSource.filter(item => {
        if (!userProfile?.role) return false;

        const matchesRequestNo = item.requestNo.toLowerCase().includes(searchText);

        // Filter status based on role
        const sourceForFilter = userProfile.role === "Requester" ? item.status : item.action;
        const matchesStatus = selectedStatus ? sourceForFilter === selectedStatus : true;

        const matchesDateRange =
            selectedDateRange && selectedDateRange.length === 2
                ? dayjs(item.requestDate).isBetween(selectedDateRange[0], selectedDateRange[1], "day", "[]")
                : true;
        return matchesRequestNo && matchesStatus && matchesDateRange;
    });

    interface DataType {
        key: React.Key;
        id: string;
        requestNo: string;
        requestDate: string;
        status: string;
        actionDate: string;
        action: string;
    }

    // Columns for Requester role
    const requesterColumns: ColumnsType<DataType> = [
        {
            title: "No.",
            key: "no",
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1 + (currentPage - 1) * pageSize
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
            sorter: (a, b) => dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            align: "center" as const,
            render: (status: string, record: { requestNo: string }) => (
                <Button type="link" onClick={() => showFlowStep(record.requestNo)}>
                    {status}
                </Button>
            ),
        },
    ];

    // Columns for other roles (Checker, Approval, Releaser)
    const actionColumns: ColumnsType<DataType> = [
        {
            title: "No.",
            key: "no",
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1 + (currentPage - 1) * pageSize
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

    // Handles redirect to the request detail page
    const handleDetail = (requestNo: string) => {
        router.push(`/requester/detail-request?requestNo=${requestNo}`);
    };

    // Handles redirect to the flow steps page
    const showFlowStep = (requestNumber: string) => {
        router.push(`/requester/flow-steps?requestNumber=${requestNumber}`);
    };

    // Handles table pagination changes
    const handleTableChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) {
            setPageSize(size);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginBottom: "16px" }}>
                <Input.Group compact style={{ width: "auto" }}>
                    <Input
                        style={{ width: 250 }}
                        placeholder="Search by no request"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Select
                        placeholder="Status"
                        onChange={handleStatusChange}
                        allowClear
                        style={{ width: 110 }}
                    >
                        {userProfile?.role === "Requester" ? (
                            <>
                                <Option value="In Progress">In Progress</Option>
                                <Option value="Approved">Approved</Option>
                                <Option value="Rejected">Rejected</Option>
                            </>
                        ) : (
                            Array.from(new Set(dataSource.map(item => item.action))).map(action => (
                                <Option key={action} value={action}>
                                    {action}
                                </Option>
                            ))
                        )}
                    </Select>
                </Input.Group>
                <RangePicker onChange={handleDateChange} style={{ width: 250 }} />
            </div>

            <Table
                columns={userProfile && userProfile.role === "Requester" ? requesterColumns : actionColumns}
                dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                loading={loading}
                pagination={false}
                bordered
                scroll={{ x: 200 }}
                style={{ backgroundColor: "#fff" }}
                rowKey="key"
            />

            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={handleTableChange}
                showSizeChanger={true}
                pageSizeOptions={['10', '20', '50', '100']}
                style={{ marginTop: "16px", textAlign: "right" }}
            />
        </div>
    );
};

export default HistoryTable;