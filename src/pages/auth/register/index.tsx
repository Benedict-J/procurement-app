import BlankLayout from "@/components/Layout/BlankLayout";
import { Layout } from "antd";
import { ReactElement } from "react";

const Register = () => {
  return <Layout>{/* Create register contents here */}</Layout>;
};

Register.getLayout = (page: ReactElement) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default Register;
