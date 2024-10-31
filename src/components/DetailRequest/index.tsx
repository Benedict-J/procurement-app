import { useEffect, useState } from "react";
import { Table, Pagination } from "antd";
import type { TableColumnsType } from "antd";
import { useUserContext } from "@/contexts/UserContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import styles from './index.module.scss';

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

    // Definisi kolom tabel
    const columns: TableColumnsType<DataType> = [
        {
            title: "Nomor Item",
            dataIndex: "itemNumber",
            key: "itemNumber",
            align: "center",
        },
        {
            title: "Estimate Delivery Date",
            dataIndex: "estimateDeliveryDate",
            key: "estimateDeliveryDate",
            align: "center",
        },
        {
            title: "Delivery Address",
            dataIndex: "deliveryAddress",
            key: "deliveryAddress",
            align: "center",
        },
        {
            title: "Merk",
            dataIndex: "merk",
            key: "merk",
            align: "center",
        },
        {
            title: "Detail Specs",
            dataIndex: "detailSpecs",
            key: "detailSpecs",
            align: "center",
        },
        {
            title: "Color",
            dataIndex: "color",
            key: "color",
            align: "center",
        },
        {
            title: "QTY",
            dataIndex: "qty",
            key: "qty",
            align: "center",
        },
        {
            title: "UoM",
            dataIndex: "uom",
            key: "uom",
            align: "center",
        },
        {
            title: "Link Ref",
            dataIndex: "linkRef",
            key: "linkRef",
            align: "center",
        },
        {
            title: "Budget Max",
            dataIndex: "budgetMax",
            key: "budgetMax",
            align: "center",
        },
    ];

    // Mengambil data request dari Firebase berdasarkan nomor request
    useEffect(() => {
        const fetchRequest = async () => {
            if (!userProfile || !requestNo) return;

            console.log("Fetching data for requestNo:", requestNo);

            // Query berdasarkan nomor request
            const requestQuery = query(
                collection(db, "requests"),
                where("requestNumber", "==", requestNo)
            );

            try {
                const querySnapshot = await getDocs(requestQuery);
                if (!querySnapshot.empty) {
                    const firstDoc = querySnapshot.docs[0];
                    console.log("Data retrieved:", firstDoc.data());
                    setRequestNumber(firstDoc.data().requestNumber || "N/A");

                    // Proses data items
                    const requestData = (firstDoc.data().items || []).map((item: any, index: number) => ({
                        key: `${firstDoc.id}-${index}`, // Buat key unik dengan menggabungkan ID dokumen dan index
                        requestNumber: firstDoc.data().requestNumber || "N/A",
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
                    }));

                    console.log("Processed request data for table:", requestData);

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
        console.log("Updated currentPage:", page);
        console.log("Updated pageSize:", size);
    };

    // Data yang ditampilkan pada halaman saat ini
    const currentData = dataSource.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className={styles.requestContainer}>
            <h3 style={{ marginBottom: "0px", display: "inline", fontWeight: "bold" }}>
                Nomor Request:
            </h3>
            <span className={styles.requestNumber}>
                {requestNumber || "N/A"}
            </span>
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
        </div>
    );
};

export default DetailRequestTable;