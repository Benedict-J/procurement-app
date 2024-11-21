import { db } from "@/firebase/firebase";
import { Form, Input, Button, Select, Row, DatePicker, Col, Popconfirm, message, ConfigProvider } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/id"
dayjs.locale("id")

import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect, useCallback } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Autosave, useAutosave } from 'react-autosave';
import { handleStatusChange } from "@/utils/notifications/handleStatusUtils";

const { Option } = Select;

const convertMonthToRoman = (month: number) => {
  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romanNumerals[month - 1];
};

const generateRequestNumber = async (entityAbbr: string, division: string) => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;
  const romanMonth = convertMonthToRoman(currentMonth);

  // Ambil counter dari Firebase
  const counterDocRef = doc(db, "counters", "requestCounter");
  const counterSnapshot = await getDoc(counterDocRef);
  let currentIndex = 1;

  if (counterSnapshot.exists()) {
    currentIndex = counterSnapshot.data().currentIndex + 1;
  } else {
    await setDoc(counterDocRef, { currentIndex: 1 });
  }

  // Update counter di Firebase
  await updateDoc(counterDocRef, {
    currentIndex: currentIndex,
  });

  const requestIndex = currentIndex.toString().padStart(5, "0");

  // Format final nomor request
  return `PR${entityAbbr}${currentYear}${requestIndex}${romanMonth}${division}`;
};


