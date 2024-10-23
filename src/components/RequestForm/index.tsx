import { Form, Input, Button, Select } from "antd";
import { useState } from "react";

const { Option } = Select;

const RequestForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Request submitted!");
    }, 2000);
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ remember: true }}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input your name!" }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item
        label="Division"
        name="division"
        rules={[{ required: true, message: "Please select the asset type!" }]}
      >
        <Select placeholder="Select division">
          <Option value="Division A">Division A</Option>
          <Option value="Division B">Division B</Option>
          <Option value="Division C">Division C</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Entity"
        name="entity"
        rules={[{ required: true, message: "Please select the asset type!" }]}
      >
        <Select placeholder="Select entity">
          <Option value="Entity A">Entity A</Option>
          <Option value="Entity B">Entity B</Option>
          <Option value="Entity C">Entity C</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Justification"
        name="justification"
        rules={[{ required: true, message: "Please provide justification!" }]}
      >
        <Input.TextArea placeholder="Enter justification for asset request" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit Request
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RequestForm;
