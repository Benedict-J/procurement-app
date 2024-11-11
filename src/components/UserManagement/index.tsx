import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { db } from '@/firebase/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

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
      await addDoc(collection(db, 'preRegisteredUsers'), values);
      message.success("User added successfully!");
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to add user!");
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
      message.success("User updated successfully!");
      setEditingUser(null);
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to update user!");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'registeredUsers', userId));
      message.success("User deleted successfully!");
    } catch (error) {
      message.error("Failed to delete user!");
    }
  };

  const columns = [
    { title: 'NIK', dataIndex: 'nik', key: 'nik' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Entity', dataIndex: 'entity', key: 'entity' },
    { title: 'Division', dataIndex: 'division', key: 'division' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Actions', key: 'actions', render: (_: any, user: any) => (
      <>
        <Button onClick={() => handleEditUser(user)}>Edit</Button>
        <Button onClick={() => handleDeleteUser(user.id)} danger>Delete</Button>
      </>
    )}
  ];

  const onFinish = (values: any) => {
    if (editingUser) {
      handleUpdateUser(values);
    } else {
      handleAddUser(values);
    }
  };

  return (
    <div>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>Add User</Button>
      <Table dataSource={users} columns={columns} rowKey="id" />
      <Modal
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        title={editingUser ? "Edit User" : "Add User"}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;