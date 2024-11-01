import { useEffect, useState } from "react";
import { Table, Pagination, message, Modal, Button } from "antd";
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

    // State untuk menyimpan ID dokumen
    const [docId, setDocId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const columns: TableColumnsType<DataType> = [
        { title: "Nomor Item", dataIndex: "itemNumber", key: "itemNumber", align: "center" },
        { title: "Estimate Delivery Date", dataIndex: "estimateDeliveryDate", key: "estimateDeliveryDate", align: "center" },
        { title: "Delivery Address", dataIndex: "deliveryAddress", key: "deliveryAddress", align: "center" },
        { title: "Merk", dataIndex: "merk", key: "merk", align: "center" },
        { title: "Detail Specs", dataIndex: "detailSpecs", key: "detailSpecs", align: "center" },
        { title: "Color", dataIndex: "color", key: "color", align: "center" },
        { title: "QTY", dataIndex: "qty", key: "qty", align: "center" },
        { title: "UoM", dataIndex: "uom", key: "uom", align: "center" },
        { title: "Link Ref", dataIndex: "linkRef", key: "linkRef", align: "center" },
        { title: "Budget Max", dataIndex: "budgetMax", key: "budgetMax", align: "center" },
        // kalau feedback mau pakai kolom tabel
        // { title: "Feedback", dataIndex: "feedback", key: "feedback", align: "center" },
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
                    setDocId(firstDoc.id); // Set ID dokumen
                    setRequestNumber(data.requestNumber || "N/A");

                    setEntity(data.requesterEntity || "N/A");
                    setDivision(data.requesterDivision || "N/A");
                    setStatus(data.status || "Pending");
                    setName(data.requesterName || "N/A");

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
                        deliveryAddress: item.deliveryAddress || "N/A",
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
    }, [userProfile, requestNo, feedbackData]);

    const handleTableChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) {
            setPageSize(size);
        }
    };

    // Fungsi untuk menampilkan modal konfirmasi
    const showCancelConfirmation = () => {
        setIsModalVisible(true);
    };

    // Fungsi untuk menyembunyikan modal tanpa menghapus data
    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // Handler untuk menghapus data dari Firebase dan state setelah konfirmasi
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
    
            // Mengembalikan pengguna ke halaman sebelumnya
            router.back();
        } catch (error) {
            console.error("Error deleting request:", error);
            message.error("Failed to cancel the request.");
        }
    };    

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
                    <p className={styles.status}><strong>Status:</strong> {status}</p>
                    {feedbackData && (
                        <div>
                            <p><strong>Feedback from {feedbackData.role}:</strong></p>
                            <p>{feedbackData.feedback}</p>
                        </div>
                    )}
                    <div className={styles.actions}>
                        <button className={styles.cancelButton} onClick={showCancelConfirmation}>Cancel Request</button>
                        <button className={styles.editButton}>Edit Request</button>
                    </div>
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

            {/* Modal Konfirmasi */}
            <Modal
                title="Confirm Cancel Request"
                visible={isModalVisible}
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