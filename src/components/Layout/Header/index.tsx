import { Layout, Row, Col, Space, Dropdown, Avatar, Badge } from "antd";
import { LogoutOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import { SignOut } from "@/firebase/auth";
import styles from "@/components/Layout/Header/index.module.scss"

const Header: React.FC = () => {
  const router = useRouter();
  const { userProfile, loading, selectedProfileIndex } = useUserContext();

  if (loading) return <p>Loading...</p>;

  if (!userProfile) return <p>User profile not available</p>;

  const handleLogout = async () => {
    try {
      await SignOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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

  const notificationMenu = {
    items: notifications.map((notification) => ({
      key: notification.key,
      label: notification.message,
    })),
  };

  return (
    <Layout.Header className={styles.header}>
      <Row justify="space-between">
        <Col>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold'}}>
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
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Logout",
                    onClick: () => {
                      handleLogout();
                    },
                  },
                ],
              }}
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
