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
import { useEffect } from "react";
import { registerUser } from "@/firebase/register";
  
  const { Text } = Typography;
  const { Content } = Layout;
  
  const ConfirmRegisterPage: React.FC | any = () => {
    const router = useRouter();

    const { nik, namaLengkap, divisi, role } = router.query;

    // useEffect(() => {
    //   if (!nik) {
    //     router.push("/register");
    //   }
    // });

    const onFinish = async (values: any) => {
      const { email, password, confirmPassword } = values;

      if (password !== confirmPassword) {
        message.error("Password dan konfirmasi password tidak cocok");
        return;
      }
    
      try {
        const result = await registerUser(nik, namaLengkap, divisi, role, email, password);
    
        if (result.success) {
          message.success("Register berhasil! Email telah dikirim");
          router.push("/auth/login");
        } else {
          message.error(result.message);
        }
      } catch (error) {
        message.error("Terjadi kesalahan, coba lagi.");
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
                Konfirmasi Pendaftaran
              </Text>
            </p>
  
            
            <Form layout="vertical">
            <Form.Item label="Nama Lengkap">
            <Input value={namaLengkap} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Divisi">
            <Input value={divisi} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Role">
            <Input value={role} readOnly style={{color:"grey"}}/>
            </Form.Item>
            </Form>
  
            <Form
              name="confirm-register"
              layout="vertical"
              initialValues={{ remember: false }}
              onFinish={onFinish}
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
                  {
                    min: 8,
                    message: "Password minimal 8 karakter!",
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                    message: "Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus.",
                  }
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
  