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

const EmailVerification: React.FC | any = () => {
    const router = useRouter();

    return (
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
                <Divider></Divider>
                <p style={{ textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: '20px', marginBottom: "22px"}}>
                    Check your email
                </p>
                <p style={{ textAlign: 'center', color: 'grey', fontSize: '14px' }}>
                    We have sent verification link to your email, please click to verify your email
                </p>
                
            </Card>
        </Content>
    );
};

export default EmailVerification;
