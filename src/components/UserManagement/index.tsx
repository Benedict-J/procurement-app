import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, Modal, Form, Input, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1); // Tambahkan state untuk halaman saat ini
    const [pageSize, setPageSize] = useState(10); // Tambahkan state untuk ukuran halaman

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
            const userData = {
                namaLengkap: values.fullName,
                divisi: values.division,
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
    

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
    };

    const handleUpdateUser = async (values: any) => {
        if (!editingUser) return;
        try {
            await updateDoc(doc(db, 'registeredUsers', editingUser.id), values);
            message.success("User berhasil diperbarui!");
            setEditingUser(null);
            setIsModalVisible(false);
        } catch (error) {
            message.error("Gagal memperbarui user!");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, 'registeredUsers', userId));
            message.success("User berhasil dihapus!");
        } catch (error) {
            message.error("Gagal menghapus user!");
        }
    };

    const columns = [
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

    const entityOptions = [
        { label: "Pembiayaan Digital Indonesia", value: "Pembiayaan Digital Indonesia" },
        { label: "Berkah Giat Jaya", value: "Berkah Giat Jaya" },
        { label: "Teknologi Cerdas Finansial", value: "Teknologi Cerdas Finansial" },
        { label: "BLU", value: "BLU" },
        { label: "PIF", value: "PIF" },
    ];
    
    const roleOptions = [
        { label: "Requester", value: "requester" },
        { label: "Checker", value: "checker" },
        { label: "Approval", value: "approval" },
        { label: "Releaser", value: "releaser" },
        { label: "Super Admin", value: "Super Admin" },
    ];

    const onFinish = (values: any) => {
        if (editingUser) {
            handleUpdateUser(values);
        } else {
            handleAddUser(values);
        }
    };

    // Handler untuk perubahan pada pagination
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
         onCancel={() => setIsModalVisible(false)}
         onOk={() => form.submit()}
         title={editingUser ? "Edit User" : "Add User"}
         width={900} 
        >
            <Form form={form} onFinish={handleAddUser} layout="vertical">
                <Form.Item name="nik" label="NIK (UID)" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="division" label="Division" rules={[{ required: true }]}>
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
            ]}>
                {(fields, { add, remove }) => (
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
                                <Input placeholder="Email"/>
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
                                <Button type="link" onClick={() => remove(name)}>
                                    Hapus
                                </Button>
                            </div>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block>
                                Tambah Profile
                            </Button>
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