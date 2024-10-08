import {
  Layout,
  Card,
  Button,
  Checkbox,
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

  return (
    <>
      <Content className={classes.loginContainer}>
        <Card className={classes.cardLogin}>
          <div className={classes.logo}>
            <Image
              src="/images/app-logo/logo-text-light.png"
              width={160}
              preview={false}
              alt="logo"
            />
          </div>
          <Divider></Divider>
          <p style={{ marginBottom: 20 }}>
            <Text type="secondary">Welcome, please enter your credential.</Text>
          </p>
          <Form
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
            <Form.Item
              label="Username or Email"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button
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
          </Form>
        </Card>
      </Content>
    </>
  );
};

export default Login;
