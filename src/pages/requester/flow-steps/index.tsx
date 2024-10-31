import FlowSteps from "@/components/FlowSteps";
import PageContainer from "@/components/Layout/PageContainer";
import { useRouter } from "next/router";

const FlowStepsPage = () => {
    const router = useRouter();

    return (
        <PageContainer title="Request Status">
            <FlowSteps/>
        </PageContainer>
    );
};

export default FlowStepsPage;