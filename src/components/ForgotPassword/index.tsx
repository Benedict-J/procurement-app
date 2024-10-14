import React, { useState } from 'react';
import {
    Layout,
    Card,
    Button,
    Form,
    Input,
    Image,
    Divider,
    Typography,
    message
} from "antd";
import classes from "./index.module.scss";
import { useRouter } from "next/router";
import { resetPassword } from "@/firebase/auth";

const { Text } = Typography;
const { Content } = Layout;

const ForgotPassword: React.FC | any = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onResetPassword = async (values: { email: string }) => {
        setIsLoading(true);
        try {
            await resetPassword(values.email); 
            message.success("Reset password link sent to your email.");
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === "Email not registered") {
                    message.error("Email not registered");
                } else {
                    message.error("Failed to send reset password email.");
                }
            } else {
                message.error("An unexpected error occurred.");
            }
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
                    Forgot Password?
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
                        Reset password link sent to your email
                    </p>
                </Form>
            </Card>
        </Content>
    );
};

export default ForgotPassword;
