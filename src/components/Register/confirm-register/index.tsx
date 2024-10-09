import {
    Layout,
    Card,
    Button,
    Form,
    Input,
    Image,
    Divider,
    Typography,
  } from "antd";
  import classes from "./index.module.scss";
  import { useRouter } from "next/router";
  
  const { Text } = Typography;
  const { Content } = Layout;
  
  const ConfirmRegisterPage: React.FC | any = () => {
    const router = useRouter();

    const userData = {
        namaLengkap: "John Doe",
        divisi: "IT",
        role: "Staff",
      };
  
    return (
      <>
        <Content className={classes.loginContainer}>
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
                Konfirmasi Pendaftaran
              </Text>
            </p>
  
            {/* Menampilkan informasi yang sudah ada (misalnya dari database) */}
            <Form layout="vertical">
            <Form.Item label="Nama Lengkap">
            <Input value={userData.namaLengkap} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Divisi">
            <Input value={userData.divisi} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Role">
            <Input value={userData.role} readOnly style={{color:"grey"}}/>
            </Form.Item>
            </Form>
  
            <Form
              name="confirm-register"
              layout="vertical"
              initialValues={{ remember: false }}
              autoComplete="off"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Tolong masukkan email Anda!" },
                  { type: 'email', message: "Email tidak valid!" }
                ]}
              >
                <Input />
              </Form.Item>
  
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Tolong masukkan password Anda!" },
                  { min: 6, message: "Password minimal 6 karakter!" }
                ]}
              >
                <Input.Password />
              </Form.Item>
  
              <Form.Item
                label="Konfirmasi Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Tolong konfirmasi password Anda!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password tidak cocok!'));
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
  
                <div style={{ textAlign: "center" }}>
                  <p style={{ marginTop: 20 }}>
                    <Text style={{ color: '#000000' }}>Sudah Memiliki Akun? </Text>
                    <Button type="link" className={classes.loginButton}>Login</Button>
                  </p>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </>
    );
  };
  
  export default ConfirmRegisterPage;
  