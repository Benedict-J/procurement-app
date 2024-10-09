import { NextPage } from "next";
import BlankLayout from "@/components/Layout/BlankLayout";
import { Layout } from "antd";
import { ReactElement } from "react";
import Activation from "@/components/Register/activation";


const ActivationPage: NextPage | any = () => {
  return (
    <>
      <Layout>
        <Activation />
      </Layout>
    </>
  );
};
ActivationPage.getLayout = (page: ReactElement) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default ActivationPage;
