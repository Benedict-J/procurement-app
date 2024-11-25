import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { db, auth } from '@/firebase/firebase';
import { collection, updateDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { useUserContext } from '@/contexts/UserContext';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { userProfile } = useUserContext();

    const { currentUser } = auth;
        if (currentUser) {
        const uid = currentUser.uid;
    }

    useEffect(() => {
        const fetchUsers = async () => {
            if (!userProfile) return;
            
            const registeredUsersSnapshot = await getDocs(collection(db, 'registeredUsers'));
            const registeredUsersData = registeredUsersSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                source: 'registeredUsers',
            }))
            .filter(user => user.id !== userProfile.userId); 

            const preRegisteredUsersSnapshot = await getDocs(collection(db, 'preRegisteredUsers'));
            const preRegisteredUsersData = preRegisteredUsersSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                nik: doc.id,
                source: 'preRegisteredUsers',
            }))
            .filter(user => user.nik !== userProfile?.nik);

            setUsers([...registeredUsersData, ...preRegisteredUsersData]);
        };

        fetchUsers();
    }, [userProfile]);

    const handleAddUser = async (values: any) => {
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
            message.success("Successfully added user!");
            form.resetFields();
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error adding user:", error);
            message.error("Failed to add user!");
        }
    };

    const openAddUserModal = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditUser = (user: any) => {
        if (user.userId === userProfile?.userId || user.nik === userProfile?.nik) {
            message.error("You cannot edit your own account.");
            return;
        }
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
            const collectionName = editingUser.source;
            const oldNIK = editingUser.nik;
            const newNIK = values.nik;

            if (collectionName === 'preRegisteredUsers') {
                // Jika berasal dari preRegisteredUsers, NIK adalah ID dokumen
                if (oldNIK !== newNIK) {
                    await deleteDoc(doc(db, collectionName, oldNIK));
                    await setDoc(doc(db, collectionName, newNIK), {
                        namaLengkap: values.namaLengkap,
                        divisi: values.divisi,
                        profile: updatedProfiles,
                    });
                } else {
                    await updateDoc(doc(db, collectionName, oldNIK), {
                        namaLengkap: values.namaLengkap,
                        divisi: values.divisi,
                        profile: updatedProfiles,
                    });
                }
            } else if (collectionName === 'registeredUsers') {
                // Jika berasal dari registeredUsers, update field NIK tanpa mengubah ID dokumen
                await updateDoc(doc(db, collectionName, editingUser.id), {
                    nik: newNIK,
                    namaLengkap: values.namaLengkap,
                    divisi: values.divisi,
                    profile: updatedProfiles,
                });
            }
            message.success("User updated successfully!");
            setEditingUser(null);
            setIsModalVisible(false);
            form.resetFields();

            // Fetch updated data from both collections
            const registeredUsersSnapshot = await getDocs(collection(db, 'registeredUsers'));
            const registeredUsersData = registeredUsersSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                source: 'registeredUsers',
            }));

            const preRegisteredUsersSnapshot = await getDocs(collection(db, 'preRegisteredUsers'));
            const preRegisteredUsersData = preRegisteredUsersSnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                nik: doc.id,
                source: 'preRegisteredUsers',
            }));

            setUsers([...registeredUsersData, ...preRegisteredUsersData]);
        } catch (error) {
            console.error("Failed to update user:", error);
            message.error("Failed to update user.");
        }
    };

    const handleDeleteUser = async (userId: string, source: string, userNik?: string) => {
        if (userId === userProfile?.userId || userNik === userProfile?.nik) {
            message.error("You cannot delete your own account.");
            return;
        }
        try {
            await deleteDoc(doc(db, source, userId));
            message.success("User deleted successfully!");
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            message.error("Failed to delete user.");
        }
    };

    const confirmDeleteUser = (userId: string, source: string) => {
        Modal.confirm({
            title: 'Delete user',
            content: 'Are you sure you want to delete this user?',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => handleDeleteUser(userId, source),
        });
    };

    const confirmAddUser = (values: any) => {
        Modal.confirm({
            title: 'Confirm Submission',
            content: 'Is the data entered correct?',
            okText: 'Yes, Submit',
            cancelText: 'Cancel',
            onOk: () => handleAddUser(values),
        });
    };

    const confirmUpdateUser = (values: any) => {
        Modal.confirm({
            title: 'Confirm Update',
            content: 'Is the updated data correct?',
            okText: 'Yes, Update',
            cancelText: 'Cancel',
            onOk: () => handleUpdateUser(values),
        });
    };


    const columns = [
        {
            title: 'No',
            key: 'no',
            align: 'center' as 'center',
            render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
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
            filters: [
                { text: 'Yes', value: 'Yes' },
                { text: 'No', value: 'No' },
            ],
            onFilter: (value: any, record: any) => {
                const isRegistered = record.source === 'registeredUsers' ? 'Yes' : 'No';
                return isRegistered === value;
            },
            render: (user: any) => (user.source === 'registeredUsers' ? 'Yes' : 'No'),
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
                        onClick={() => confirmDeleteUser(user.id, user.source)}
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

    const validateProfiles = (profiles: any[], division: string) => {
        console.log('Received Division:', division);
    
        const normalizedDivision = division ? division.trim().toLowerCase() : 'undefined';
        console.log('Normalized Division:', normalizedDivision);
    
        // Validasi untuk divisi Finance
        if (normalizedDivision === 'finance') {
            const entityEmailMap = new Map();
            const emailEntityMap = new Map();
    
            for (const profile of profiles) {
                const { email, entity, role } = profile;
    
                // Cek Entity Sama - Email Berbeda
                if (entityEmailMap.has(entity)) {
                    const existingEmail = entityEmailMap.get(entity);
                    if (existingEmail !== email) {
                        return { isValid: false, message: `Entity ${entity} cannot be associated with multiple emails in Finance division.` };
                    }
                }
    
                // Cek Email Sama - Entity Berbeda
                if (emailEntityMap.has(email)) {
                    const existingEntity = emailEntityMap.get(email);
                    if (existingEntity !== entity) {
                        return { isValid: false, message: `Email ${email} cannot be associated with multiple entities in Finance division.` };
                    }
                }
    
                entityEmailMap.set(entity, email);
                emailEntityMap.set(email, entity);
    
                // Validasi role
                if (role !== 'Approval' && role !== 'Checker') {
                    return { isValid: false, message: 'Role must be Approval or Checker for Finance division.' };
                }
            }
        }
    
        // Validasi untuk divisi selain Finance
        if (normalizedDivision !== 'finance') {
            const emailSet = new Set();
            const entitySet = new Set();
    
            for (const profile of profiles) {
                // Cek apakah email berbeda
                if (emailSet.has(profile.email)) {
                    return { isValid: false, message: 'Emails must be unique for non-Finance divisions.' };
                }
                // Cek apakah entity berbeda
                if (entitySet.has(profile.entity)) {
                    return { isValid: false, message: 'Entities must be unique for non-Finance divisions.' };
                }
    
                emailSet.add(profile.email);
                entitySet.add(profile.entity);
            }
        }
    
        return { isValid: true, message: '' };
    };                
    
    const onFinish = (values: any) => {
        const division = values.divisi;
        const validation = validateProfiles(values.profiles, division);
    
        if (!validation.isValid) {
            message.error(validation.message);
            return;
        }
    
        if (editingUser) {
            confirmUpdateUser(values);
        } else {
            confirmAddUser(values);
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
                okText="Submit"
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="nik"
                        label="NIK"
                        rules={[
                            { required: true, message: 'NIK is required.' },
                            {
                                pattern: /^[0-9]+$/,
                                message: 'NIK must contain only numbers.',
                            },
                        ]}
                    >
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
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'email']}
                                            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                                            style={{ flex: 1 }}
                                        >
                                            <Input placeholder="Email" />
                                        </Form.Item>

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
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        Add Profile
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