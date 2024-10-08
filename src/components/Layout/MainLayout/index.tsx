import { Layout, ConfigProvider } from "antd";
import React, { ReactElement, useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Footer from "../Footer";

const MainLayout: React.FC<{
  children: ReactElement;
}> = (props) => {
  let { children } = props;

  const [isClientRender, setIsClientRender] = useState(false);

  useEffect(() => {
    setIsClientRender(true);
  }, []);

  return (
    isClientRender && (
      <>
        <Layout
          style={{
            minHeight: "calc(100vh - 25px)",
          }}
        >
          <Sidebar />
          <Layout>
            <Header />
            {children}
          </Layout>
        </Layout>
        <Footer />
      </>
    )
  );
};

export default MainLayout;
