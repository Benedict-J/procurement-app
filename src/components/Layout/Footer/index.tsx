import { Col, Layout, Row } from "antd";
import DateTime from "./datetime";

const Header: React.FC = () => {
  return (
    <Layout.Footer
      style={{
        textAlign: "center",
        bottom: 0,
        padding: "7px 18px",
      }}
    >
      <Row justify="space-between" gutter={2}>
        <Col style={{ color: "#ffffff" }}>
          
        </Col>
        <Col xs={0} lg={12} style={{ textAlign: "right", color: "#ffffff" }}>
          <DateTime />
        </Col>
      </Row>
    </Layout.Footer>
  );
};

export default Header;
