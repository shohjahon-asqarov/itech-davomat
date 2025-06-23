import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  SettingOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="bg-white border-r border-gray-200"
      breakpoint="lg"
      collapsedWidth="80"
      trigger={null}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">iT</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">iTech</h1>
              <p className="text-xs text-gray-500 -mt-1">Academy</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">iT</span>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      
      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-none mt-2"
        inlineCollapsed={collapsed}
      />

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Versiya 1.0.0</p>
            <p className="text-xs text-gray-400">© 2024 iTech Academy</p>
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;