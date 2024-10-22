import { Layout, Row, Col, Space, Dropdown, Avatar, Badge } from "antd";
import { LogoutOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "./index.module.scss"; // Import SCSS Module

const Header: React.FC = () => {
  const router = useRouter();

  const [role, setRole] = useState("Requester");
  const [company, setCompany] = useState("AdaKami");

  const [notifications, setNotifications] = useState([
    { key: 1, message: "Pesan 1" },
    { key: 2, message: "Pesan 2" },
    { key: 3, message: "Pesan 3" },
  ]); // Dummy data 

  const handleLogout = () => {
    router.push("/auth/login");
  };

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
          <span className={styles.headerText}>
            {role} - {company}
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
