import React from 'react'
import { Card } from 'antd'
import styles from './index.module.scss'

interface FeedbackProps {
    role: string
    feedback: string
}

const Feedback: React.FC<FeedbackProps> = ({ role, feedback }) => {
    return (
        <Card
            title={`Feedback from: ${role}`}
            className={styles.feedbackCard}
            headStyle={{backgroundColor: '#FAFAFA', fontSize: '14px', fontWeight: 600,}}
        >
            <p className={styles.feedbackContent}>{feedback}</p>
        </Card>
    )
}

export default Feedback