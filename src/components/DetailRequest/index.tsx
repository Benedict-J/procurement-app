import { useEffect, useState } from "react";
import { Table, Pagination } from "antd";
import type { TableColumnsType } from "antd";
import { useUserContext } from "@/contexts/UserContext";
import { collection, getDocs, query, limit } from "firebase/firestore"; // tambahkan limit
import { db } from "@/firebase/firebase";
import styles from './index.module.scss'; // Import file SCSS

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

const DetailRequestTable = () => {
    const { userProfile } = useUserContext();
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [requestNumber, setRequestNumber] = useState<string | null>(null); // Nomor request state
    const pageSize = 1; // Menampilkan satu nomor request per halaman

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

    // Mengambil data request dari Firebase
    useEffect(() => {
        const fetchRequest = async () => {
            if (!userProfile) return;

            const requestQuery = query(collection(db, "requests"), limit(1));
            const querySnapshot = await getDocs(requestQuery);
            if (!querySnapshot.empty) {
                const firstDoc = querySnapshot.docs[0];
                setRequestNumber(firstDoc.data().requestNumber || "N/A");
                const requestData = (firstDoc.data().items || []).map((item: any, index: number) => ({
                    key: firstDoc.id,
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
                setDataSource(requestData);
            }
        };

        fetchRequest();
    }, [userProfile]);

    // Mengubah halaman tabel
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                onChange={handlePageChange}
                className={styles.pagination}
                showSizeChanger={false}
            />
        </div>
    );
};

export default DetailRequestTable;