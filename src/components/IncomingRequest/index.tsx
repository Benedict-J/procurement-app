import { Table, Button, Pagination } from "antd";
import { useState } from "react";
import type { TableColumnsType } from "antd";

interface DataType {
    key: React.Key;
    name: string;
    requestNo: string;
    detail: string;
}

const IncomingRequest = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20); 

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
            render: () => (
                <Button type="primary" size="small">
                    Check
                </Button>
            ),
        },
        {
            title: "Action",
            key: "action",
            align: "center",
            render: () => (
                <>
                    <Button type="primary" style={{ marginRight: 8 }} size="small">
                        Approve
                    </Button>
                    <Button type="default" danger size="small">
                        Reject
                    </Button>
                </>
            ),
        },
    ];

    // Data contoh untuk tabel
    const dataSource = Array.from({ length: 100 }).map<DataType>((_, i) => ({
        key: i,
        name: `Edward Test${i}`,
        requestNo: `REQ-001057 ${i}`,
        detail: `Detail for request ${i}`,
    }));

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
