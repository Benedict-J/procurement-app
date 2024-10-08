import { NextPage } from "next";
import { ReactElement } from "react";

const BlankLayout: NextPage<{ children: ReactElement }> = (props) => {
  const { children } = props;

  return <>{children}</>;
};

export default BlankLayout;
