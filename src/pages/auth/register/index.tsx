import { NextPage } from "next";
import BlankLayout from "@/components/Layout/BlankLayout";
import { Layout } from "antd";
import { ReactElement } from "react";
import Register from "@/components/Register";

const RegisterPage: NextPage | any = () => {
  return (
    <>
      <Layout>
        <Register />
      </Layout>
    </>
  );
};
Register.getLayout = (page: ReactElement) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default Register;
