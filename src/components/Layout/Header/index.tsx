import { Layout, Row, Col, Space, Dropdown, Avatar, Badge, Menu } from "antd";
import { LogoutOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { SignOut } from "@/firebase/auth";
import styles from "@/components/Layout/Header/index.module.scss";

const Header: React.FC = () => {
  const router = useRouter();
  const { userProfile, loading, selectedProfileIndex } = useUserContext();

  if (loading) return <p>Loading...</p>;
  if (!userProfile) return <p>User profile not available</p>;

  useEffect(() => {
    const checkAuthStatus = () => {
      const user = auth.currentUser;
      if (user) {
        console.log("User logged in:", user.email);
      } else {
        console.log("No user logged in.");
      }
    };

    checkAuthStatus();
  }, []);

  const [notifications, setNotifications] = useState([
    { key: 1, message: "Pesan 1" },
    { key: 2, message: "Pesan 2" },
    { key: 3, message: "Pesan 3" },
  ]); // Dummy data 

  const [userEmails, setUserEmails] = useState([
    { email: "example1@yourdomain.com", active: false },
    { email: "example2@yourdomain.com", active: true },
  ]); // Dummy user emails

  const handleSwitchUser = (email: string) => {
    // Function to switch user or change state based on selected email
    setUserEmails((prevEmails) =>
      prevEmails.map((user) =>
        user.email === email
          ? { ...user, active: true }
          : { ...user, active: false }
      )
    );
    console.log("Switched to:", email);
  };

  const handleLogout = async () => {
    try {
      await SignOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const notificationMenu = {
    items: notifications.map((notification) => ({
      key: notification.key,
      label: notification.message,
    })),
  };

  const userMenu = (
    <Menu>
      {userEmails.map((user, index) => (
        <Menu.Item key={index} onClick={() => handleSwitchUser(user.email)}>
          <Space>
            <UserOutlined style={{ color: user.active ? "#87d068" : "#bfbfbf" }} />
            <span style={{ color: user.active ? "#87d068" : "#bfbfbf" }}>{user.email}</span>
          </Space>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        <Space>
          <LogoutOutlined />
          Logout
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout.Header className={styles.header}>
      <Row justify="space-between">
        <Col>
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            {userProfile?.role} - {userProfile?.entity}
          </span>
        </Col>
        <Col>
          <Space size="middle">
            <Dropdown
              placement="bottomRight"
              menu={notificationMenu}
              trigger={["hover"]}
            >
              <Badge count={notifications.length} offset={[-2, 0]}>
                <Avatar
                  className={`${styles.avatar} ${styles.notification}`}
                  icon={<BellOutlined />}
                />
              </Badge>
            </Dropdown>
            <Dropdown
              placement="bottomRight"
              overlay={userMenu}
              trigger={["hover"]}
            >
              <Avatar
                className={`${styles.avatar} ${styles.user}`}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;