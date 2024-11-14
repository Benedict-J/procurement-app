import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, Modal, Form, Input, message, Select, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const fetchUsers = async () => {
            const registeredUsersSnapshot = await getDocs(collection(db, 'registeredUsers'));
            const registeredUsersData = registeredUsersSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                source: 'registeredUsers',
                registered: true,
            }));
    
            const preRegisteredUsersSnapshot = await getDocs(collection(db, 'preRegisteredUsers'));
            const preRegisteredUsersData = preRegisteredUsersSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                nik: doc.id,
                source: 'preRegisteredUsers',
                registered: false,
            }));
    
            setUsers([...registeredUsersData, ...preRegisteredUsersData]);
        };
    
        fetchUsers();
    }, []);

    const handleAddUser = async (values: any) => {
        console.log("Values received:", values);
        try {
            if (!values.profiles || values.profiles.length === 0) {
                message.error("Profile is required.");
                return;
            }

            const userData = {
                namaLengkap: values.namaLengkap,
                divisi: values.divisi,
                profile: values.profiles,
            };

            await setDoc(doc(db, 'preRegisteredUsers', values.nik), userData);
            message.success("User berhasil ditambahkan!");
            form.resetFields();
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error adding user:", error);
            message.error("Gagal menambahkan user!");
        }
    };

    const openAddUserModal = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditUser = (user: any) => {
        setEditingUser({
            ...user,
            source: user.source
        });
        form.setFieldsValue({
            namaLengkap: user.namaLengkap,
            nik: user.nik,
            divisi: user.divisi,
            profiles: user.profile || []
        });
        setIsModalVisible(true);
    };
    const handleUpdateUser = async (values: any) => {
        if (!editingUser) return;
        try {
            const updatedProfiles = values.profiles || [];
    
            // Pastikan kondisi pemilihan koleksi benar
            const collectionName = editingUser.source === 'registeredUsers' ? 'registeredUsers' : 'preRegisteredUsers';
            const userDocRef = doc(db, collectionName, editingUser.id);
    
            console.log("Updating document in collection:", collectionName, "with ID:", editingUser.id);
    
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                message.error("User document not found. Cannot update non-existing user.");
                return;
            }
    
            await updateDoc(userDocRef, {
                namaLengkap: values.namaLengkap,
                divisi: values.divisi,
                profile: updatedProfiles
            });
            message.success("User updated successfully!");
            setEditingUser(null);
            setIsModalVisible(false);
            form.resetFields();
    
            // Refresh user data
            const querySnapshot = await getDocs(collection(db, collectionName));
            const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to update user:", error);
            message.error("Failed to update user.");
        }
    };

    const handleDeleteUser = async (userId: string, registered: boolean) => {
        const collectionName = registered ? 'registeredUsers' : 'preRegisteredUsers';
        try {
            await deleteDoc(doc(db, collectionName, userId));
            message.success("User deleted successfully!");
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            message.error("Failed to delete user.");
        }
    };

    const confirmDeleteUser = (userId: string, registered: boolean) => {
        Modal.confirm({
            title: 'Delete user',
            content: 'Are you sure you want to delete this user?',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleDeleteUser(userId, registered),
        });
    };

    const columns = [
        {
            title: 'NIK',
            key: 'nik',
            align: 'center' as 'center',
            render: (user: any) => user.source === 'preRegisteredUsers' ? user.id : user.nik,
        },
        {
            title: 'NIK',
            key: 'nik',
            align: 'center' as 'center',
            render: (user: any) => user.source === 'preRegisteredUsers' ? user.id : user.nik,
        },
        { title: 'Name', dataIndex: 'namaLengkap', key: 'namaLengkap', align: 'center' as 'center' },
        { title: 'Division', dataIndex: 'divisi', key: 'divisi', align: 'center' as 'center' },
        {
            title: 'Registered',
            key: 'registered',
            align: 'center' as 'center',
            render: (text: any, user: any) => (user.registered ? 'Yes' : 'No'),
        },
        {
            title: 'Entity',
            key: 'entity',
            align: 'center' as 'center',
            render: (_: any, user: any) => (
                <div>
                    {Array.isArray(user.profile) ? (
                        user.profile.map((profile: any, index: number) => (
                            <div key={index}>{profile.entity}</div>
                        ))
                    ) : (
                        <div>-</div>
                    )}
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
                        onClick={() => confirmDeleteUser(user.id, user.registered)}
                        danger
                    />
                </>
            )
        }
    ];

    const entityOptions = [
        { label: "PT Pembiayaan Digital Indonesia", value: "PT Pembiayaan Digital Indonesia" },
        { label: "PT Berkah Giat Jaya", value: "PT Berkah Giat Jaya" },
        { label: "PT Teknologi Cerdas Finansial", value: "PT Teknologi Cerdas Finansial" },
        { label: "PT Blu", value: "PT Blu" },
        { label: "PT Pratama Interdana Finance", value: "PT Pratama Interdana Finance" },
    ];

    const roleOptions = [
        { label: "Requester", value: "Requester" },
        { label: "Checker", value: "Checker" },
        { label: "Approval", value: "Approval" },
        { label: "Releaser", value: "Releaser" },
        { label: "Super Admin", value: "Super Admin" },
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
                <Button type="primary" onClick={openAddUserModal}>Add New</Button>
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
                title={editingUser ? "Update User" : "Add New User"}
                width={1000}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="nik" label="NIK" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="namaLengkap" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="divisi" label="Division" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.List
                name="profiles"
                rules={[
                {
                    validator: async (_, profiles) => {
                        if (!profiles || profiles.length === 0) {
                            return Promise.reject(new Error('Please add at least one profile.'));
                        }
                    },
                },
            ]}
        >
            {(fields, { add, remove }, { errors }) => (
                <>
                    {fields.map(({ key, name, ...restField }) => (
                        <div key={key} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                            {/* Email */}
                            <Form.Item
                                {...restField}
                                name={[name, 'email']}
                                rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                                style={{ flex: 1 }}
                            >
                                <Input placeholder="Email" />
                            </Form.Item>

                            {/* Entity */}
                            <Form.Item
                                {...restField}
                                name={[name, 'entity']}
                                rules={[{ required: true, message: 'Please select entity' }]}
                                style={{ flex: 1 }}
                            >
                                <Select placeholder="Select Entity">
                                    {entityOptions.map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Role */}
                            <Form.Item
                                {...restField}
                                name={[name, 'role']}
                                rules={[{ required: true, message: 'Please select role' }]}
                                style={{ flex: 1 }}
                            >
                                <Select placeholder="Select Role">
                                    {roleOptions.map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Tombol Hapus */}
                            <Button type="link" onClick={() => remove(name)}>
                                Hapus
                            </Button>
                        </div>
                    ))}

                    {/* Tombol Tambah Profile */}
                    <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                            Tambah Profile
                        </Button>
                        <Form.ErrorList errors={errors} />
                    </Form.Item>
                </>
            )}
        </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;