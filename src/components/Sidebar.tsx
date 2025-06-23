import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  SettingOutlined,
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
      label: 'Dashboard',
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
      width={220} 
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="sidebar"
      breakpoint="lg"
      collapsedWidth="70"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        {!collapsed ? (
          <div className="logo-expanded">
            <div className="logo-icon">iT</div>
            <div className="logo-text">
              <span className="logo-title">iTech</span>
              <span className="logo-subtitle">Academy</span>
            </div>
          </div>
        ) : (
          <div className="logo-collapsed">iT</div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="sidebar-toggle">
        <button onClick={() => setCollapsed(!collapsed)} className="toggle-btn">
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      
      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
    </Sider>
  );
};

export default Sidebar;