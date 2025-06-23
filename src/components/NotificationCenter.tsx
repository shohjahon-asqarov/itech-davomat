import React, { useState } from 'react';
import { Badge, Dropdown, List, Button, Typography, Empty } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Yangi guruh qo\'shildi',
      message: 'React.js guruhi muvaffaqiyatli qo\'shildi',
      time: '5 daqiqa oldin',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Davomat yangilandi',
      message: 'Python guruhi davomati yangilandi',
      time: '10 daqiqa oldin',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Eslatma',
      message: 'Bugun 5 ta guruhda dars bor',
      time: '1 soat oldin',
      read: true,
      type: 'warning'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#52c41a';
      case 'warning': return '#faad14';
      case 'error': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  const notificationMenu = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Bildirishnomalar</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Barchasini o'qilgan deb belgilash
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty
          description="Bildirishnomalar yo'q"
          style={{ padding: '20px' }}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                backgroundColor: item.read ? 'transparent' : '#f6ffed',
                borderLeft: `3px solid ${getTypeColor(item.type)}`
              }}
              actions={[
                !item.read && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => markAsRead(item.id)}
                  />
                ),
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteNotification(item.id)}
                  danger
                />
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <Text strong={!item.read} style={{ fontSize: '14px' }}>
                    {item.title}
                  </Text>
                }
                description={
                  <div>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      {item.message}
                    </Text>
                    <br />
                    <Text style={{ fontSize: '11px', color: '#999' }}>
                      {item.time}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={notificationMenu}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{ fontSize: '16px' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationCenter;