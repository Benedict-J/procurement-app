import { useRouter } from "next/router";
import DetailRequestTable from "@/components/DetailRequest";
import PageContainer from "@/components/Layout/PageContainer";

const DetailRequestPage = () => {
    const router = useRouter();
    const { requestNo } = router.query;

    return (
        <PageContainer title="Detail Request">
            {/* requestNo dikiri sebagai prop ke DetailRequestTable */}
            <DetailRequestTable requestNo={requestNo as string} />
        </PageContainer>
    );
};

export default DetailRequestPage;
