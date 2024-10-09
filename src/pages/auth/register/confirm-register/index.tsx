import { NextPage } from "next";
import BlankLayout from "@/components/Layout/BlankLayout";
import { Layout } from "antd";
import { ReactElement } from "react";
import ConfirmRegisterPage from "@/components/Register/confirm-register";


const ConfirmRegister: NextPage | any = () => {
  return (
    <>
      <Layout>
        <ConfirmRegisterPage />
      </Layout>
    </>
  );
};
ConfirmRegister.getLayout = (page: ReactElement) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default ConfirmRegister;
