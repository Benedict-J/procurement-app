import { Layout, Row, Col, Space, Dropdown, Avatar, Badge } from "antd";
import { LogoutOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useUserContext } from "@/contexts/UserContext";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";

const Header: React.FC = () => {
  const router = useRouter();
  const { userProfile, loading } = useUserContext();

  if (loading) return <p>Loading...</p>;

  if (!userProfile) return <p>User profile not available</p>;

  const handleLogout = () => {
    router.push("/auth/login");
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
