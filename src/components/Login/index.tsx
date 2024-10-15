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
import ReCAPTCHA from "react-google-recaptcha";

const { Text } = Typography;
const { Content } = Layout;

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null); // State untuk reCAPTCHA
  const router = useRouter();

  const onForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const onRegister = () => {
    router.push('/auth/register');
  };

  const onCaptchaChange = (value: string | null) => {
    setCaptchaValue(value); // Update state saat reCAPTCHA berhasil
  };

  const onLogin = async (values: { nik: string; password: string }) => {
    if (!captchaValue) {
      message.error("Please complete the reCAPTCHA verification.");
      return;
    }

    const { nik, password } = values;
    setIsLoading(true);
    try {
      await SignIn(nik, password);
      message.success("Login successful!");
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Email not verified")) {
          message.error("Email not verified. A verification email has been sent to your inbox.");
        } else {
          message.error("Login failed! Please check your NIK or password again.");
        }
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
            Enter Your Account
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
                { required: true, message: "Please input your NIK!" },
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
            <Form.Item className={classes.captchaContainer}>
              <ReCAPTCHA
                sitekey="6LfwwWAqAAAAAE8GebnbABOR8kNrV_RC3_0iepff" // Ganti dengan site key reCAPTCHA yang benar
                onChange={onCaptchaChange}
              />
            </Form.Item>
            <Text
              style={{ display: 'block', textAlign: 'right', marginBottom: 20, fontSize: '14px', color: 'green', cursor: 'pointer' }}
              onClick={onForgotPassword}
            >
              Forgot Password?
            </Text>
            <Form.Item>
              <Button className={classes.greenButton}
                type="primary"
                htmlType="submit"
                size="middle"
                block
                loading={isLoading} // Tampilkan loading saat proses
              >
                Login
              </Button>
            </Form.Item>
            <p className={classes.registerText}>
              Don't have an account yet?
              <strong onClick={onRegister}> Register</strong>
            </p>
          </Form>
        </Card>
      </Content>
    </>
  );
};

export default Login;
