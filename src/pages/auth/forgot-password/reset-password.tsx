import { NextPage } from "next";
import BlankLayout from "@/components/Layout/BlankLayout";
import ConfirmPassword from "@/components/ForgotPassword/ResetPassword";
import { ReactElement } from "react";
import { Layout } from "antd";

const ConfirmPasswordPage: NextPage | any = () => {
    return (
        <Layout>
            <ConfirmPassword />
        </Layout>
    );
};

ConfirmPasswordPage.getLayout = (page: ReactElement) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ConfirmPasswordPage;
