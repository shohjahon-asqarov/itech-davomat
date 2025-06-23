import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import NotificationCenter from './NotificationCenter';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const menuItems: MenuProps['items'] = [
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
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Yordam',
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
        <NotificationCenter />

        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Avatar
              icon={<UserOutlined />}
              size="small"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            />
            <Text className="font-medium">Admin</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;