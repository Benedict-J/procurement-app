import React, { useState } from "react";
import {
    Layout,
    Card,
    Button,
    Form,
    Input,
    Image,
    Typography,
    Divider,
    message,
} from "antd";
import classes from "./index.module.scss";
import { useRouter } from "next/router";
import { resetPasswordConfirm } from "@/firebase/auth";

const { Text } = Typography;
const { Content } = Layout;

const ConfirmPassword: React.FC | any = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { oobCode } = router.query; 

    const onSubmit = async (values: { password: string; confirmPassword: string }) => {
        const { password, confirmPassword } = values;

        if (password !== confirmPassword) {
            message.error("Passwords do not match!"); 
            return;
        }

        if (!oobCode) {
            message.error("Invalid or expired reset code. Please try again.");
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordConfirm(oobCode as string, password); 
            message.success("Password has been reset successfully.");
            router.push('/auth/login');
        } catch (error) {
            message.error("Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
                    Enter New Password
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
