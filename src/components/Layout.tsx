import React from 'react';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout className="min-h-screen">
      <Sidebar />
      <AntLayout>
        <Header />
        <Content className="bg-gray-50">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;