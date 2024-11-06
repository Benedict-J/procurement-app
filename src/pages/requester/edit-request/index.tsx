import { useRouter } from "next/router";
import EditRequestForm from "@/components/RequestForm/EditRequestForm";
import PageContainer from "@/components/Layout/PageContainer";

const EditRequestPage = () => {
    const router = useRouter();
    const { requestNo } = router.query;

    if (!requestNo) return null; 

    return (
        <PageContainer title="Edit Request">
            <EditRequestForm requestNo={requestNo as string} />
        </PageContainer>
    );
};

export default EditRequestPage;