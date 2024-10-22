import { Layout, Row, Col, Space, Dropdown, Avatar } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
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
    <Layout.Header>
      <Row justify="space-between">
        <Col>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold'}}>
            {userProfile?.role} - {userProfile?.entity}
          </span>
        </Col>
        <Col>
          <Space>
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
            >
              <Space>
                <Avatar
                  style={{
                    backgroundColor: "#87d068",
                    cursor: "pointer",
                    margin: "0px 8px",
                  }}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>
    </Layout.Header>
  );
};

export default Header;
