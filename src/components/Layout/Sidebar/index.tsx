import { Layout, Menu, Image, Spin } from "antd";
import { useRouter } from "next/router";
import getMenuByRole from "@settings/layout/menus";
import { useUserContext } from "@/contexts/UserContext";
import styles from "@/components/Layout/Sidebar/index.module.scss";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { userProfile, loading } = useUserContext();

  if (loading || !userProfile) return <Spin/>;

  const menuItems = getMenuByRole(userProfile.role);

  // Fungsi untuk menghandle klik menu dan mengubah route
  const handleMenuClick = (e: { key: string }) => {
    const selectedItem = menuItems
      .flatMap(item => (item.children ? item.children : [item]))
      .find(item => item.key === e.key);

    if (selectedItem?.path && router.pathname !== selectedItem.path) {
      router.push(selectedItem.path); // Gunakan path tanpa duplikasi
    }
  };

  return (
    <Layout.Sider
      className={styles.sidebar}
      collapsible
      breakpoint="lg"
      width={200}
      zeroWidthTriggerStyle={{ top: 0 }}
    >
      <div style={{ padding: 16, textAlign: "center" }}>
        <Image
          src="/images/app-logo/logo-adakami-sidebar.png"
          alt="Logo"
          preview={false}
          className={styles.logo}
        />
      </div>

      <Menu theme="dark" mode="inline" onClick={handleMenuClick}>
        {menuItems.map((menu) =>
          menu.children?.map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.name}
            </Menu.Item>
          ))
        )}
      </Menu>
    </Layout.Sider>
  );
};

export default Sidebar;
