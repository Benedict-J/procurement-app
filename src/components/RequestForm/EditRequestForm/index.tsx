import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Form, Input, Button, Select, Row, DatePicker, Col, message, Collapse } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { db } from "@/firebase/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import "dayjs/locale/en";

const { Option } = Select;
const { Panel } = Collapse;

interface EditRequestFormProps {
    requestNo: string;
}

const EditRequestForm: React.FC<EditRequestFormProps> = ({ requestNo }) => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [isOtherSelected, setIsOtherSelected] = useState<{ [key: number]: boolean }>({});
    const [customAddress, setCustomAddress] = useState<{ [key: number]: string }>({});
    const [docId, setDocId] = useState<string | null>(null);

    const fetchRequestData = async () => {
        if (!requestNo) return;

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

                const itemsWithFormattedDates = (data.items || []).map((item: any, index: number) => {
                    const isOther = item.deliveryAddress === "other";

                    if (isOther) {
                        setCustomAddress((prev) => ({ ...prev, [index]: item.customDeliveryAddress || "" }));
                    }

                    return {
                        ...item,
                        deliveryDate: item.deliveryDate ? dayjs(item.deliveryDate) : null,
                    };
                });

                setInitialData({ ...data, items: itemsWithFormattedDates });
                form.setFieldsValue({ items: itemsWithFormattedDates });

                const updatedIsOtherSelected = itemsWithFormattedDates.reduce((acc: any, item: any, index: number) => {
                    acc[index] = item.deliveryAddress === "other";
                    return acc;
                }, {});
                setIsOtherSelected(updatedIsOtherSelected);
            } else {
                message.error("No data found for the given request number.");
            }
        } catch (error) {
            console.error("Error fetching request data:", error);
            message.error("Failed to fetch request data.");
        }
    };

    useEffect(() => {
        fetchRequestData();
    }, [requestNo, form]);

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            if (!docId) {
                message.error("Document ID not found.");
                return;
            }

            const formattedItems = values.items.map((item: any) => ({
                ...item,
                deliveryDate: item.deliveryDate ? item.deliveryDate.format("YYYY-MM-DD") : null,
            }));

            const currentDate = new Date();
            const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

            const docRef = doc(db, "requests", docId);

            await updateDoc(docRef, {
                items: formattedItems,
                createdAt: formattedDate,
                status: "In Progress",
                approvalStatus: {
                    checker: { approved: false, rejected: false, feedback: null },
                    approval: { approved: false, rejected: false, feedback: null },
                    releaser: { approved: false, rejected: false, feedback: null }
                }
            });

            message.success("Request updated and sent back for Checker.");
            router.push(`/requester/detail-request?requestNo=${requestNo}`);
        } catch (error) {
            console.error("Error updating data:", error);
            message.error("Failed to update data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (value: string, index: number) => {
        setIsOtherSelected((prev) => ({ ...prev, [index]: value === "other" }));
    };

    const handleCustomAddressChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        setCustomAddress((prev) => ({ ...prev, [index]: value }));
    };

    // Function to disable dates less than 7 days from today
    const disabledDate = (current: Dayjs) => {
        return current && (current < dayjs().endOf('day') || current < dayjs().add(7, 'days'));
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
        >
            <Collapse defaultActiveKey={[]}>
                {initialData?.items?.map((item: any, index: number) => (
                    <Panel header={`Item ${index + 1}`} key={index}>
                        <Form.Item
                            label="Brand"
                            name={['items', index, 'merk']}
                            rules={[{ required: true, message: "Please enter the brand" }]}
                            initialValue={item.merk}
                        >
                            <Input placeholder="Brand" />
                        </Form.Item>

                        <Form.Item
                            label="Detail Specs"
                            name={['items', index, 'detailSpecs']}
                            rules={[{ required: true, message: "Please enter detailed specs!" }]}
                            initialValue={item.detailSpecs}
                        >
                            <Input.TextArea placeholder="Enter detailed specs for the asset request" />
                        </Form.Item>

                        <Form.Item
                            label="Color"
                            name={['items', index, 'color']}
                            rules={[{ required: true, message: "Please enter the color" }]}
                            initialValue={item.color}
                        >
                            <Input placeholder="Color" />
                        </Form.Item>

                        <Form.Item
                            label="Quantity"
                            name={['items', index, 'qty']}
                            rules={[{ required: true, message: "Please enter the quantity" },
                            {
                                validator: (_, value) =>
                                    /^\d+$/.test(value)
                                        ? Promise.resolve()
                                        : Promise.reject("Only whole numbers are allowed"),
                            },
                            ]}
                            initialValue={item.qty}
                        >
                            <Input placeholder="Quantity" />
                        </Form.Item>

                        <Form.Item
                            label="Unit of Measurement"
                            name={['items', index, 'uom']}
                            rules={[{ required: true, message: "Please enter the unit of measurement" }]}
                            initialValue={item.uom}
                        >
                            <Input placeholder="Unit of Measurement" />
                        </Form.Item>

                        <Form.Item
                            label="Reference Link"
                            name={['items', index, 'linkRef']}
                            rules={[{ required: true, message: "Please enter the reference link" }]}
                            initialValue={item.linkRef}
                        >
                            <Input placeholder="Reference Link" />
                        </Form.Item>

                        <Form.Item
                            label="Maximum Budget"
                            name={['items', index, 'budgetMax']}
                            rules={[
                                { required: true, message: "Please enter the maximum budget" },
                                {
                                    validator: (_, value) => {
                                        const regex = /^[0-9]+(\.[0-9]{3})*$/; // Allow numbers with thousand separator
                                        if (!value || regex.test(value)) {
                                            return Promise.resolve();
                                        } else {
                                            return Promise.reject("Only numbers are allowed with '.' as thousand separators");
                                        }
                                    },
                                },
                            ]}
                            initialValue={item.budgetMax}
                        >
                            <Input placeholder="Maximum Budget" addonBefore="Rp" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Estimated Delivery Date"
                                    name={['items', index, 'deliveryDate']}
                                    extra="You must choose above 7 days"
                                    rules={[{ required: true, message: "Please select the delivery date!" }]}
                                    initialValue={item.deliveryDate}
                                >
                                    <DatePicker style={{ width: "100%" }} placeholder="Select Date" disabledDate={disabledDate} />
                                </Form.Item>

                                <Form.Item
                                    label="Receiver"
                                    name={['items', index, 'receiver']}
                                    rules={[{ required: true, message: "Please enter the receiver's name" }]}
                                    initialValue={item.receiver}
                                >
                                    <Input placeholder="Receiver Name" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Delivery Address"
                                    name={['items', index, 'deliveryAddress']}
                                    rules={[{ required: true, message: "Please select the delivery address!" }]}
                                    initialValue={item.deliveryAddress}
                                >
                                    <Select placeholder="Select Address" onChange={(value) => handleAddressChange(value, index)}>
                                        <Option value="Cyber 2 Tower Lt. 28 Jl. H. R. Rasuna Said">Cyber 2 Tower Lt. 28 Jl. H. R. Rasuna Said</Option>
                                        <Option value="Mall Balekota Tangerang">Mall Balekota Tangerang</Option>
                                        <Option value="other">Other</Option>
                                    </Select>
                                </Form.Item>

                                {isOtherSelected[index] && (
                                    <Form.Item
                                        label="Custom Delivery Address"
                                        name={['items', index, 'customDeliveryAddress']}
                                        rules={[{ required: true, message: "Please enter the delivery address!" }]}
                                        initialValue={item.customDeliveryAddress}
                                    >
                                        <Input placeholder="Enter your delivery address" value={customAddress[index] || ""} onChange={(e) => handleCustomAddressChange(e, index)} />
                                    </Form.Item>
                                )}
                            </Col>
                        </Row>
                    </Panel>
                ))}
            </Collapse>
            <Row style={{ paddingTop: "30px" }}>
                <Col span={12} style={{ textAlign: "left" }}>
                    <Button type="default" onClick={() => router.push(`/requester/detail-request?requestNo=${requestNo}`)}>
                        Cancel
                    </Button>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default EditRequestForm;
