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

const Register: React.FC | any = () => {
  const router = useRouter();

  const onFinish = (values: any) => {
    router.push("/auth/register/confirm-register");
  };

  const onForgotPassword = (values: any) => {
    router.push("auth/forgot-password");
  }

  const onLogin = (values: any) => {
    router.push("login");
  }

  return (
    <>
      <Content className={classes.loginContainer}>
        <Card className={classes.cardRegister}>
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
          <Divider></Divider>
          <p style={{ marginBottom: 20, textAlign: 'center'}}>
            <Text style={{color : '#000000', fontWeight: 'bold', fontSize: "20px"}}>Masukan NIK Anda</Text>
          </p>
          <Form
            name="basic"
            layout="vertical"
            initialValues={{ remember: false }}
            onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            // onChange={() => {
            //   setIsDisableButton(false);
            // }}
            autoComplete="off"
          >
            <Form.Item
              label="NIK"
              name="NIK"
              rules={[
                { required: true, message: "Tolong Masukan NIK Anda!" },
              ]}
            >
              <Input />
            </Form.Item>
            {/* <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Tolong Masukan Password Anda!" },
                ]}
              >
                <Input.Password />
              </Form.Item> */}
            {/* <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item> */}
            <Form.Item>
              <Button
                htmlType="submit"
                size="middle"
                block
                style={{ backgroundColor: "#1F9245", color: "#ffffff", marginTop: "10px"}}
                
              // loading={isLoading}
              // disabled={isDisableButton}
              >
                Submit
              </Button>
              <div style={{textAlign: "center"}}>
              <p style={{ marginTop: 20  }}>
                <Text style={{ color: '#000000' }}>Sudah Memiliki Akun? </Text>
                <Button type="link" onClick={onLogin} style={{ color: '#1F9245', cursor: 'pointer', margin: 0, padding: 0,}}>Login</Button>
              </p>
              </div>
              
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </>
  );
};

export default Register;
