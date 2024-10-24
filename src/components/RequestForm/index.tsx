import { db } from "@/firebase/firebase";
import { Form, Input, Button, Select, Row, DatePicker, Col, Popconfirm } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

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

  const requestIndex = currentIndex.toString().padStart(5, "0"); // Nomor urut dengan 5 digit

  // Format final nomor request
  return `PR${entityAbbr}${currentYear}${requestIndex}${romanMonth}${division}`;
};


const RequestForm = () => {
  const [loading, setLoading] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  const handleAddressChange = (value: string) => {
    if (value === "other") {
      setIsOtherSelected(true);
    } else {
      setIsOtherSelected(false);
    }
  };

  const disabledDate = (current: Dayjs ) => {
    return current && (current < dayjs().endOf('day') || current < dayjs().add(7, 'days'));
  };

  const [budgetMax, setBudgetMax] = useState("");

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = value.replace(/[^0-9.]/g, "");

    setBudgetMax(formattedValue);
  };

  const [formList, setFormList] = useState([1]);

  const addNewForm = () => {
    setFormList([...formList, formList.length + 1]);
  };

  const deleteForm = (index: number) => {
    const updatedFormList = formList.filter((_, i) => i !== index);
    setFormList(updatedFormList);
  };


  const onFinish = async (values: any) => {
    setLoading(true);

    const items = formList.map((item, index) => ({
      name: values[`name${index + 1}`] || "",
      division: values[`division${index + 1}`] || "",
      entity: values[`entity${index + 1}`] || "",
      deliveryDate: values[`deliveryDate${index + 1}`]?.format('YYYY-MM-DD') || null,
      deliveryAddress: values[`deliveryAddress${index + 1}`] || "",
      customDeliveryAddress: values[`customDeliveryAddress${index + 1}`] || null ,
      merk: values[`merk${index + 1}`] || "",
      detailSpecs: values[`detailSpecs${index + 1}`] || "",
      color: values[`color${index + 1}`] || "",
      uom: values[`uom${index + 1}`] || "",
      linkRef: values[`linkRef${index + 1}`] || "",
      budgetMax: values[`budgetMax${index + 1}`] || "",
    }));

    try {

      const entityAbbr = values["entity1"].substring(0, 3).toUpperCase(); // Ambil 3 huruf pertama dari entity
      const division = values["division1"].substring(0, 2).toUpperCase(); // Ambil 2 huruf pertama dari division
      const requestNumber = await generateRequestNumber(entityAbbr, division);

      // Menyimpan request ke Firestore
      await addDoc(collection(db, "requests"), {
        items: items,
        requestNumber: requestNumber,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), // Menyimpan waktu request dibuat
      });
      alert(`Request submitted successfully with Request Number: ${requestNumber}`);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

    {/* Form */}
    <Form layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
      {formList.map((_, index) => (
        <div key={index} style={{ marginBottom: 36 }}>
          <Row justify="space-between" align="middle">
              <Col>
                <p style={{ fontSize: 20, fontWeight: 600, color: "grey" }}>Item {index + 1}</p>
              </Col>
              {index > 0 && (
                <Col>
                  <Popconfirm
                    title="Are you sure you want to delete this item?"
                    onConfirm={() => deleteForm(index)}  // Aksi ketika pengguna mengkonfirmasi
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
            label="Name"
            name={`name${index + 1}`}
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item
            label="Division"
            name={`division${index + 1}`}
            rules={[{ required: true, message: "Please select the asset type!" }]}
          >
            <Select placeholder="Select division">
              <Option value="IT">IT</Option>
              <Option value="GENERAL AFFAIR">GENERAL AFFAIR</Option>
              <Option value="TELEMARKETING">TELEMARKETING</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Entity"
            name={`entity${index + 1}`}
            rules={[{ required: true, message: "Please select the asset type!" }]}
          >
            <Select placeholder="Select entity">
              <Option value="PDI">PT Pembiayaan Digital</Option>
              <Option value="BGJ">PT Berkah Jaya Giat</Option>
              
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Estimated Delivery Date"
                name={`deliveryDate${index + 1}`}
                rules={[{ required: true, message: "Please select the delivery date!" }]}
              >
                <DatePicker style={{ width: "100%" }} placeholder="Select Date" disabledDate={disabledDate} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Delivery Address"
                name={`deliveryAddress${index + 1}`}
                rules={[{ required: !isOtherSelected, message: "Please select the delivery address!" }]}
              >
                <Select placeholder="Select Address" onChange={handleAddressChange}>
                  <Option value="Cyber 2">Cyber 2 Tower</Option>
                  <Option value="Balekota">Mall Balekota Tangerang</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>

              {isOtherSelected && (
                <Form.Item
                  label="Custom Delivery Address"
                  name={`customDeliveryAddress${index + 1}`}
                  rules={[{ required: true, message: "Please enter the delivery address!" }]}
                >
                  <Input placeholder="Enter your delivery address" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} />
                </Form.Item>
              )}
            </Col>
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
            name={`detailSpecs${index + 1}}`}
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
            label="UoM"
            name={`uom${index + 1}`}
            rules={[{ required: true, message: "Please input the UoM" }]}
          >
            <Input placeholder="UoM" />
          </Form.Item>

          <Form.Item
            label="Link Ref"
            name={`linkRef${index + 1}`}
            rules={[{ required: true, message: "Please input the Link Ref" }]}
          >
            <Input placeholder="Link Ref" />
          </Form.Item>

          <Form.Item
            label="Budget Max"
            name={`budgetMax${index + 1}`}
            rules={[{ required: true, message: "Please input the Budget Max" }]}
          >
            <Input placeholder="Budget Max" value={budgetMax} onChange={handleBudgetChange} addonBefore="Rp" />
          </Form.Item>
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
      <Col span={12} style={{textAlign: "right"}}>
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
