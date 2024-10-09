import {
    Layout,
    Card,
    Button,
    Form,
    Input,
    Image,
    Typography,
    Divider,
} from "antd";
import classes from "./index.module.scss";
import { useRouter } from "next/router";

const { Text } = Typography;
const { Content } = Layout;

const ConfirmPassword: React.FC | any = () => {
    const router = useRouter();

    const onSubmit = () => {
        router.push('/auth/login')
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
                    Masukan Password Baru
                </p>
                <Divider />
                <Form onFinish={onSubmit}
                    name="confirm-password"
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[{ required: true, message: "Please confirm your password!" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            className={classes.greenButton}
                            type="primary"
                            htmlType="submit"
                            size="middle"
                            block
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Content>
    );
};

export default ConfirmPassword;
