import {
    Layout,
    Card,
    Button,
    Form,
    Input,
    Image,
    Divider,
    Typography,
    message,
  } from "antd";
  import classes from "./index.module.scss";
  import { useRouter } from "next/router";
  import { Select } from 'antd';
  import type { SelectProps } from 'antd';
  import { registerUser } from "@/firebase/register";
  import { useState } from "react";
  
  const { Text } = Typography;
  const { Content } = Layout;
  
  const ConfirmRegisterPage: React.FC | any = () => {
    const router = useRouter();

    const { nik, namaLengkap, divisi} = router.query;

    const entityOptions: SelectProps['options'] = [
      { label: 'PT Pembiayaan Digital Indonesia', value: 'PT Pembiayaan Digital Indonesia' },
      { label: 'PT Berkah Giat Jaya', value: 'PT Berkah Giat Jaya' },
      { label: 'PT Pratama Interdana Finance', value: 'PT Pratama Interdana Finance' },
      { label: 'PT BLU Teknologi Indonesia', value: 'PT BLU Teknologi Indonesia' },
      { label: 'PT Teknologi Cerdas Finansial', value: 'Entity E' }
    ];

    const roleOptions: SelectProps['options'] = [
      { label: 'Requester', value: 'Requester' },
      { label: 'Checker', value: 'Checker' },
      { label: 'Approval', value: 'Approval' },
    ];

    // const domainToCompanyMap = {
    //   'adakami.id': 'PT Pembiayaan Digital Indonesia',
    //   'bgj.id': 'PT Berkah Giat Jaya',
    //   'yessscredit.id': 'PT Pratama Interdana Finance',
    //   'blu.id': 'PT BLU Teknologi Indonesia',
    //   'cashcerdas.id': 'PT Teknologi Cerdas Finansial'
    // };

    const [profiles, setProfiles] = useState([{ email: "", entity: "", role: "" }]); 

    const addProfile = () => {
      setProfiles([...profiles, { email: "", entity: "", role: "" }]);
    };

    const removeProfile = (index: number) => {
      const newProfiles = profiles.filter((_, i) => i !== index);
      setProfiles(newProfiles); 
    };
  
    const handleProfileChange = (index: number, field: 'email' | 'entity' | 'role', value: string) => {
      const newProfiles = [...profiles];
      newProfiles[index][field] = value;

      // if (field === 'email') {
      //   const suggestedCompany = getCompanyFromDomain(value); // Dapatkan perusahaan yang sesuai dengan domain email
      //   if (suggestedCompany) {
      //     newProfiles[index].entity = suggestedCompany; // Auto-pilih perusahaan berdasarkan domain
      //     message.info(`Company selected based on email domain: ${suggestedCompany}`);
      //   } else {
      //     message.error("Email domain does not match any registered company.");
      //   }
      // }

      setProfiles(newProfiles);
    };

    const getDomainFromEmail = (email: string) => {
      return email.split('@')[1]; // Ambil domain dari email (bagian setelah '@')
    };
    
    // const getCompanyFromDomain = (email: string | null) => {
    //   const domain = getDomainFromEmail(email);
    //   return domainToCompanyMap[domain as keyof typeof domainToCompanyMap] || null; // Cari perusahaan yang sesuai dengan domain
    // };

    const selectedCompanies = profiles.map((profile) => profile.entity);
    const selectedRoles = profiles.map((profile) => profile.role);

    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
      console.log("Form values: ", values);
      console.log("Profiles: ", profiles); 

      const { password, confirmPassword } = values;

      if (password !== confirmPassword) {
          message.error("Password not match!");
          return;
        }

      const profile1 = profiles[0];
      const { email: profileEmail, entity, role } = profile1;

      if (profiles.length === 0 || !profiles[0].email || !profiles[0].entity || !profiles[0].role) {
        message.error("Profile 1 is mandatory and must be completed.");
        return;
      }

      console.log("Entity for Profile 1: ", entity);
      console.log("Email for Profile 1: ", profileEmail);

      try {
        const result = await registerUser(nik, namaLengkap, divisi, profiles, password);
 
        if (result.success) {
        message.success("Register success! Verification email has been sent");
        router.push("/auth/email-verification");
        } else {
          message.error(result.message);
        }
      } catch (error) {
        console.error("Error during registration: ", error);
        message.error("An unknown error occurred, try again.");
      }
    }
  
    return (
      <>
        <Content className={classes.confirmRegisterContainer}>
          <Card className={classes.cardRegister} style={{ maxWidth: '400px', marginTop: "70px" }}>
            <div className={classes.logo}>
              <div style={{ textAlign: "center" }}>
                <Image
                  src="/images/app-logo/adakami_logo.png"
                  width={160}
                  preview={false}
                  alt="logo"
                />
              </div>
            </div>
  
            <Divider />
  
            <p style={{ marginBottom: 20, textAlign: 'center'}}>
              <Text style={{color : '#000000', fontWeight: 'bold', fontSize: "20px"}}>
                Confirm Registration
              </Text>
            </p>
            
            <Form layout="vertical">
            <Form.Item label="Full Name">
            <Input value={namaLengkap} readOnly style={{color:"grey"}}/>
            </Form.Item>

            <Form.Item label="Division">
            <Input value={divisi} readOnly style={{color:"grey"}}/>
            </Form.Item>
            </Form>

            {profiles.map((profile, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:"6px" }}>
              <p style={{ fontWeight: 600, fontSize: 20, color:'black' }}>Profile {index + 1}</p>
                {index !== 0 && (
                  <Button
                  type="dashed"
                  danger
                  onClick={() => removeProfile(index)}
                  style={{ marginLeft: 10 }}
                >
                  Delete
                </Button>
                )}
              </div>
              <Form layout="vertical">
                <Form.Item 
                  label={index === 0 ? <span>Email</span> : "Email"}
                  rules={index === 0 ? [{ required: true, message: 'Email is required for Profile 1' }] : []}>
                  <Input
                    value={profile.email}
                    onChange={(e) => handleProfileChange(index, "email", e.target.value)}
                  />
                </Form.Item>

                <Form.Item 
                  label={index === 0 ? <span>Entity</span> : "Entity"} 
                  rules={index === 0 ? [{ required: true, message: 'Entity is required for Profile 1' }] : []} >
                  <Select
                    allowClear
                    value={profile.entity}
                    onChange={(value) => handleProfileChange(index, "entity", value)}
                    options={entityOptions.map(option => ({
                      ...option,
                      disabled: selectedCompanies.includes(option.value.toString()) && option.value !== profile.entity
                    }))}
                  />
                </Form.Item>

                <Form.Item label="Role" rules={[{ required: true, message: 'Role is required for Profile 1' }]}>
                <Select
                  allowClear
                  value={profile.role}
                  onChange={(value) => handleProfileChange(index, "role", value)}
                  options={roleOptions.map(option => ({
                    ...option,
                    disabled: selectedRoles.includes(option.value.toString()) && option.value !== profile.role
                  }))} 
                />
                </Form.Item>
              </Form>

              <Divider />
            </div>
          ))}

          <Button type="dashed" onClick={addProfile} block style={{ marginBottom: '20px' }}>
            + Add Profile
          </Button>
            
            <Form
              form={form}
              name="confirm-register"
              layout="vertical"
              initialValues={{ remember: false }}
              onFinish={onFinish}
              autoComplete="off"
            >
  
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters!",
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                    message: "The password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character (@$!%*?&)",
                  }
                ]}
              >
                <Input.Password />
              </Form.Item>
  
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  htmlType="submit"
                  size="middle"
                  block
                  style={{ backgroundColor: "#1F9245", color: "#ffffff", marginTop: "10px" }}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </>
    );
  };
  
  export default ConfirmRegisterPage;
  