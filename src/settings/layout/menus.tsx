import {
  FileAddOutlined,
  HistoryOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";

export interface MenuItem {
  key: string;
  path?: string;
  name: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

const getMenuByRole = (role: string): MenuItem[] => {
  switch (role) {
    case "Requester":
      return [
        {
          key: "requester",
          name: "Requester Menu",
          icon: <UserOutlined />,
          children: [
            {
              path: "/requester/request-form",
              name: "Form Request",
              icon: <FileAddOutlined />,
              key: "requester:form-request",
            },
            {
              path: "/requester/history",
              name: "History",
              icon: <HistoryOutlined />,
              key: "requester:history",
            },
          ],
        },
      ];
    case "Checker":
    case "Approval":
    case "Releaser":
      return [
        {
          key: "approval",
          name: "Approval Menu",
          icon: <CheckCircleOutlined />,
          children: [
            {
              path: "/requester/incoming-request",
              name: "Incoming Request",
              icon: <FileAddOutlined />,
              key: ":incoming-request",
            },
            {
              path: "/requester/history",
              name: "History",
              icon: <HistoryOutlined />,
              key: ":history",
            },
          ],
        },
      ];
      case "Super Admin":
      return [
        {
          key: "superadmin",
          name: "User Management",
          icon: <TeamOutlined />,
          children: [
            {
              path: "/requester/user-management",
              name: "Manage Users",
              icon: <UserOutlined />,
              key: "superadmin:user-management",
            },
          ],
        },
      ];
    default:
      return [];
  }
};

export default getMenuByRole;
