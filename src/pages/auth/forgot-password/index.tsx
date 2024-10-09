import { NextPage } from "next";
import BlankLayout from "@/components/Layout/BlankLayout";
import { ReactElement } from "react";
import { Layout } from "antd";
import ForgotPassword from "@/components/ForgotPassword";

// Definisikan tipe baru
type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactElement;
};

const ForgotPasswordPage: NextPageWithLayout = () => {
    return (
        <Layout>
            <ForgotPassword />
        </Layout>
    );
};

ForgotPasswordPage.getLayout = (page: ReactElement) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default ForgotPasswordPage;
