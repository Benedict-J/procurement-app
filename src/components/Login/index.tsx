import React, { useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Form,
  Input,
  Image,
  Divider,
  Typography,
  message
} from "antd";
import classes from "./index.module.scss";
import { useRouter } from "next/router";
import { SignIn } from "src/firebase/auth";

const { Text } = Typography;
const { Content } = Layout;

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const onRegister = () => {
    router.push('/auth/register'); 
  };

  const onLogin = async (values: { nik: string; password: string }) => {
    const { nik, password } = values;
    setIsLoading(true);
    try {
      await SignIn(nik, password);
      message.success("Login berhasil!");
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("NIK tidak ditemukan")) {
          message.error("NIK tidak ditemukan. Periksa kembali NIK Anda.");
        } else if (error.message.includes("password")) {
          message.error("Password salah. Periksa kembali password Anda.");
        } else {
          message.error("Login gagal! Periksa kembali NIK dan password Anda.");
        }
      } else {
        message.error("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <>
      <Content className={classes.loginContainer}>
        <Card className={classes.cardLogin}>
          <div className={classes.logo} style={{ margin: '0', padding: '10px 0' }}>
            <Image
              src="/images/app-logo/logo-adakami-login.png"
              width={160}
              preview={false}
              alt="logo"
            />
          </div>
          <p style={{ textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
            Masukan Akun Anda
          </p>
          <Divider></Divider>
          <Form onFinish={onLogin}
            name="basic"
            layout="vertical"
            initialValues={{ remember: false }}
            autoComplete="off"
          >
            <Form.Item className={classes.textLabel}
              label="NIK"
              name="nik"
              rules={[
                { required: true, message: "Please input your nik!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item className={classes.textLabel}
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Text
              style={{ display: 'block', textAlign: 'right', marginBottom: 20, fontSize: '14px', color: 'green', cursor: 'pointer' }}
              onClick={onForgotPassword}
            >
              Lupa Password?
            </Text>
            <Form.Item>
              <Button className={classes.greenButton}
                type="primary"
                htmlType="submit"
                size="middle"
                block
              >
                Login
              </Button>
            </Form.Item>
            <p className={classes.registerText}>
              Belum memiliki Akun?
              <strong onClick={onRegister}> Register</strong>
            </p>
          </Form>
        </Card>
      </Content>
    </>
  );
};

export default Login;
