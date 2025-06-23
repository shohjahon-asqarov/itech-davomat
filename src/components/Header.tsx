import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Sozlamalar',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      danger: true,
    },
  ];

  return (
    <AntHeader className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-16">
      <div>
        <Text className="text-gray-600 font-medium">
          Xush kelibsiz, iTech Academy boshqaruv paneliga
        </Text>
      </div>
      
      <Space size="large">
        <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-500 transition-colors" />
        
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Avatar icon={<UserOutlined />} size="small" />
            <Text className="font-medium">Admin</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;