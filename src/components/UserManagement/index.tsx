import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { db, auth } from '@/firebase/firebase';
import { collection, updateDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { useUserContext } from '@/contexts/UserContext';
import { fetchAllUsers } from '@/firebase/userService';

const { Search } = Input;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { userProfile } = useUserContext();
    const [searchKeyword, setSearchKeyword] = useState('');

    const { currentUser } = auth;
        if (currentUser) {
        const uid = currentUser.uid;
    }

    useEffect(() => {
        const getUsers = async () => {
            const allUsers = await fetchAllUsers(userProfile);
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        };

        getUsers()
    }, [userProfile]);

    // Handle adding a new user
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

    // Handle editing an existing user
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

    // Handle updating an existing user
    const handleUpdateUser = async (values: any) => {
        if (!editingUser) return;
        try {
            const updatedProfiles = values.profiles || [];
            const collectionName = editingUser.source;
            const oldNIK = editingUser.nik;
            const newNIK = values.nik;

            if (collectionName === 'preRegisteredUsers') {
                // If the user is from preRegisteredUsers, NIK is the document ID
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
                // If the user is from registeredUsers, update the document by its ID
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

    // Handle deleting a user
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

    // Handle searching users by name, NIK, or email
    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        const filteredData = users.filter(user => {
            const { namaLengkap, nik, profile } = user;
            const email = profile.map((p: any) => p.email).join(' ');
            return (
                namaLengkap?.toLowerCase().includes(keyword.toLowerCase()) ||
                nik?.toString().includes(keyword) ||
                email?.toLowerCase().includes(keyword.toLowerCase())
            );
        });
        setFilteredUsers(filteredData);
    };

    // Confirm the deletion of a user
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

    // Confirm the addition of a new user
    const confirmAddUser = (values: any) => {
        Modal.confirm({
            title: 'Confirm Submission',
            content: 'Is the data entered correct?',
            okText: 'Yes, Submit',
            cancelText: 'Cancel',
            onOk: () => handleAddUser(values),
        });
    };

    // Confirm the update user
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
            filters: [
                { text: 'Requester', value: 'Requester' },
                { text: 'Checker', value: 'Checker' },
                { text: 'Approval', value: 'Approval' },
                { text: 'Releaser', value: 'Releaser' },
                { text: 'Super Admin', value: 'Super Admin' },
            ],
            onFilter: (value: any, record: any) => {
                return record.profile.some((profile: any) => profile.role === value);
            },
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

    // Validate the profiles on add profile
    const validateProfiles = (profiles: any[], division: string) => {
        console.log('Received Division:', division);
    
        const normalizedDivision = division ? division.trim().toLowerCase() : 'undefined';
        console.log('Normalized Division:', normalizedDivision);
    
        // Validation for finance division
        if (normalizedDivision === 'finance') {
            const entityEmailMap = new Map();
            const emailEntityMap = new Map();
    
            for (const profile of profiles) {
                const { email, entity, role } = profile;
    
                // Check same entity - different email
                if (entityEmailMap.has(entity)) {
                    const existingEmail = entityEmailMap.get(entity);
                    if (existingEmail !== email) {
                        return { isValid: false, message: `Entity ${entity} cannot be associated with multiple emails in Finance division.` };
                    }
                }
    
                // Cek same email - different entity
                if (emailEntityMap.has(email)) {
                    const existingEntity = emailEntityMap.get(email);
                    if (existingEntity !== entity) {
                        return { isValid: false, message: `Email ${email} cannot be associated with multiple entities in Finance division.` };
                    }
                }
    
                entityEmailMap.set(entity, email);
                emailEntityMap.set(email, entity);
    
                // Validate the role for Finance division (must be Approval or Checker)
                if (role !== 'Approval' && role !== 'Checker') {
                    return { isValid: false, message: 'Role must be Approval or Checker for Finance division.' };
                }
            }
        }
    
        // Validation for divisions other than Finance
        if (normalizedDivision !== 'finance') {
            const emailSet = new Set();
            const entitySet = new Set();
    
            for (const profile of profiles) {
                // Check if email is different
                if (emailSet.has(profile.email)) {
                    return { isValid: false, message: 'Emails must be unique for non-Finance divisions.' };
                }
                // Check if entity is different
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

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Search
                    placeholder="Search by Name, NIK, or Email"
                    allowClear
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <Button type="primary" onClick={openAddUserModal}>
                    Add New
                </Button>
            </div>
            <Table
                dataSource={filteredUsers}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredUsers.length,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50, 100],
                }}
                onChange={(pagination: any) => {
                    setCurrentPage(pagination.current);
                    setPageSize(pagination.pageSize);
                }}
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