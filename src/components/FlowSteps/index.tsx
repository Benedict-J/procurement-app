import { db } from "@/firebase/firebase";
import { Steps } from "antd";
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/router"
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import styles from "./index.module.scss";

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

    const [subtitles, setSubtitles] = useState({
        purchaseRequest: "",
        pendingApproval: "",
        approvalFinance: "",
        processProcurement: "",
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

                    const formatDate = (dateTime: string) => dayjs(dateTime).format("YYYY-MM-DD");

                    console.log("Data fetched from Firestore:", data);

                    setStepStatus({
                        purchaseRequest: data.status == 'In Progress' ? 'finish' : 'finish',
                        pendingApproval: data.approvalStatus?.checker?.approved
                            ? 'finish'
                            : data.approvalStatus?.checker?.rejected
                                ? 'error'
                                : 'process',
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
                        purchaseRequest: `Request Form Submitted` + 
                         (data.createdAt ? `<br /> <span style="font-size:12px; color:#616161; font-family:'Roboto Mono',monospace; display:block;">${formatDate(data.createdAt)}</span>` : ''),
                            
                        pendingApproval: data.approvalStatus?.checker?.approved
                            ? `Head has agreed to your request${data.approvalStatus?.checker?.approvedAt ? `<br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.checker.approvedAt)}</span>` : ''}`
                            : data.approvalStatus?.checker?.rejected
                                ? `Head rejects your request${data.approvalStatus?.checker?.rejectedAt ? ` <br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.checker.rejectedAt)}</span>` : ''}`
                                : "Waiting for Head Actions",
                        
                        approvalFinance: data.approvalStatus?.checker?.approved
                            ? data.approvalStatus?.approval?.approved
                                ? `Finance has agreed to your request${data.approvalStatus?.approval?.approvedAt ? ` <br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.approval.approvedAt)}</span>` : ''}`
                                : data.approvalStatus?.approval?.rejected
                                    ? `Finance rejects your request${data.approvalStatus?.approval?.rejectedAt ? ` <br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.approval.rejectedAt)}</span>` : ''}`
                                    : "Waiting for Finance Actions"
                            : "",
                        
                        processProcurement: data.approvalStatus?.approval?.approved
                            ? data.approvalStatus?.releaser?.approved
                                ? `Procurement has agreed to your request${data.approvalStatus?.releaser?.approvedAt ? `<span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.releaser.approvedAt)}</span>` : ''}`
                                : data.approvalStatus?.releaser?.rejected
                                    ? `Procurement rejects your request${data.approvalStatus?.releaser?.rejectedAt ? ` <br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.releaser.rejectedAt)}</span>` : ''}`
                                    : "Waiting for Procurement Actions"
                            : "",
                        
                        purchaseOrderRelease: data.approvalStatus?.releaser?.approved
                            ? `Your request has been successfully approved, please wait for your item to arrive.${data.approvalStatus?.releaser?.approvedAt ? ` <br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.releaser.approvedAt)}</span>` : ''}`
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
                description={<span dangerouslySetInnerHTML={{ __html: descriptions.purchaseRequest }} />}
                icon={stepStatus.purchaseRequest === "process" ? <LoadingOutlined /> : null}  
                
            />
            <Steps.Step 
                title="Pending Approval" 
                status={stepStatus.pendingApproval} 
                description={<span dangerouslySetInnerHTML={{ __html: descriptions.pendingApproval }} />}
                icon={stepStatus.pendingApproval === "process" ? <LoadingOutlined /> : null}
            />
            <Steps.Step 
                title="Approval Finance" 
                status={stepStatus.approvalFinance} 
                description={<span dangerouslySetInnerHTML={{ __html: descriptions.approvalFinance }} />}
                icon={stepStatus.approvalFinance === "process" ? <LoadingOutlined /> : null}
            />
            <Steps.Step 
                title="Process Procurement" 
                status={stepStatus.processProcurement} 
                description={<span dangerouslySetInnerHTML={{ __html: descriptions.processProcurement }} />}
                icon={stepStatus.processProcurement === "process" ? <LoadingOutlined /> : null} 
        
            />
            <Steps.Step 
                title="Purchase Order Release" 
                status={stepStatus.purchaseOrderRelease} 
                description={<span dangerouslySetInnerHTML={{ __html: descriptions.purchaseOrderRelease }} />}
                icon={stepStatus.purchaseOrderRelease === "process" ? <LoadingOutlined /> : null}
                
            />
        </Steps>
    );
}

export default FlowSteps;