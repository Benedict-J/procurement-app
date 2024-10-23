import { ReactElement } from "react";
import { Layout } from "antd";
import BlankLayout from "@/components/Layout/BlankLayout";
import RequestForm from "@/components/Forms/RequestForm";
import { Page } from "@/types/page"; // Pastikan path ini sesuai dengan lokasi file types

const RequestFormPage: Page = () => {
    return (
        <Layout>
            <RequestForm />
        </Layout>
    );
};

RequestFormPage.getLayout = (page: ReactElement) => {
    return <BlankLayout>{page}</BlankLayout>;
};

export default RequestFormPage;
