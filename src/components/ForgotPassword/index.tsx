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
import classes from "./index.module.scss"; // Pastikan file ini ada
import { useRouter } from "next/router";

const { Text } = Typography;
const { Content } = Layout;

const ForgotPassword: React.FC | any = () => {
    const router = useRouter();

    const onResetPassword = () => {
        router.push('/auth/forgot-password/reset-password')
    }

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
                <p style={{ textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: '18px' }}>
                    Lupa Password?
                </p>
                <Divider />
                <Form onFinish={onResetPassword}
                    name="forgot-password"
                    layout="vertical"
                    initialValues={{ remember: false }}
                    autoComplete="off"
                >
                    <Form.Item
                        className={classes.textLabel}
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Please input your Email!" },
                        { type: "email", message: "Please enter a valid Email!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            className={classes.greenButton}
                            type="primary"
                            htmlType="submit"
                            size="middle"
                            block
                        >
                            Reset Password
                        </Button>
                    </Form.Item>
                    <p style={{ textAlign: 'center', color: 'black', fontWeight: 'normal' }}>
                        Link reset password dikirim ke email anda
                    </p>
                </Form>
            </Card>
        </Content>
    );
};

export default ForgotPassword;
