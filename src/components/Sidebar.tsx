import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  SettingOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Bosh sahifa',
    },
    {
      key: '/groups',
      icon: <TeamOutlined />,
      label: 'Guruhlar',
    },
    {
      key: '/attendance',
      icon: <FileTextOutlined />,
      label: 'Davomat',
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: 'Kurslar',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Sozlamalar',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider 
      width={250} 
      className="bg-white shadow-lg"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">iT</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">iTech</h1>
            <p className="text-sm text-gray-500">Academy</p>
          </div>
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-none mt-4"
      />
    </Sider>
  );
};

export default Sidebar;