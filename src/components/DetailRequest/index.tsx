import { useEffect, useState } from "react";
import { Table, Pagination, message, Modal, Card } from "antd"; 
import type { TableColumnsType } from "antd";
import { useUserContext } from "@/contexts/UserContext";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from './index.module.scss';
import { useRouter } from "next/router";

interface DataType {
    key: React.Key;
    requestNumber: string;
    itemNumber: number;
    estimateDeliveryDate: string;
    deliveryAddress: string;
    merk: string;
    detailSpecs: string;
    color: string;
    qty: number;
    uom: string;
    linkRef: string;
    budgetMax: string;
    feedback: string | null;
    receiver: string;
}

interface DetailRequestTableProps {
    requestNo: string;
}

const DetailRequestTable: React.FC<DetailRequestTableProps> = ({ requestNo }) => {
    const { userProfile } = useUserContext();
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [requestNumber, setRequestNumber] = useState<string | null>(null);
    const router = useRouter();

    const [entity, setEntity] = useState<string | null>(null);
    const [division, setDivision] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [feedbackData, setFeedbackData] = useState<{ role: string; feedback: string } | null>(null);

    const [docId, setDocId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isApproved, setIsApproved] = useState<boolean>(false);

    const columns: TableColumnsType<DataType> = [
        { title: "Nomor Item", dataIndex: "itemNumber", key: "itemNumber", align: "center" },
        { title: "Estimate Delivery Date", dataIndex: "estimateDeliveryDate", key: "estimateDeliveryDate", align: "center" },
        { title: "Delivery Address", dataIndex: "deliveryAddress", key: "deliveryAddress", align: "center" },
        { title: "Receiver", dataIndex: "receiver", key: "receiver", align: "center" },
        { title: "Merk", dataIndex: "merk", key: "merk", align: "center" },
        { title: "Detail Specs", dataIndex: "detailSpecs", key: "detailSpecs", align: "center" },
        { title: "Color", dataIndex: "color", key: "color", align: "center" },
        { title: "QTY", dataIndex: "qty", key: "qty", align: "center" },
        { title: "UoM", dataIndex: "uom", key: "uom", align: "center" },
        { title: "Link Ref", dataIndex: "linkRef", key: "linkRef", align: "center" },
        { title: "Budget Max", dataIndex: "budgetMax", key: "budgetMax", align: "center" },
    ];

    useEffect(() => {
        const fetchRequest = async () => {
            if (!userProfile || !requestNo) return;

            const requestQuery = query(
                collection(db, "requests"),
                where("requestNumber", "==", requestNo)
            );

            try {
                const querySnapshot = await getDocs(requestQuery);
                if (!querySnapshot.empty) {
                    const firstDoc = querySnapshot.docs[0];
                    const data = firstDoc.data();
                    setDocId(firstDoc.id);
                    setRequestNumber(data.requestNumber || "N/A");

                    setEntity(data.requesterEntity || "N/A");
                    setDivision(data.requesterDivision || "N/A");
                    setStatus(data.status || "Pending");
                    setName(data.requesterName || "N/A");

                    const isAnyApproved = data.approvalStatus?.checker?.approved ||
                        data.approvalStatus?.approval?.approved ||
                        data.approvalStatus?.releaser?.approved;
                    setIsApproved(isAnyApproved);

                    if (data.status === "Rejected") {
                        if (data.approvalStatus?.checker?.feedback) {
                            setFeedbackData({ role: "Checker", feedback: data.approvalStatus.checker.feedback });
                        } else if (data.approvalStatus?.approval?.feedback) {
                            setFeedbackData({ role: "Approval", feedback: data.approvalStatus.approval.feedback });
                        } else if (data.approvalStatus?.releaser?.feedback) {
                            setFeedbackData({ role: "Releaser", feedback: data.approvalStatus.releaser.feedback });
                        }
                    }

                    const requestData = (data.items || []).map((item: any, index: number) => ({
                        key: `${firstDoc.id}-${index}`,
                        requestNumber: data.requestNumber || "N/A",
                        itemNumber: index + 1,
                        estimateDeliveryDate: item.deliveryDate || "N/A",
                        deliveryAddress: item.deliveryAddress === "other" ? item.customDeliveryAddress || "N/A" : item.deliveryAddress || "N/A",
                        receiver: item.receiver || "N/A",
                        merk: item.merk || "N/A",
                        detailSpecs: item.detailSpecs || "N/A",
                        color: item.color || "N/A",
                        qty: item.qty || 0,
                        uom: item.uom || "N/A",
                        linkRef: item.linkRef || "N/A",
                        budgetMax: item.budgetMax || "N/A",
                        feedback: feedbackData ? feedbackData.feedback : "No feedback",
                    }));                    

                    setDataSource(requestData);
                } else {
                    console.log("No data found for requestNo:", requestNo);
                }
            } catch (error) {
                console.error("Error fetching request data:", error);
            }
        };

        fetchRequest();
    }, [userProfile, requestNo]);

    const handleTableChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) {
            setPageSize(size);
        }
    };

    const showCancelConfirmation = () => {
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleConfirmCancelRequest = async () => {
        if (!docId) {
            message.error("Failed to find the document ID.");
            return;
        }

        try {
            const requestDocRef = doc(db, "requests", docId);
            await deleteDoc(requestDocRef);

            message.success("Request has been successfully canceled and removed.");
            setIsModalVisible(false);

            router.back();
        } catch (error) {
            console.error("Error deleting request:", error);
            message.error("Failed to cancel the request.");
        }
    };

    const shouldActionsBeVisible = userProfile?.role === "Requester" && status === "Rejected";
    const currentData = dataSource.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className={styles.requestContainer}>
            <div className={styles.requestHeader}>
                <div className={styles.requestLeft}>
                    <h3 className={styles.requestTitle}><strong>Request number: </strong>{requestNumber || "N/A"}</h3>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Entity:</strong> {entity}</p>
                    <p><strong>Division:</strong> {division}</p>
                </div>
                <div className={styles.requestRight}>
                    <p className={styles.status}>
                        <strong>Status: </strong>
                        <span
                            className={
                                status === "Approved"
                                    ? styles.statusApproved
                                    : status === "Rejected"
                                        ? styles.statusRejected
                                        : status === "In Progress"
                                            ? styles.statusInProgress
                                            : ""
                            }
                        >
                            {status}
                        </span>
                    </p>
                    {shouldActionsBeVisible && (
                        <div className={styles.actions}>
                            <button className={styles.cancelButton} onClick={showCancelConfirmation}>Cancel Request</button>
                            <button className={styles.editButton}>Edit Request</button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.spacing} />

            <Table<DataType>
                columns={columns}
                dataSource={currentData}
                pagination={false}
                bordered
                scroll={{ x: 200 }}
                className={styles.table}
            />

            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={dataSource.length}
                onChange={handleTableChange}
                className={styles.pagination}
                showSizeChanger={true}
                pageSizeOptions={['10', '20', '50', '100']}
            />

            {userProfile?.role === "Requester" && status === "Rejected" && feedbackData && (
                <Card
                    title={`Feedback from: ${name} | ${feedbackData.role}`}
                    className={styles.feedbackCard}
                    headStyle={{ textAlign: 'center', backgroundColor: '#FAFAFA' }}
                >
                    <p>{feedbackData.feedback}</p>
                </Card>
            )}

            <Modal
                title="Confirm Cancel Request"
                open={isModalVisible}
                onOk={handleConfirmCancelRequest}
                onCancel={handleModalCancel}
                okText="Yes, Cancel"
                cancelText="No"
            >
                <p>Are you sure you want to cancel this request?</p>
            </Modal>
        </div>
    );
};

export default DetailRequestTable;