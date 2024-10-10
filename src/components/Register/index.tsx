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
  message,
} from "antd";
import classes from "./index.module.scss";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { registerUserWithNik } from "@/utils/auth/register";

const { Text } = Typography;
const { Content } = Layout;

const Register: React.FC | any = () => {
  const router = useRouter();

  useEffect(() => {
    // shut down scrolling
    document.body.style.overflow = 'hidden';

    // return scrolling
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);


  const onFinish = async (values: any) => {

    const { nik } = values;
    if (!nik) {
      message.error("NIK tidak boleh kosong");
      return;
    }

    const result = await registerUserWithNik(nik);

    if (result.success && result.userData) {
      message.success("NIK Terdaftar!");
      router.push({
        pathname: "register/confirm-register",
        query: {
          nik: nik,
          namaLengkap: result.userData.namaLengkap,
          divisi: result.userData.divisi,
          role: result.userData.role,
        }
      });
    } else if (!result.success) {
        message.error(result.message);
    } else {
      message.error("Terjadi Masalah");  
    }
  };

  const onLogin = (values: any) => {
    router.push("login");
  }

  return (
    <>
      <Content className={classes.registerContainer}>
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
              name="nik"
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
              <p className={classes.loginText} style={{ marginTop: 20}}>
                <Text style={{ color: '#000000' }}>Sudah Memiliki Akun? </Text>
                <strong onClick={onLogin}> Login</strong>
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
