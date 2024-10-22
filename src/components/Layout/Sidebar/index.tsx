import { Layout, Menu, Image } from "antd";
import { useRouter } from "next/router";
import menus from "@settings/layout/menus";
import { useUserContext } from "@/contexts/UserContext";

const Sidebar: React.FC = (props) => {
  const router = useRouter();
  const { userProfile, loading } = useUserContext();

  const handleClick = (path: string) => {
    router.push(path);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Layout.Sider
      collapsible
      breakpoint="lg"
      width={260}
      zeroWidthTriggerStyle={{
        top: 0,
      }}
    >
      <div style={{ padding: 16 }}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          preview={false}
          width={120}
          style={{ marginBottom: 16 }}
        />
      </div>
      <Menu theme="dark" mode="inline">
        {menus
          .filter(menu => menu.key === "requester")
          .map((menu) =>
            menu.children?.map((item) => (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                onClick={() => handleClick(item.path!)}
              >
                {item.name}
              </Menu.Item>
            ))
          )}
      </Menu>
    </Layout.Sider>
  );
};

export default Sidebar;
