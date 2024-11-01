import { db } from "@/firebase/firebase";
import { Steps } from "antd";
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";

type StepStatus = "wait" | "process" | "finish" | "error";

interface FlowStepsProps {
    requestNumber: string;
}

const FlowSteps: React.FC<FlowStepsProps> = ({ requestNumber }) => {
    const { userProfile } = useUserContext();
    const [stepStatus, setStepStatus] = useState<{
        purchaseRequest: StepStatus;
        pendingApproval: StepStatus;
        approvalFinance: StepStatus;
        processProcurement: StepStatus;
        purchaseOrderRelease: StepStatus;
    }>({
        purchaseRequest: 'wait',
        pendingApproval: 'wait',
        approvalFinance: 'wait',
        processProcurement: 'wait',
        purchaseOrderRelease: 'wait',
    });

    const [descriptions, setDescriptions] = useState({
        purchaseRequest: "Waiting for request submission",
        pendingApproval: "Waiting for Head Actions",
        approvalFinance: "Waiting for Finance Actions",
        processProcurement: "Waiting for Procurement Actions",
        purchaseOrderRelease: ""
    });

    useEffect(() => {
        console.log("useEffect dijalankan, requestNumber:", requestNumber);
        const fetchStatus = async () => {
            if (!userProfile || !userProfile.userId) return;
            console.log("fetchStatus dipanggil untuk requestNumber:", requestNumber);
            try {

                const requestQuery = query(
                    collection(db, "requests"),
                    where("requesterId", "==", userProfile.userId),
                    where("requestNumber", "==", requestNumber)
                );
                const querySnapshot = await getDocs(requestQuery);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();
                    console.log("Data fetched from Firestore:", data);

                    setStepStatus({
                        purchaseRequest: data.status === 'In Progress' ? 'finish' : 'wait',
                        pendingApproval: data.approvalStatus?.checker?.approved
                            ? 'finish'
                            : data.approvalStatus?.checker?.rejected
                                ? 'error'
                                : 'process', // Menandakan sedang menunggu tindakan dari Checker
                        approvalFinance: data.approvalStatus?.checker?.approved
                            ? data.approvalStatus?.approval?.approved
                                ? 'finish'
                                : data.approvalStatus?.approval?.rejected
                                    ? 'error'
                                    : 'process' // Jika Checker sudah approve, Approval sedang menunggu tindakan
                            : 'wait', // Approval menunggu Checker selesai
                        processProcurement: data.approvalStatus?.approval?.approved
                            ? data.approvalStatus?.releaser?.approved
                                ? 'finish'
                                : data.approvalStatus?.releaser?.rejected
                                    ? 'error'
                                    : 'process' // Jika Approval sudah approve, Releaser sedang menunggu tindakan
                            : 'wait', // Releaser menunggu Approval selesai
                        purchaseOrderRelease: data.approvalStatus?.releaser?.approved ? 'finish' : 'wait',
                    });

                    setDescriptions({
                        purchaseRequest: data.status === 'In Progress'
                            ? "Request Form Submitted"
                            : "Waiting for request submission",
                            
                        pendingApproval: data.approvalStatus?.checker?.approved
                            ? "Head has agreed to your request"
                            : data.approvalStatus?.checker?.rejected
                                ? "Head rejects your request"
                                : data.status === 'In Progress'
                                    ? "Waiting for Head Actions"
                                    : "",
                    
                        approvalFinance: data.approvalStatus?.checker?.approved
                            ? data.approvalStatus?.approval?.approved
                                ? "Finance has agreed to your request"
                                : data.approvalStatus?.approval?.rejected
                                    ? "Finance rejects your request"
                                    : "Waiting for Finance Actions"
                            : "",
                    
                        processProcurement: data.approvalStatus?.approval?.approved
                            ? data.approvalStatus?.releaser?.approved
                                ? "Procurement has agreed to your request"
                                : data.approvalStatus?.releaser?.rejected
                                    ? "Procurement rejects your request"
                                    : "Waiting for Procurement Actions"
                            : "",
                    
                        purchaseOrderRelease: data.approvalStatus?.releaser?.approved
                            ? "Your request has been successfully approved, please wait for your item to arrive."
                            : ""
                    });
                }
            } catch (error) {
                console.error("Error fetching request data:", error);
            }
        };

        fetchStatus();
    }, [requestNumber, userProfile]);

    return (
        <Steps size="default">
            <Steps.Step 
                title="Purchase Request" 
                status={stepStatus.purchaseRequest} 
                description={descriptions.purchaseRequest}
                icon={stepStatus.purchaseRequest === "process" ? <LoadingOutlined /> : null}  
            />
            <Steps.Step 
                title="Pending Approval" 
                status={stepStatus.pendingApproval} 
                description={descriptions.pendingApproval}
                icon={stepStatus.pendingApproval === "process" ? <LoadingOutlined /> : null}
            />
            <Steps.Step 
                title="Approval Finance" 
                status={stepStatus.approvalFinance} 
                description={descriptions.approvalFinance} 
                icon={stepStatus.approvalFinance === "process" ? <LoadingOutlined /> : null}
            />
            <Steps.Step 
                title="Process Procurement" 
                status={stepStatus.processProcurement} 
                description={descriptions.processProcurement}
                icon={stepStatus.processProcurement === "process" ? <LoadingOutlined /> : null} 
            />
            <Steps.Step 
                title="Purchase Order Release" 
                status={stepStatus.purchaseOrderRelease} 
                description={descriptions.purchaseOrderRelease}
                icon={stepStatus.purchaseOrderRelease === "process" ? <LoadingOutlined /> : null}
            />
        </Steps>
    );
}

export default FlowSteps;