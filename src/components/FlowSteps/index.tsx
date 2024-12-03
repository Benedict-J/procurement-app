import { db } from '@/firebase/firebase'
import { Steps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { collection, getDocs, query, where } from 'firebase/firestore'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useUserContext } from '@/contexts/UserContext'
import { formatDate } from '@/utils/format'

type StepStatus = 'wait' | 'process' | 'finish' | 'error'

interface FlowStepsProps {
  requestNumber: string
}

const FlowSteps: React.FC<FlowStepsProps> = ({ requestNumber }) => {
  const { userProfile } = useUserContext()
  // Set Step Status
  const [stepStatus, setStepStatus] = useState<{
    purchaseRequest: StepStatus
    pendingApproval: StepStatus
    approvalFinance: StepStatus
    processProcurement: StepStatus
    purchaseOrderRelease: StepStatus
  }>({
    purchaseRequest: 'wait',
    pendingApproval: 'wait',
    approvalFinance: 'wait',
    processProcurement: 'wait',
    purchaseOrderRelease: 'wait',
  })
  // Set Step Description
  const [descriptions, setDescriptions] = useState({
    purchaseRequest: 'Waiting for request submission',
    pendingApproval: 'Waiting for Head Actions',
    approvalFinance: 'Waiting for Finance Actions',
    processProcurement: 'Waiting for Procurement Actions',
    purchaseOrderRelease: '',
  })

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

          const determineStatus = (
            status: 'process' | 'wait',
            approved: boolean | undefined,
            rejected: boolean | undefined,
          ): 'finish' | 'error' | 'process' | 'wait' => {
            if (approved) return 'finish'
            if (rejected) return 'error'
            return status
          }

          const checkerStatus = determineStatus(
            'process',
            data.approvalStatus?.checker?.approved,
            data.approvalStatus?.checker?.rejected,
          )
          const approvalStatus =
            checkerStatus === 'finish'
              ? determineStatus(
                  'process',
                  data.approvalStatus?.approval?.approved,
                  data.approvalStatus?.approval?.rejected,
                )
              : 'wait'
          const releaserStatus =
            approvalStatus === 'finish'
              ? determineStatus(
                  'process',
                  data.approvalStatus?.releaser?.approved,
                  data.approvalStatus?.releaser?.rejected,
                )
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

          // Set Description of each action if query not empty
          // Need to be refactored
          // For functions with a lot of parameters, it is better to use options object method to pass in parameters
          // as when we call the function we will know what parameters the function needs and we won't be confused which parameter is for which
          //
          //  createDescription(
          // 	'Finance has agreed to your request',
          // 	'Finance rejects your request',
          // 	'Waiting for Finance Actions',
          // 	data.approvalStatus?.approval || {},
          // 	data.approvalStatus?.approval?.approvedAt,
          // 	data.approvalStatus?.approval?.rejectedAt,
          // )
          //
          // Like in this createDescription function, I wouldn't know what 'Finance has agreed to your request' is for
          // while if you use options object method such as createDescription({ approvedText: 'Finance has agreed to your request' })
          // it is much more clearer for you and other developers who read your code
          //
          // Reference here: https://stackoverflow.com/questions/12826977/multiple-arguments-vs-options-object
          const createDescription = (
            approvedText: string,
            rejectedText: string,
            waitingText: string,
            status?: { approved?: boolean; rejected?: boolean },
            actionAt?: string,
            actionBy?: string,
          ): string => {
            if (status?.approved) {
              // There is duplicate code for the html string and it can be set as variable or function
              return `${approvedText}${actionAt ? `<br /> <span style="font-size:12px; color:#616161; font-family:'Roboto Mono',monospace; display:block;">${formatDate(actionAt)}</span>` : ''}`
            } else if (status?.rejected) {
              return `${rejectedText}${actionBy ? `<br /> <span style="font-size:12px; color:#616161; font-family:'Roboto Mono',monospace; display:block;">${formatDate(actionBy)}</span>` : ''}`
            }
            return waitingText || 'No description available'
          }

          setDescriptions({
            purchaseRequest: `Request Form Submitted${data.createdAt ? `<br /> <span style="font-size:12px; color:#616161; font-family:'Roboto Mono',monospace; display:block;">${formatDate(data.createdAt)}</span>` : ''}`,

            pendingApproval: createDescription(
              'Head has agreed to your request',
              'Head rejects your request',
              'Waiting for Head Actions',
              data.approvalStatus?.checker || {},
              data.approvalStatus?.checker?.approvedAt,
              data.approvalStatus?.checker?.rejectedAt,
            ),

            approvalFinance: data.approvalStatus?.checker?.approved
              ? createDescription(
                  'Finance has agreed to your request',
                  'Finance rejects your request',
                  'Waiting for Finance Actions',
                  data.approvalStatus?.approval || {},
                  data.approvalStatus?.approval?.approvedAt,
                  data.approvalStatus?.approval?.rejectedAt,
                )
              : '',

            processProcurement: data.approvalStatus?.approval?.approved
              ? createDescription(
                  'Procurement has agreed to your request',
                  'Procurement rejects your request',
                  'Waiting for Procurement Actions',
                  data.approvalStatus?.releaser || {},
                  data.approvalStatus?.releaser?.approvedAt,
                  data.approvalStatus?.releaser?.rejectedAt,
                )
              : '',

            purchaseOrderRelease: data.approvalStatus?.releaser?.approved
              ? `Your request has been successfully approved, please wait for your item to arrive.${
                  data.approvalStatus?.releaser?.approvedAt
                    ? ` <br /> <span style="font-size:12px; color:#616161; display:block; font-family:'Roboto Mono', monospace;">${formatDate(data.approvalStatus.releaser.approvedAt)}</span>`
                    : ''
                }`
              : '',
          })
        }
      } catch (error) {
        console.error('Error fetching request data:', error)
      }
    }

    fetchStatus()
  }, [requestNumber, userProfile])

  return (
    <Steps size="default">
      {/* There are a lot of duplicate <Step.Step /> code and this can refactored to a smaller component called FlowStep */}
      {/* After creating the child component, you can use a HOF called map (https://www.w3schools.com/jsref/jsref_map.asp) */}
      {/* to display the FlowStep component */}
      {/* First you need to find all the variables in Steps.Step and the only difference is in the title prop, status prop and description prop */}
      {/* Next you should define the parameters for FlowStep component which are the title and currentProcess (status and description has same name) */}
      {/* Create an array of objects and put all the variables in that array such as [{ title: "Purchse Request", currentProcess: "purchaseRequest" }] */}
      {/* Don't forget about the dynamic access for object values as it is used for the status and description */}
      {/* Reference: https://www.freecodecamp.org/news/how-to-render-lists-in-react/ or https://react.dev/learn/rendering-lists */}
      <Steps.Step
        title="Purchase Request"
        status={stepStatus.purchaseRequest}
        description={
          <span
            dangerouslySetInnerHTML={{ __html: descriptions.purchaseRequest }}
          />
        }
        icon={
          stepStatus.purchaseRequest === 'process' ? <LoadingOutlined /> : null
        }
      />
      <Steps.Step
        title="Pending Approval"
        status={stepStatus.pendingApproval}
        description={
          <span
            dangerouslySetInnerHTML={{ __html: descriptions.pendingApproval }}
          />
        }
        icon={
          stepStatus.pendingApproval === 'process' ? <LoadingOutlined /> : null
        }
      />
      <Steps.Step
        title="Approval Finance"
        status={stepStatus.approvalFinance}
        description={
          <span
            dangerouslySetInnerHTML={{ __html: descriptions.approvalFinance }}
          />
        }
        icon={
          stepStatus.approvalFinance === 'process' ? <LoadingOutlined /> : null
        }
      />
      <Steps.Step
        title="Process Procurement"
        status={stepStatus.processProcurement}
        description={
          <span
            dangerouslySetInnerHTML={{
              __html: descriptions.processProcurement,
            }}
          />
        }
        icon={
          stepStatus.processProcurement === 'process' ? (
            <LoadingOutlined />
          ) : null
        }
      />
      <Steps.Step
        title="Purchase Order Release"
        status={stepStatus.purchaseOrderRelease}
        description={
          <span
            dangerouslySetInnerHTML={{
              __html: descriptions.purchaseOrderRelease,
            }}
          />
        }
        icon={
          stepStatus.purchaseOrderRelease === 'process' ? (
            <LoadingOutlined />
          ) : null
        }
      />
    </Steps>
  )
}

export default FlowSteps