const RequestForm = () => {
  const { userProfile, selectedProfileIndex } = useUserContext();
  const { user } = useUserContext();
  const requesterId = user?.uid;
  const [loading, setLoading] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState<{ [key: number]: boolean }>({});
  const [customAddress, setCustomAddress] = useState<{ [key: number]: string }>({});
  const [budgetMax, setBudgetMax] = useState("");
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanData = (data: any) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (dayjs.isDayjs(value)) {
          return [key, value.format("YYYY-MM-DD")];
        }
        return [key, value === undefined ? null : value];
      })
    );
  };

  const saveDraftToFirebase = async (data: any) => {
    if (!user || selectedProfileIndex === null || Object.keys(data).length === 0 || isSubmitting) return;

    try {
      const cleanedData = cleanData(data);
      const draftDocRef = doc(db, "draftRequests", `${user.uid}_${selectedProfileIndex}`);
      await setDoc(draftDocRef, cleanedData);
      console.log("Data form sementara disimpan ke Firebase:", cleanedData);
    } catch (error) {
      console.error("Gagal menyimpan data sementara ke Firebase:", error);
    }
  };


  const loadDraftData = async () => {
    if (!user || selectedProfileIndex === null) return;

    try {
      const draftDocRef = doc(db, "draftRequests", `${user.uid}_${selectedProfileIndex}`);
      const draftDoc = await getDoc(draftDocRef);

      if (draftDoc.exists()) {
        const draftData = draftDoc.data();
        setFormData(draftData as FormData);
        form.setFieldsValue(draftData);
      } else {
        setFormData({} as FormData);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error loading draft data:", error);
    }
  };

  useEffect(() => {
    if (requesterId) {
      loadDraftData();
    }
  }, [user, selectedProfileIndex, form]);


  const handleFormChange = (changedValues: FormData, allValues: FormData) => {
    setFormData(allValues);
  };

  const handleAddressChange = (value: string, index: number) => {
    setIsOtherSelected((prev) => ({ ...prev, [index]: value === "other" }));
  };

  const handleCustomAddressChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    setCustomAddress((prev) => ({ ...prev, [index]: value }));
  };


  const disabledDate = (current: Dayjs) => {
    return current && (current < dayjs().endOf('day') || current < dayjs().add(7, 'days'));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = value.replace(/[^0-9.]/g, "");

    setBudgetMax(formattedValue);
  };

  const formatCurrency = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [formList, setFormList] = useState([1]);

  const addNewForm = () => {
    setFormList([...formList, formList.length + 1]);
  };


  const deleteForm = (indexToDelete: number) => {
    const updatedFormList = formList.filter((_, i) => i !== indexToDelete);

    const newValues: Record<string, any> = {};
    updatedFormList.forEach((_, newIndex) => {
      newValues[`merk${newIndex + 1}`] = form.getFieldValue(`merk${newIndex + 2}`);
      newValues[`detailSpecs${newIndex + 1}`] = form.getFieldValue(`detailSpecs${newIndex + 2}`);
      newValues[`color${newIndex + 1}`] = form.getFieldValue(`color${newIndex + 2}`);
      newValues[`qty${newIndex + 1}`] = form.getFieldValue(`qty${newIndex + 2}`);
      newValues[`uom${newIndex + 1}`] = form.getFieldValue(`uom${newIndex + 2}`);
      newValues[`linkRef${newIndex + 1}`] = form.getFieldValue(`linkRef${newIndex + 2}`);
      newValues[`budgetMax${newIndex + 1}`] = form.getFieldValue(`budgetMax${newIndex + 2}`);
      newValues[`deliveryDate${newIndex + 1}`] = form.getFieldValue(`deliveryDate${newIndex + 2}`);
      newValues[`receiver${newIndex + 1}`] = form.getFieldValue(`receiver${newIndex + 2}`);
      newValues[`deliveryAddress${newIndex + 1}`] = form.getFieldValue(`deliveryAddress${newIndex + 2}`);
      newValues[`customDeliveryAddress${newIndex + 1}`] = form.getFieldValue(`customDeliveryAddress${newIndex + 2}`);
      newValues[`taxCost${newIndex + 1}`] = form.getFieldValue(`taxCost${newIndex + 2}`);
      newValues[`deliveryFee${newIndex + 1}`] = form.getFieldValue(`deliveryFee${newIndex + 2}`);
    });

    form.setFieldsValue(newValues);
    setFormList(updatedFormList);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setIsSubmitting(true);
    console.log("Data yang akan dikirim ke Firestore:", values);
    console.log("User Profile Data:", userProfile);

    if (!userProfile || !userProfile.email || !userProfile.entity || !userProfile.role) {
      alert("User profile data is missing or incomplete. Please log in again.");
      setLoading(false);
      return;
    }

    if (!requesterId) {
      alert("User not logged in.");
      return;
    }

    const items = formList.map((item, index) => ({
      deliveryDate: values[`deliveryDate${index + 1}`]
        ? dayjs(values[`deliveryDate${index + 1}`]).format("YYYY-MM-DD")
        : null,
      deliveryAddress: values[`deliveryAddress${index + 1}`] || "",
      receiver: values[`receiver${index + 1}`] || "",
      customDeliveryAddress: values[`customDeliveryAddress${index + 1}`] || null,
      merk: values[`merk${index + 1}`] || "",
      detailSpecs: values[`detailSpecs${index + 1}`] || "",
      color: values[`color${index + 1}`] || "",
      qty: values[`qty${index + 1}`] || 0,
      uom: values[`uom${index + 1}`] || "",
      linkRef: values[`linkRef${index + 1}`] || "",
      budgetMax: values[`budgetMax${index + 1}`] || "",
      taxCost: values[`taxCost${index + 1}`] || "",
      deliveryFee: values[`deliveryFee${index + 1}`] || "",
    }));

    function generateEntityAbbr(entityName: string): string {
      // Daftar kata yang harus diabaikan (seperti "PT")
      const skipWords = ["PT"];

      return entityName
        .split(" ") // 
        .filter(word => !skipWords.includes(word))
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();
    }

    try {

      if (!userProfile) {
        alert("User profile data is missing. Please log in.");
        return;
      }

      const entityAbbr = generateEntityAbbr(userProfile.entity);
      const divisionAbbr = userProfile.divisi.substring(0, 3).toUpperCase();
      const requestNumber = await generateRequestNumber(entityAbbr, divisionAbbr);
      const requesterName = userProfile.namaLengkap;
      const requesterDivision = userProfile.divisi;
      const requesterEmail = userProfile.email;
      const requesterEntity = userProfile.entity;

      if (requesterEntity !== userProfile.entity) {
        alert(`Your request can only be associated with your entity: ${userProfile.entity}.`);
        setLoading(false);
        return;
      }

      // Menyimpan request ke Firestore
      const docRef = await addDoc(collection(db, "requests"), {
        items: items,
        requestNumber: requestNumber,
        status: 'In Progress',
        requesterId: requesterId,
        requesterName: requesterName,
        requesterDivision: requesterDivision,
        requesterEmail: requesterEmail,
        requesterEntity: requesterEntity,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        approvalStatus: {
          checker: { approved: false, rejected: false, approvedBy: null, approvedAt: null, feedback: null },
          approval: { approved: false, rejected: false, approvedBy: null, approvedAt: null, feedback: null },
          releaser: { approved: false, rejected: false, approvedBy: null, approvedAt: null, feedback: null },
        }, // Menyimpan waktu request dibuat
      });
      await setDoc(doc(db, "draftRequests", `${requesterId}_${selectedProfileIndex}`), {});
      // Kosongkan data form di UI
      setFormData({} as FormData);
      form.resetFields();
      message.success('Request submitted successfully');
      await handleStatusChange(docRef.id);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000)
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };


  return (
    <>

      {/* Form */}
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={formData}
        form={form}
        onValuesChange={handleFormChange}
      >
        <Autosave data={formData} onSave={saveDraftToFirebase} />
        {formList.map((_, index) => (
          <div key={index} style={{ marginBottom: 36 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <p style={{ fontSize: 20, fontWeight: 600, color: "grey" }}>Item {index + 1}</p>
              </Col>
              {formList.length > 1 && (
                <Col>
                  <Popconfirm
                    title="Are you sure you want to delete this item?"
                    onConfirm={() => deleteForm(index)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger>
                      Delete Item {index + 1}
                    </Button>
                  </Popconfirm>
                </Col>
              )}
            </Row>

            <Form.Item
              label="Merk"
              name={`merk${index + 1}`}
              rules={[{ required: true, message: "Please input merk" }]}
            >
              <Input placeholder="Merk" />
            </Form.Item>

            <Form.Item
              label="Detail Specs"
              name={`detailSpecs${index + 1}`}
              rules={[{ required: true, message: "Please provide Detail Specs!" }]}
            >
              <Input.TextArea placeholder="Enter Detail Specs for asset request" />
            </Form.Item>

            <Form.Item
              label="Color"
              name={`color${index + 1}`}
              rules={[{ required: true, message: "Please input the color" }]}
            >
              <Input placeholder="Color" />
            </Form.Item>

            <Form.Item
              label="QTY"
              name={`qty${index + 1}`}
              rules={[
                { required: true, message: "Please input the quantity" },
                {
                  validator: (_, value) =>
                    /^\d+$/.test(value)
                      ? Promise.resolve()
                      : Promise.reject("Only whole numbers are allowed"),
                },
              ]}
            >
              <Input placeholder="Quantity" onChange={(e) => {
                const cleanedValue = e.target.value.replace(/\D/g, "");
                form.setFieldsValue({ [`qty${index + 1}`]: cleanedValue });
              }} />
            </Form.Item>

            <Form.Item
              label="UoM"
              name={`uom${index + 1}`}
              rules={[{ required: true, message: "Please input the UoM" }]}
            >
              <Input placeholder="Unit of Measurement" />
            </Form.Item>

            <Form.Item
              label="Link Ref"
              name={`linkRef${index + 1}`}
              rules={[{ required: true, message: "Please input the Link Ref" }]}
            >
              <Input placeholder="Link Reference" />
            </Form.Item>

            <Form.Item
              label="Budget Max"
              name={`budgetMax${index + 1}`}
              rules={[
                { required: true, message: "Please input the Budget Max" },
                {
                  validator: (_, value) => {
                    const regex = /^[0-9]+(\.[0-9]{3})*$/; // Mengizinkan angka dengan titik pemisah ribuan
                    if (!value || regex.test(value)) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Only numbers are allowed with '.' as thousand separators");
                    }
                  },
                },
              ]}
            >
              <Input
                placeholder="Budget Max"
                value={formatCurrency(budgetMax)}
                onChange={handleBudgetChange}
                addonBefore="Rp"
              />
            </Form.Item>

            <Form.Item
              label="Tax Cost"
              name={`taxCost${index + 1}`}
              rules={[
                { required: true, message: "Please input the Tax Cost" },
                {
                  validator: (_, value) => {
                    const regex = /^[0-9]+(\.[0-9]{3})*$/;
                    if (!value || regex.test(value)) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Only numbers and characters '.' or ',' are allowed");
                    }
                  },
                },
              ]}
            >
              <Input placeholder="Tax Cost" 
              addonBefore="Rp"/>
            </Form.Item>

            <Form.Item
              label="Delivery Fee"
              name={`deliveryFee${index + 1}`}
              rules={[
                { required: true, message: "Please input the Delivery Fee" },
                {
                  validator: (_, value) => {
                    const regex = /^[0-9]+(\.[0-9]{3})*$/;
                    if (!value || regex.test(value)) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject("Only numbers and characters '.' or ',' are allowed");
                    }
                  },
                },
              ]}
            >
              <Input placeholder="Delivery Fee" 
              addonBefore="Rp"/>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  // initialValue={dayjs().valueOf()}
                  label="Estimated Delivery Date"
                  name={`deliveryDate${index + 1}`}
                  extra="You must choose above 7 days"
                  rules={[{ required: true, message: "Please select the delivery date!" }]}
                  getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
                  normalize={(value) => value ? dayjs(value).toISOString() : null}
                >
                  <DatePicker style={{ width: "100%" }} placeholder="Select Date" disabledDate={disabledDate} />
                </Form.Item>

                <Form.Item
                  label="Receiver"
                  name={`receiver${index + 1}`}
                  rules={[{ required: true, message: "Please input the Receiver" }]}
                >
                  <Input placeholder="Receiver Name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Delivery Address"
                  name={`deliveryAddress${index + 1}`}
                  rules={[{ required: !isOtherSelected, message: "Please select the delivery address!" }]}
                >
                  <Select placeholder="Select Address" onChange={(value) => handleAddressChange(value, index)}>
                    <Option value="Cyber 2 Tower Lt. 28 Jl. H. R. Rasuna Said No.13, RT.7/RW.2, Kuningan, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12950">Cyber 2 Tower Lt. 28 Jl. H. R. Rasuna Said No.13, RT.7/RW.2, Kuningan, Kecamatan Setiabudi, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12950</Option>
                    <Option value="Mall Balekota Tangerang Lt. 1 Jl. Jenderal Sudirman No.3, RT.002/RW.012, Buaran Indah, Kec. Tangerang, Kota Tangerang, Banten 15119">Mall Balekota Tangerang Lt. 1 Jl. Jenderal Sudirman No.3, RT.002/RW.012, Buaran Indah, Kec. Tangerang, Kota Tangerang, Banten 15119</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                {isOtherSelected[index] && (
                  <Form.Item
                    label="Custom Delivery Address"
                    name={`customDeliveryAddress${index + 1}`}
                    rules={[{ required: true, message: "Please enter the delivery address!" }]}
                  >
                    <Input placeholder="Enter your delivery address" value={customAddress[index] || ""} onChange={(e) => handleCustomAddressChange(e, index)} />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </div>
        ))}

        <Row gutter={16}>
          <Col span={12}>
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <Button type="dashed" onClick={addNewForm}>
                Add New Item
              </Button>
            </div>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={false}>
                Submit Request
              </Button>
            </Form.Item>
          </Col>
        </Row>

      </Form>
    </>
  );
};

export default RequestForm;
