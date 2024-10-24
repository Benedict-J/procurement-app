import { Layout, Menu, Image } from "antd";
import { useRouter } from "next/router";
import getMenuByRole from "@settings/layout/menus";
import { useUserContext } from "@/contexts/UserContext";
import styles from "@/components/Layout/Sidebar/index.module.scss";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { userProfile, loading } = useUserContext();

  if (loading || !userProfile) return <p>Loading...</p>;

  console.log("User Profile:", userProfile); // Debug profil pengguna

  const menuItems = getMenuByRole(userProfile.role).flatMap((menu) =>
    menu.children?.map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.name,
      onClick: () => router.push(item.path!),
    })) || []
  );

  const handleMenuClick = (e: { key: string }) => {
    const selectedItem = menuItems.find(item => item.key === e.key);
    if (selectedItem?.onClick) {
      selectedItem.onClick();
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

      <Menu
        theme="dark"
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Layout.Sider>
  );
};

export default Sidebar;
