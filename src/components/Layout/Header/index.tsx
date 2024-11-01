import { Layout, Row, Col, Space, Dropdown, Avatar, Badge, Menu, Spin } from "antd";
import { LogoutOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/firebase";
import { SignOut } from "@/firebase/auth";
import styles from "@/components/Layout/Header/index.module.scss";
import { doc, updateDoc } from "firebase/firestore";

const Header: React.FC = () => {
  const router = useRouter();
  const { userProfile, loading, selectedProfileIndex, setSelectedProfile } = useUserContext();

  if (loading) return <Spin/>;
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
  ]);

  const handleSwitchUser = async (index: number) => {
    if (userProfile && userProfile.profile[index]) {
      const selectedProfile = userProfile.profile[index];

      // Update state pada application
      setSelectedProfile(index);

      // Update `selectedProfileIndex` di Firestore
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "registeredUsers", user.uid);
        await updateDoc(docRef, {
          selectedProfileIndex: index,
        });
      }

      console.log("Switched to:", selectedProfile.email);
    }
  };

  const handleLogout = async () => {
    try {
      await SignOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const notificationMenuItems = notifications.map((notification) => ({
    key: notification.key,
    label: notification.message,
  }));

  const userMenuItems = [
    ...userProfile.profile.map((profile, index) => ({
      key: index.toString(),
      label: (
        <Space onClick={() => handleSwitchUser(index)}>
          <UserOutlined style={{ color: index === selectedProfileIndex ? "#87d068" : "#bfbfbf" }} />
          <span style={{ color: index === selectedProfileIndex ? "#87d068" : "#bfbfbf" }}>{profile.email}</span>
        </Space>
      ),
    })),
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: (
        <Space onClick={handleLogout}>
          <LogoutOutlined />
          Logout
        </Space>
      ),
    },
  ];

  return (
    <Layout.Header className={styles.header}>
      <Row justify="space-between">
        <Col>
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            {userProfile.role} - {userProfile.entity}
          </span>
        </Col>
        <Col>
          <Space size="middle">
            <Dropdown
              placement="bottomRight"
              menu={{ items: notificationMenuItems }}
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
              menu={{ items: userMenuItems }}
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