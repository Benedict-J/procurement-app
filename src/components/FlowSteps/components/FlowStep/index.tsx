import React from "react"
import { Steps } from "antd"
import { LoadingOutlined } from "@ant-design/icons"

type StepStatus = "wait" | "process" | "finish" | "error"

interface FlowStepProps {
  title: string
  status: StepStatus
  description: JSX.Element;
  icon?: JSX.Element;
}

const FlowStep: React.FC<FlowStepProps> = ({ title, status, description }) => (
  <Steps.Step
    title={title}
    status={status}
    description={<span dangerouslySetInnerHTML={{ __html: description }} />}
    icon={status === "process" ? <LoadingOutlined /> : null}
  />
)

export default FlowStep
