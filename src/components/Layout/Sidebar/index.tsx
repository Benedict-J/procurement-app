import { Layout, Menu, Image } from "antd";
import { useRouter } from "next/router";
import menus from "@settings/layout/menus";
import styles from './index.module.scss';

const Sidebar: React.FC = () => {
  const router = useRouter();

  const handleClick = (path: string) => {
    router.push(path);
  };

  return (
    <Layout.Sider
      collapsible
      breakpoint="lg"
      width={180}
      zeroWidthTriggerStyle={{
        top: 0,
      }}
    >
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Image
          src="/images/app-logo/logo-adakami-sidebar.png"
          alt="Logo"
          preview={false}
          className={styles.logo}  
        />
      </div>

      <Menu theme="dark" mode="inline">
        {menus
          .filter((menu) => menu.key === "requester")
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
