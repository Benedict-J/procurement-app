import { NextPage } from "next";
import BlankLayout from "@/components/Layout/BlankLayout";
import { ReactElement } from "react";
import { Layout } from "antd";
import EmailVerification from "@/components/EmailVerification";

const EmailVerificationPage: NextPage | any = () => {
  return (
    <>
      <Layout>
        <EmailVerification />
      </Layout>
    </>
  );
};

EmailVerificationPage.getLayout = (page: ReactElement) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default EmailVerificationPage;
