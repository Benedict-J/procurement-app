import {
  FileAddOutlined,
  HistoryOutlined,
  UserOutlined,
  CheckCircleOutlined,
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
              key: "approval:incoming-request",
            },
            {
              path: "/requester/history",
              name: "History",
              icon: <HistoryOutlined />,
              key: "approval:history",
            },
          ],
        },
      ];
    default:
      return [];
  }
};

export default getMenuByRole;
