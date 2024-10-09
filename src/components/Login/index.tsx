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

const Login: React.FC | any = () => {
  const router = useRouter();

  const onForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const onRegister = () => {
    router.push('/auth/register'); 
  };

  const onLogin = () => {
    router.push('/');
  }

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
            // onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            // onChange={() => {
            //   setIsDisableButton(false);
            // }}
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
              // loading={isLoading}
              // disabled={isDisableButton}
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
