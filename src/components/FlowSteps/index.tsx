import { db } from '@/firebase/firebase'
import { Steps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { collection, getDocs, query, where } from 'firebase/firestore'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useUserContext } from '@/contexts/UserContext'
import { formatDate } from '@/utils/format'
import FlowStep from './components/FlowStep'

type CurrentProcess =
  | "purchaseRequest"
  | "pendingApproval"
  | "approvalFinance"
  | "processProcurement"
  | "purchaseOrderRelease"

type StepStatus = 'wait' | 'process' | 'finish' | 'error'

interface FlowStepsProps {
  requestNumber: string
}

const FlowSteps: React.FC<FlowStepsProps> = ({ requestNumber }) => {
  const { userProfile } = useUserContext()
  // Set Step Status
  const [stepStatus, setStepStatus] = useState<Record<CurrentProcess, StepStatus>>({
    purchaseRequest: "wait",
    pendingApproval: "process",
    approvalFinance: "wait",
    processProcurement: "wait",
    purchaseOrderRelease: "wait",
  })
  // Set Step Description
  const [descriptions, setDescriptions] = useState<Record<CurrentProcess, JSX.Element>>({
    purchaseRequest: <>Waiting for request submission</>,
    pendingApproval: <>Waiting for Head Actions</>,
    approvalFinance: <>Waiting for Finance Actions</>,
    processProcurement: <>Waiting for Procurement Actions</>,
    purchaseOrderRelease: <></>,
  })

  const stepData: { title: string; currentProcess: CurrentProcess }[] = [
    { title: "Purchase Request", currentProcess: "purchaseRequest" },
    { title: "Pending Approval", currentProcess: "pendingApproval" },
    { title: "Approval Finance", currentProcess: "approvalFinance" },
    { title: "Process Procurement", currentProcess: "processProcurement" },
    { title: "Purchase Order Release", currentProcess: "purchaseOrderRelease" },
  ]

  useEffect(() => {
    console.log('useEffect dijalankan, requestNumber:', requestNumber)
  
    const fetchStatus = async () => {
      if (!userProfile || !userProfile.userId) return
      console.log('fetchStatus dipanggil untuk requestNumber:', requestNumber)
  
      try {
        // Query to get Requests
        const requestQuery = query(
          collection(db, 'requests'),
          where('requesterId', '==', userProfile.userId),
          where('requestNumber', '==', requestNumber),
        )
        const querySnapshot = await getDocs(requestQuery)
  
        // Set Status of each action if query not empty
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]
          const data = docSnap.data()
  
          console.log('Data fetched from Firestore:', data)
  
          const determineStatus = ({
            status,
            approved,
            rejected,
          }: {
            status: 'process' | 'wait'
            approved?: boolean
            rejected?: boolean
          }): 'finish' | 'error' | 'process' | 'wait' => {
            if (approved) return 'finish'
            if (rejected) return 'error'
            return status
          }
  
          const checkerStatus = determineStatus({
            status: 'process',
            approved: data.approvalStatus?.checker?.approved,
            rejected: data.approvalStatus?.checker?.rejected,
          })
  
          const approvalStatus =
            checkerStatus === 'finish'
              ? determineStatus({
                  status: 'process',
                  approved: data.approvalStatus?.approval?.approved,
                  rejected: data.approvalStatus?.approval?.rejected,
                })
              : 'wait'
  
          const releaserStatus =
            approvalStatus === 'finish'
              ? determineStatus({
                  status: 'process',
                  approved: data.approvalStatus?.releaser?.approved,
                  rejected: data.approvalStatus?.releaser?.rejected,
                })
              : 'wait'
  
          const purchaseOrderStatus = data.approvalStatus?.releaser?.approved
            ? 'finish'
            : 'wait'
  
          setStepStatus({
            purchaseRequest: 'finish', // Always 'finish'
            pendingApproval: checkerStatus,
            approvalFinance: approvalStatus,
            processProcurement: releaserStatus,
            purchaseOrderRelease: purchaseOrderStatus,
          })
  
          // Refactored createDescription function using options object
          const createDescription = ({
            approvedText,
            rejectedText,
            waitingText,
            status,
            actionAt,
            actionBy,
          }: {
            approvedText: string
            rejectedText: string
            waitingText: string
            status?: { approved?: boolean; rejected?: boolean }
            actionAt?: string
            actionBy?: string
          }): JSX.Element => {
            if (status?.approved) {
              return (
                <>
                  {approvedText}
                  {actionAt && (
                    <br />
                  )}
                  {actionAt && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#616161",
                        fontFamily: "Roboto Mono, monospace",
                        display: "block",
                      }}
                    >
                      {formatDate(actionAt)}
                    </span>
                  )}
                </>
              );
            } else if (status?.rejected) {
              return (
                <>
                  {rejectedText}
                  {actionBy && (
                    <br />
                  )}
                  {actionBy && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#616161",
                        fontFamily: "Roboto Mono, monospace",
                        display: "block",
                      }}
                    >
                      {formatDate(actionBy)}
                    </span>
                  )}
                </>
              );
            }
            return <>{waitingText || "No description available"}</>;
          };          
  
          setDescriptions({
            purchaseRequest: (
              <>
                Request Form Submitted
                {data.createdAt && (
                  <>
                    <br />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#616161",
                        fontFamily: "Roboto Mono, monospace",
                        display: "block",
                      }}
                    >
                      {formatDate(data.createdAt)}
                    </span>
                  </>
                )}
              </>
            ),
          
            pendingApproval: createDescription({
              approvedText: "Head has agreed to your request",
              rejectedText: "Head rejects your request",
              waitingText: "Waiting for Head Actions",
              status: data.approvalStatus?.checker,
              actionAt: data.approvalStatus?.checker?.approvedAt,
              actionBy: data.approvalStatus?.checker?.rejectedAt,
            }),
          
            approvalFinance: data.approvalStatus?.checker?.approved ? (
              createDescription({
                approvedText: "Finance has agreed to your request",
                rejectedText: "Finance rejects your request",
                waitingText: "Waiting for Finance Actions",
                status: data.approvalStatus?.approval,
                actionAt: data.approvalStatus?.approval?.approvedAt,
                actionBy: data.approvalStatus?.approval?.rejectedAt,
              })
            ) : (
              <>Waiting for Finance Actions</>
            ),
          
            processProcurement: data.approvalStatus?.approval?.approved ? (
              createDescription({
                approvedText: "Procurement has agreed to your request",
                rejectedText: "Procurement rejects your request",
                waitingText: "Waiting for Procurement Actions",
                status: data.approvalStatus?.releaser,
                actionAt: data.approvalStatus?.releaser?.approvedAt,
                actionBy: data.approvalStatus?.releaser?.rejectedAt,
              })
            ) : (
              <>Waiting for Procurement Actions</>
            ),
          
            purchaseOrderRelease: data.approvalStatus?.releaser?.approved ? (
              <>
                Your request has been successfully approved, please wait for your item to
                arrive.
                {data.approvalStatus?.releaser?.approvedAt && (
                  <>
                    <br />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#616161",
                        fontFamily: "Roboto Mono, monospace",
                        display: "block",
                      }}
                    >
                      {formatDate(data.approvalStatus.releaser.approvedAt)}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>Waiting for Purchase Order Release</>
            ),
          });          
        }
      } catch (error) {
        console.error('Error fetching request data:', error)
      }
    }
  
    fetchStatus()
  }, [requestNumber, userProfile])
  

  return (
    <Steps size="default">
      {stepData.map((step) => (
        <FlowStep
          key={step.currentProcess}
          title={step.title}
          status={stepStatus[step.currentProcess]}
          description={descriptions[step.currentProcess]}
          icon={stepStatus[step.currentProcess] === "process" ? <LoadingOutlined/> : undefined}
        />
      ))}
    </Steps>
  )
}

export default FlowSteps
