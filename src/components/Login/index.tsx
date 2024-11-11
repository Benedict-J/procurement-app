import React, { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Form,
  Input,
  Divider,
  Typography,
  Image,
  message,
} from "antd";
import classes from "./index.module.scss";
import { useRouter } from "next/router";
import { SignIn } from "src/firebase/auth";
import ReCAPTCHA from "react-google-recaptcha";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';

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
    setCaptchaValue(value);
  };

  const onLogin = async (values: { nik: string; password: string }) => {
    setIsLoading(true);
    if (!captchaValue) {
      message.error("Please complete the reCAPTCHA verification.");
      setIsLoading(false);
      return;
    }

    const { nik, password } = values;

    interface Profile {
      email: string;
      role: string;
      entity: string;
    }

    try {
      const result = await SignIn(nik, password);
      const token = await result.user.getIdToken(); 

      const userDocRef = doc(db, 'registeredUsers', result.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      const userData = userDocSnap.data();
      const selectedProfileIndex = userData.selectedProfileIndex; 
      console.log("Selected profile index:", selectedProfileIndex);

      const selectedProfile = userData.profile.find(
        
        (profile: Profile, index: number) => {
          console.log('Profile:', profile);
          console.log('SelectedProfileIndex:', selectedProfileIndex);
          
          return index === selectedProfileIndex
        } 
      );
      console.log("Selected profile:", selectedProfile); 

      const userRole = selectedProfile?.role || '';
      console.log("User role based on selected profile:", userRole);

      document.cookie = `userRole=${userRole}; path=/`; 
      document.cookie = `token=${token}; path=/`;

      if (userRole === 'Super Admin') {
          router.push('/requester/user-management');
          return;
        }

      console.log('user role:', userRole);
      if (userRole === 'Requester') {
        router.push('/requester/request-form');
      } else if (userRole === 'Approval') {
        router.push('/requester/incoming-request');
      } else if (userRole === 'Checker') {
        router.push('/requester/incoming-request');
      } else if (userRole === 'Releaser') {
        router.push('/requester/incoming-request');
      } else {
          router.push('/');
      }

      message.success("Login successful!");
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
              preview= {false}
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
            <Text
              style={{ display: 'block', textAlign: 'right', marginBottom: 20, fontSize: '14px', color: 'green', cursor: 'pointer' }}
              onClick={onForgotPassword}
            >
              Forgot Password?
            </Text>
            <Form.Item className={classes.captchaContainer}>
              <ReCAPTCHA
                sitekey="6LfwwWAqAAAAAE8GebnbABOR8kNrV_RC3_0iepff"
                onChange={onCaptchaChange}
              />
            </Form.Item>
            <Form.Item>
              <Button className={classes.greenButton}
                type="primary"
                htmlType="submit"
                size="middle"
                block
                loading={isLoading}
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
