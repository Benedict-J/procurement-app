import HistoryTable from "@/components/History";
import PageContainer from "@/components/Layout/PageContainer";

const HistoryPage = () => {
    return (
      <PageContainer title="History Requests">
        <HistoryTable />
      </PageContainer>
    );
  };
  
  export default HistoryPage;