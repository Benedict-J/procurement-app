import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1); 
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, 'registeredUsers'));
            const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersData);
        };

        fetchUsers();
    }, []);

    const handleAddUser = async (values: any) => {
        try {
            await addDoc(collection(db, 'registeredUsers'), values);
            message.success("User added successfully!");
            form.resetFields();
            setIsModalVisible(false);
        } catch (error) {
            message.error("Failed to add user.");
        }
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.namaLengkap,
            nik: user.nik,
            division: user.divisi,
            profile: user.profile || []
        });
        setIsModalVisible(true);
    };

    const handleUpdateUser = async (values: any) => {
        if (!editingUser) return;
        try {
            const updatedProfile = values.profile || [];

            await updateDoc(doc(db, 'registeredUsers', editingUser.id), {
                namaLengkap: values.name,
                nik: values.nik,
                divisi: values.division,
                profile: updatedProfile
            });
            message.success("User updated successfully!");
            setEditingUser(null);
            setIsModalVisible(false);
            form.resetFields();
            
            // Refresh user data
            const querySnapshot = await getDocs(collection(db, 'registeredUsers'));
            const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersData);
        } catch (error) {
            message.error("Failed to update user.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, 'registeredUsers', userId));
            message.success("User deleted successfully!");
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            message.error("Failed to delete user.");
        }
    };

    const columns = [
        {
            title: 'No.',
            key: 'no',
            align: 'center' as 'center',
            render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
        },
        { title: 'NIK', dataIndex: 'nik', key: 'nik', align: 'center' as 'center' },
        { title: 'Name', dataIndex: 'namaLengkap', key: 'namaLengkap', align: 'center' as 'center' },
        { title: 'Division', dataIndex: 'divisi', key: 'divisi', align: 'center' as 'center' },
        {
            title: 'Entity',
            key: 'entity',
            align: 'center' as 'center',
            render: (_: any, user: any) => (
                <div>
                    {user.profile.map((profile: any, index: number) => (
                        <div key={index}>{profile.entity}</div>
                    ))}
                </div>
            )
        },
        {
            title: 'Role',
            key: 'role',
            align: 'center' as 'center',
            render: (_: any, user: any) => (
                <div>
                    {user.profile.map((profile: any, index: number) => (
                        <div key={index}>{profile.role}</div>
                    ))}
                </div>
            )
        },
        {
            title: 'Email',
            key: 'email',
            align: 'center' as 'center',
            render: (_: any, user: any) => (
                <div>
                    {user.profile.map((profile: any, index: number) => (
                        <div key={index}>{profile.email}</div>
                    ))}
                </div>
            )
        },
        {
            title: 'Operation',
            key: 'operation',
            align: 'center' as 'center',
            render: (_: any, user: any) => (
                <>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(user)}
                        style={{ marginRight: 8 }}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteUser(user.id)}
                        danger
                    />
                </>
            )
        }
    ];

    const onFinish = (values: any) => {
        if (editingUser) {
            handleUpdateUser(values);
        } else {
            handleAddUser(values);
        }
    };

    const handleTableChange = (pagination: any) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                <Button type="primary" onClick={() => setIsModalVisible(true)}>Add New</Button>
            </div>
            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: users.length,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50, 100],
                }}
                onChange={handleTableChange}
                style={{ textAlign: 'center' }}
            />
            <Modal
                visible={isModalVisible}
                onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
                onOk={() => form.submit()}
                title={editingUser ? "Edit User" : "Add User"}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="nik" label="NIK" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="division" label="Division" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    
                    <Form.List name="profile">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <div key={key} style={{ marginBottom: '15px', border: '1px solid #e8e8e8', padding: '10px', borderRadius: '5px' }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'entity']}
                                            fieldKey={[fieldKey, 'entity']}
                                            label="Entity"
                                            rules={[{ required: true, message: 'Entity is required' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'role']}
                                            fieldKey={[fieldKey, 'role']}
                                            label="Role"
                                            rules={[{ required: true, message: 'Role is required' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'email']}
                                            fieldKey={[fieldKey, 'email']}
                                            label="Email"
                                            rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Button type="dashed" onClick={() => remove(name)} block icon={<DeleteOutlined />}>
                                            Remove Profile
                                        </Button>
                                    </div>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<EditOutlined />}>
                                    Add New Profile
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;