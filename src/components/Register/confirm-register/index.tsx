import {
    Layout,
    Card,
    Button,
    Form,
    Input,
    Image,
    Divider,
    Typography,
    message,
  } from "antd";
  import classes from "./index.module.scss";
  import { useRouter } from "next/router";
  import { Select, Space } from 'antd';
  import type { SelectProps } from 'antd';
  import { useEffect } from "react";
  import { registerUser } from "@/firebase/register";
  
  const { Text } = Typography;
  const { Content } = Layout;
  
  const ConfirmRegisterPage: React.FC | any = () => {
    const router = useRouter();

    const { nik, namaLengkap, divisi, role } = router.query;

    const options: SelectProps['options'] = [
      { label: 'Company A', value: 'Company A' },
      { label: 'Company B', value: 'Company B' },
      { label: 'Company C', value: 'Company C' },
      { label: 'Company D', value: 'Company D' },
      { label: 'Company E', value: 'Company E' }
    ];

    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
      console.log("Form values: ", values);
      const { email, password, confirmPassword, company} = values;

      if (!company || company.length === 0) {
        message.error("Please select at least one company");
        return;
      }

      if (password !== confirmPassword) {
        message.error("Password not match!");
        return;
      }
    
      try {
        const result = await registerUser(nik, namaLengkap, divisi, role, email, password, company);
    
        if (result.success) {
          message.success("Register success! Verification email has been sent");
          router.push("/auth/email-verification");
        } else {
          message.error(result.message);
        }
      } catch (error) {
        message.error("An unknown error occured, try again.");
      }
    }
  
    return (
      <>
        <Content className={classes.confirmRegisterContainer}>
          <Card className={classes.cardRegister} style={{ maxWidth: '400px', marginTop: "70px" }}>
            <div className={classes.logo}>
              <div style={{ textAlign: "center" }}>
                <Image
                  src="/images/app-logo/adakami_logo.png"
                  width={160}
                  preview={false}
                  alt="logo"
                />
              </div>
            </div>
  
            <Divider />
  
            <p style={{ marginBottom: 20, textAlign: 'center'}}>
              <Text style={{color : '#000000', fontWeight: 'bold', fontSize: "20px"}}>
                Confirm Registration
              </Text>
            </p>
            
            <Form layout="vertical">
            <Form.Item label="Full Name">
            <Input value={namaLengkap} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Division">
            <Input value={divisi} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Role">
            <Input value={role} readOnly style={{color:"grey"}}/>
            </Form.Item>
            </Form>

  
            <Form
              form={form}
              name="confirm-register"
              layout="vertical"
              initialValues={{ remember: false }}
              onFinish={onFinish}
              autoComplete="off"
            >
            <Space style={{ width: '100%' }} direction="vertical">
              <Form.Item
                label="Company"
                name="company"
                rules={[{ required: true, message: 'Please select at least one company!' }]}
              >
                <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select"
                options={options}
                />
              </Form.Item>
            </Space>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: 'email', message: "Email not valid!" }
                ]}
              >
                <Input />
              </Form.Item>
  
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters!",
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                    message: "The password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character (@$!%*?&)",
                  }
                ]}
              >
                <Input.Password />
              </Form.Item>
  
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  htmlType="submit"
                  size="middle"
                  block
                  style={{ backgroundColor: "#1F9245", color: "#ffffff", marginTop: "10px" }}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </>
    );
  };
  
  export default ConfirmRegisterPage;
  