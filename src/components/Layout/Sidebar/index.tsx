import { Button, Layout, Menu, MenuProps, Image } from "antd";
import { useRouter } from "next/router";

const Sidebar: React.FC = (props) => {
  const router = useRouter();

  return (
    <Layout.Sider
      collapsible
      breakpoint="lg"
      width={260}
      zeroWidthTriggerStyle={{
        top: 0,
      }}
    ></Layout.Sider>
  );
};

export default Sidebar;
