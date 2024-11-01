import { Steps } from "antd";
import { useRouter } from "next/router"

const FlowSteps: React.FC | any = () => {
    const router = useRouter();

    return (
        <> 
        <Steps
            size="default"
            items={[
        {
            title: 'Purchase Request',
            status: 'finish',
            description: 'Request Form Submitted'
        },
        {
            title: 'Pending Approval',
            status: 'finish',
            description: 'Head Approved'
        },
        {
            title: 'Approval Finance',
            status: 'finish',
            description: 'Finance Approved'
        },
        {
            title: 'Process Procurement',
            status: 'process',  
            description: 'Waiting for procurement process'
        },
        {
            title: 'Purchase Order Release',
            status: 'wait',
        },
    ]}
  />
        </>
    )
}

export default FlowSteps;