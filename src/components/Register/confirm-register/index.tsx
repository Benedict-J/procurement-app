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
    Radio,
    Select,
    Space,
  } from "antd";
  import classes from "./index.module.scss";
  import { useRouter } from "next/router";
  import { registerUser } from "@/firebase/register";
  import { useState } from "react";
  
  const { Text } = Typography;
  const { Content } = Layout;
  
  const ConfirmRegisterPage: React.FC | any = () => {
    const router = useRouter();
    const { nik, namaLengkap, divisi, profile } = router.query; 

    const parsedProfiles = typeof profile === 'string' ? JSON.parse(profile) : [];
    console.log("Profiles from query:", parsedProfiles);

    const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
    const [form] = Form.useForm();
    
    const onFinish = async (values: any) => {

      const { password, confirmPassword } = values;

      if (password !== confirmPassword) {
          message.error("Password not match!");
          return;
        }

        const selectedProfile = parsedProfiles[selectedProfileIndex];

      try {
        const result = await registerUser(nik, namaLengkap, divisi, parsedProfiles, selectedProfile, password);
     
        if (result.success) {
            message.success("Register success! Verification email has been sent");
            router.push("/auth/email-verification");
          } else {
            message.error(result.message);
          }
        } catch (error) {
          console.error("Error during registration: ", error);
          message.error("An unknown error occurred, try again.");
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
            </Form>

            <Form.Item label="Select Profile for Authentication" style={{ width: '100%' }}>
            <Radio.Group
              onChange={(e) => setSelectedProfileIndex(e.target.value)} // Set index profil yang dipilih
              value={selectedProfileIndex}
              style={{ width: '100%' }} 
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {parsedProfiles.map((profile: { email: string; entity: string; role: string }, index: number) => (
                  <Card
                    title={profile.entity} 
                    key={index}
                    style={{ width: "100%" }}
                    bodyStyle={{ padding: "10px 20px" }}
                  >
                    <Radio value={index}>
                      <Text style={{color: 'grey'}}>{profile.email}</Text>
                      <br/>
                      <Text style={{color: 'grey'}}>{profile.role}</Text>
                    </Radio>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>


            
            <Form
              form={form}
              name="confirm-register"
              layout="vertical"
              initialValues={{ remember: false }}
              onFinish={onFinish}
              autoComplete="off"
            >
  
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
  