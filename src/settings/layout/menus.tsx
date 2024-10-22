import {
  FileAddOutlined,
  HistoryOutlined,
  UserOutlined,
} from "@ant-design/icons";

export interface MenuItem {
  key: string;
  path?: string;
  name: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  useCasl?: boolean;
}

const menus: MenuItem[] = [
  {
    key: "requester",
    name: "Requester Menu",
    icon: <UserOutlined />,
    children: [
      {
        path: "/request-form",
        name: "Form Request",
        icon: <FileAddOutlined />,
        key: "requester:form-request",
      },
      {
        path: "/history",
        name: "History",
        icon: <HistoryOutlined />,
        key: "requester:form-request",
      },  
    ],
  },
];

export default menus;
