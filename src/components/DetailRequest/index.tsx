import { useEffect, useState } from 'react'
import { Table, Pagination, message, Modal, Card, Button } from 'antd'
import type { TableColumnsType } from 'antd'
import { useUserContext } from '@/contexts/UserContext'
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import styles from './index.module.scss'
import { useRouter } from 'next/router'
import { parseAmount, formatDate } from '@/utils/format'
import Feedback from '@/components/DetailRequest/Feedback'

interface DataType {
  key: React.Key
  requestNumber: string
  itemNumber: number
  estimateDeliveryDate: string
  deliveryAddress: string
  merk: string
  detailSpecs: string
  color: string
  qty: number
  uom: string
  linkRef: string
  budgetMax: string
  taxCost: string
  deliveryFee: string
  feedback: string | null
  receiver: string
}

interface DetailRequestTableProps {
  requestNo: string
}

const DetailRequestTable: React.FC<DetailRequestTableProps> = ({
  requestNo,
}) => {
  const { userProfile } = useUserContext()
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [requestNumber, setRequestNumber] = useState<string | null>(null)
  const [grandTotal, setGrandTotal] = useState<number>(0)
  const router = useRouter()

  const [entity, setEntity] = useState<string | null>(null)
  const [division, setDivision] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [feedbackData, setFeedbackData] = useState<{
    role: string
    feedback: string
  } | null>(null)
  const [docId, setDocId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  // Fetch request data based on the request number
  const fetchRequest = async () => {
    if (!userProfile || !requestNo) return

    const requestQuery = query(
      collection(db, 'requests'),
      where('requestNumber', '==', requestNo),
    )

    try {
      const querySnapshot = await getDocs(requestQuery)
      if (!querySnapshot.empty) {
        const firstDoc = querySnapshot.docs[0]
        const data = firstDoc.data()
        setDocId(firstDoc.id)
        setRequestNumber(data.requestNumber || 'N/A')

        setEntity(data.requesterEntity || 'N/A')
        setDivision(data.requesterDivision || 'N/A')
        setStatus(data.status || 'Pending')
        setName(data.requesterName || 'N/A')

        // Kalo misalnya ada repeat if-else kayak dibawah dan isi contentnya sama aja kita bisa pake array dan HOF (Higher order function) yaitu forEach
        // Kita bisa akses object punya value menggunakan data.status atau data['status']. Kalo untuk dynamic access ke object properties bisa pake yang bracket notation
        // Bisa belajar tentang object properties disini ya:
        // https://dev.to/quratulaiinn/javascript-object-properties-dot-notation-or-bracket-notation-3gk0#:~:text=Bracket%20notation%20allows%20dynamic%20access,property%20you%20want%20to%20access.
        // Display feedback when request is rejected
        if (data.status === 'Rejected') {
          const roleList = ['Checker', 'Approval', 'Releaser'];

          roleList.forEach((role: string) => {
            const feedback = data.approvalStatus?.[role.toLowerCase()]?.feedback;

            if (feedback) {
              setFeedbackData({ role, feedback });
            }
          });
        }

        //   if (data.approvalStatus?.checker?.feedback) {
        //     setFeedbackData({
        //       role: 'Checker',
        //       feedback: data.approvalStatus.checker.feedback,
        //     })
        //   } else if (data.approvalStatus?.approval?.feedback) {
        //     setFeedbackData({
        //       role: 'Approval',
        //       feedback: data.approvalStatus.approval.feedback,
        //     })
        //   } else if (data.approvalStatus?.releaser?.feedback) {
        //     setFeedbackData({
        //       role: 'Releaser',
        //       feedback: data.approvalStatus.releaser.feedback,
        //     })
        //   }
        // }

        let calculatedGrandTotal = 0

        const requestData = (data.items || []).map((item: any, index: number) => {
          // Using format function to format date
          const requestDateFormatted = formatDate(data.createdAt);
          const estimateDeliveryDateFormatted = formatDate(item.deliveryDate) || 'N/A';
          // Using format function to convert money value
          const budgetMax = parseAmount(item.budgetMax);
          const taxCost = parseAmount(item.taxCost);
          const deliveryFee = parseAmount(item.deliveryFee);

          // Calculate total item cost
          const totalItem = budgetMax + taxCost + deliveryFee

          calculatedGrandTotal += totalItem

          return {
            key: `${firstDoc.id}-${index}`,
            requestNumber: data.requestNumber || 'N/A',
            itemNumber: index + 1,
            estimateDeliveryDate: estimateDeliveryDateFormatted,
            deliveryAddress:
              item.deliveryAddress === 'other'
                ? item.customDeliveryAddress || 'N/A'
                : item.deliveryAddress || 'N/A',
            receiver: item.receiver || 'N/A',
            merk: item.merk || 'N/A',
            detailSpecs: item.detailSpecs || 'N/A',
            color: item.color || 'N/A',
            qty: item.qty || 0,
            uom: item.uom || 'N/A',
            linkRef: item.linkRef || 'N/A',
            budgetMax: budgetMax.toLocaleString('id-ID'),
            taxCost: taxCost.toLocaleString('id-ID'),
            deliveryFee: deliveryFee.toLocaleString('id-ID'),
            totalItem: totalItem.toLocaleString('id-ID'),
            feedback: feedbackData ? feedbackData.feedback : 'No feedback',
            requestDate: requestDateFormatted,
          }
        },
        )
        setGrandTotal(calculatedGrandTotal)
        setDataSource(requestData)
      } else {
        console.log('No data found for requestNo:', requestNo)
      }
    } catch (error) {
      console.error('Error fetching request data:', error)
    }
  }

  useEffect(() => {
    fetchRequest()
  }, [userProfile, requestNo])

  const navigateToEditPage = () => {
    router.push({
      pathname: '/requester/edit-request',
      query: { requestNo },
    })
  }

  const showCancelConfirmation = () => {
    setIsModalVisible(true)
  }

  // Handle confirmation to cancel the request
  const handleConfirmCancelRequest = async () => {
    if (!docId) return

    try {
      const requestDocRef = doc(db, 'requests', docId)
      await deleteDoc(requestDocRef)

      message.success('Request has been successfully canceled and removed.')
      setIsModalVisible(false)
      router.back()
    } catch (error) {
      console.error('Error deleting request:', error)
      message.error('Failed to cancel the request.')
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Nomor Item',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      align: 'center',
      width: 100,
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      align: 'center',
      width: 150,
    },
    {
      title: 'Estimate Delivery Date',
      dataIndex: 'estimateDeliveryDate',
      key: 'estimateDeliveryDate',
      align: 'center',
      width: 200,
    },
    {
      title: 'Delivery Address',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      align: 'center',
      width: 300,
    },
    {
      title: 'Receiver',
      dataIndex: 'receiver',
      key: 'receiver',
      align: 'center',
      width: 150,
    },
    {
      title: 'Merk',
      dataIndex: 'merk',
      key: 'merk',
      align: 'center',
      width: 100,
    },
    {
      title: 'Detail Specs',
      dataIndex: 'detailSpecs',
      key: 'detailSpecs',
      align: 'center',
      width: 300,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      align: 'center',
      width: 100,
    },
    { title: 'QTY', dataIndex: 'qty', key: 'qty', align: 'center', width: 80 },
    { title: 'UoM', dataIndex: 'uom', key: 'uom', align: 'center', width: 100 },
    {
      title: 'Link Ref',
      dataIndex: 'linkRef',
      key: 'linkRef',
      align: 'center',
      width: 150,
      render: (text: string) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          Click Here
        </a>
      ),
    },
    {
      title: 'Budget Max',
      dataIndex: 'budgetMax',
      key: 'budgetMax',
      align: 'center',
    },
    {
      title: 'Tax Cost',
      dataIndex: 'taxCost',
      key: 'taxCost',
      align: 'center',
    },
    {
      title: 'Delivery Fee',
      dataIndex: 'deliveryFee',
      key: 'deliveryFee',
      align: 'center',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalItem',
      key: 'totalItem',
      align: 'center',
      width: 150,
    },
  ]

  const shouldActionsBeVisible =
    userProfile?.role === 'Requester' && status === 'Rejected'
  const currentData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <div className={styles.requestContainer}>
      <div className={styles.requestHeader}>
        <div className={styles.requestLeft}>
          <h3 className={styles.requestTitle}>
            <strong>Request number: </strong>
            {requestNumber || 'N/A'}
          </h3>
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Entity:</strong> {entity}
          </p>
          <p>
            <strong>Division:</strong> {division}
          </p>
        </div>
        <div className={styles.requestRight}>
          <p className={styles.status}>
            <strong>Status: </strong>
            <span
              className={
                status === 'Approved'
                  ? styles.statusApproved
                  : status === 'Rejected'
                    ? styles.statusRejected
                    : status === 'In Progress'
                      ? styles.statusInProgress
                      : ''
              }
            >
              {status}
            </span>
          </p>
          {shouldActionsBeVisible && (
            <div className={styles.actions}>
              <Button
                className={styles.cancelButton}
                onClick={showCancelConfirmation}
              >
                Cancel Request
              </Button>
              <Button
                className={styles.editButton}
                onClick={navigateToEditPage}
              >
                Edit Request
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.spacing} />

      <Table<DataType>
        columns={columns}
        dataSource={currentData}
        pagination={false}
        bordered
        scroll={{ x: 2000 }}
        className={styles.table}
      />

      <div className={styles.feedbackGrandTotal}>
        <div className={styles.feedbackSection}>
          {userProfile?.role === 'Requester' && status === 'Rejected' && feedbackData ? (
            <Feedback role={feedbackData.role} feedback={feedbackData.feedback} />
          ) : (
            <div className={styles.emptyFeedback}></div>
          )}
        </div>
        <div className={styles.grandTotalSection}>
          <div className={styles.totalContainer}>
            <span className={styles.totalLabel}>Grand Total:</span>
            <span className={styles.totalValue}>
              {' '}
              Rp {grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={dataSource.length}
        onChange={(page, size) => {
          setCurrentPage(page)
          if (size) setPageSize(size)
        }}
        className={styles.pagination}
        showSizeChanger={true}
        pageSizeOptions={['10', '20', '50', '100']}
      />

      <Modal
        title="Confirm Cancel Request"
        open={isModalVisible}
        onOk={handleConfirmCancelRequest}
        onCancel={handleModalCancel}
        okText="Yes, Cancel"
        cancelText="No"
      >
        <p>Are you sure you want to cancel this request?</p>
      </Modal>
    </div>
  )
}

export default DetailRequestTable