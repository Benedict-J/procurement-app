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

const Activation: React.FC | any = () => {
  const router = useRouter();

  const onFinish = (values: any) => {
    router.push("/auth/register/confirm-register");
  };

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
        </Card>
      </Content>
    </>
  );
};

export default Activation;
