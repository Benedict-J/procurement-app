import FlowSteps from "@/components/FlowSteps";
import PageContainer from "@/components/Layout/PageContainer";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const FlowStepsPage = () => {
    const router = useRouter();
    const [currentRequestNumber, setCurrentRequestNumber] = useState<string | null>(null);

    useEffect(() => {
        // Tunggu hingga router siap sebelum mencoba mengambil requestNumber
        if (router.isReady) {
            const { requestNumber } = router.query;
            if (typeof requestNumber === "string") {
                setCurrentRequestNumber(requestNumber);
            } else {
                console.warn("requestNumber is not a string or undefined:", requestNumber);
            }
        }
    }, [router.isReady, router.query]);

    return (
        <PageContainer title="Request Status">
            {currentRequestNumber ? (
                <FlowSteps requestNumber={currentRequestNumber} />
            ) : (
                <Spin/>
            )}
        </PageContainer>
    );
};

export default FlowStepsPage;