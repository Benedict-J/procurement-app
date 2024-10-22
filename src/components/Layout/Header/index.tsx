import { Layout, Row, Col, Space, Dropdown, Avatar } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState } from "react";

const Header: React.FC = () => {
  const router = useRouter();

  const [role, setRole] = useState("Requester"); 

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <Layout.Header>
      <Row justify="space-between">
        <Col>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold'}}>
            {role}
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
