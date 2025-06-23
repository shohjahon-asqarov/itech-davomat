import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Tooltip,
  Avatar,
  Badge,
  Drawer,
  Switch,
  DatePicker,
  notification,
  Empty,
  Spin,
  Progress
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ExportOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DownloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import useGoogleSheet from '../hook/useGoogleSheet';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID!;

interface GroupData {
  key: number;
  guruh_nomi: string;
  dars_kunlari: string;
  dars_boshlanish_vaqti: string;
  dars_tugash_vaqti: string;
  sheet_id: string;
  mentor: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { body, loading, error } = useGoogleSheet(SPREADSHEET_ID);

  // State management
  const [searchText, setSearchText] = useState('');
  const [filterMentor, setFilterMentor] = useState<string>('all');
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const handleNavigate = (data: GroupData) => {
    navigate(`/sheet-id/${data.sheet_id}`, { state: data });
  };

  // Auto refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        window.location.reload();
        notification.success({
          message: 'Ma\'lumotlar yangilandi',
          description: 'Avtomatik yangilanish amalga oshirildi',
          placement: 'bottomRight',
        });
      }, refreshInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Export functionality
  const exportData = () => {
    const csvContent = [
      ['Guruh nomi', 'Mentor', 'Dars kunlari', 'Boshlanish vaqti', 'Tugash vaqti'],
      ...filteredData.map(item => [
        item.guruh_nomi,
        item.mentor,
        item.dars_kunlari,
        item.dars_boshlanish_vaqti,
        item.dars_tugash_vaqti
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guruhlar_${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    notification.success({
      message: 'Export muvaffaqiyatli',
      description: 'Ma\'lumotlar CSV formatida yuklab olindi',
    });
  };

  // Share functionality
  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'iTech Academy Guruhlar',
          text: `Jami ${filteredData.length} ta guruh mavjud`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      notification.success({
        message: 'Link nusxalandi',
        description: 'Sahifa linki clipboard\'ga nusxalandi',
      });
    }
  };

  // Process data
  const processedData = useMemo<GroupData[]>(() => {
    if (!body.length) return [];
    return body.map((row, index) => ({
      key: index,
      guruh_nomi: row[0] || '',
      dars_kunlari: row[1] || '',
      dars_boshlanish_vaqti: row[2] || '',
      dars_tugash_vaqti: row[3] || '',
      sheet_id: row[4] || '',
      mentor: row[5] || '',
    }));
  }, [body]);

  // Enhanced filtering
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchesSearch = item.guruh_nomi.toLowerCase().includes(searchText.toLowerCase()) ||
        item.mentor.toLowerCase().includes(searchText.toLowerCase());
      const matchesMentor = filterMentor === 'all' || item.mentor === filterMentor;

      return matchesSearch && matchesMentor;
    });
  }, [processedData, searchText, filterMentor]);

  // Statistics
  const stats = useMemo(() => {
    const totalGroups = processedData.length;
    const mentors = [...new Set(processedData.map(item => item.mentor))].length;
    const todayGroups = processedData.filter(item => {
      const today = new Date().getDay();
      const isToday = (today % 2 === 0 && item.dars_kunlari === "Juft") ||
        (today % 2 !== 0 && item.dars_kunlari === "Toq");
      return isToday;
    }).length;

    return {
      totalGroups,
      mentors,
      todayGroups,
      activeGroups: totalGroups
    };
  }, [processedData]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p className="loading-text">Ma'lumotlar yuklanmoqda...</p>
        <Progress percent={Math.random() * 100} showInfo={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Card className="error-card">
          <Empty
            description={
              <div>
                <h3>Xatolik yuz berdi</h3>
                <p>{error}</p>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Qayta yuklash
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: 'Guruh nomi',
      dataIndex: 'guruh_nomi',
      key: 'guruh_nomi',
      sorter: (a: GroupData, b: GroupData) => a.guruh_nomi.localeCompare(b.guruh_nomi),
      render: (text: string, record: GroupData, index: number) => (
        <div className="group-cell">
          <Avatar size="small" className="group-avatar">
            {index + 1}
          </Avatar>
          <span className="group-name">{text}</span>
          <Badge
            count={record.dars_kunlari}
            style={{ backgroundColor: record.dars_kunlari === 'Toq' ? '#1890ff' : '#722ed1' }}
          />
        </div>
      ),
    },
    {
      title: 'Mentor',
      dataIndex: 'mentor',
      key: 'mentor',
      sorter: (a: GroupData, b: GroupData) => a.mentor.localeCompare(b.mentor),
      render: (text: string) => (
        <div className="mentor-cell">
          <UserOutlined className="mentor-icon" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Dars kunlari',
      dataIndex: 'dars_kunlari',
      key: 'dars_kunlari',
      filters: [
        { text: 'Toq', value: 'Toq' },
        { text: 'Juft', value: 'Juft' },
      ],
      onFilter: (value: any, record: GroupData) => record.dars_kunlari === value,
      render: (text: string) => (
        <Tag color={text === 'Toq' ? 'blue' : 'purple'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Dars vaqti',
      key: 'schedule',
      sorter: (a: GroupData, b: GroupData) => a.dars_boshlanish_vaqti.localeCompare(b.dars_boshlanish_vaqti),
      render: (record: GroupData) => (
        <div className="schedule-cell">
          <ClockCircleOutlined className="schedule-icon" />
          <span>{record.dars_boshlanish_vaqti} - {record.dars_tugash_vaqti}</span>
        </div>
      ),
    },
    {
      title: 'Holat',
      key: 'status',
      render: (record: GroupData) => {
        const today = new Date().getDay();
        const isToday = (today % 2 === 0 && record.dars_kunlari === "Juft") ||
          (today % 2 !== 0 && record.dars_kunlari === "Toq");
        return (
          <Badge
            status={isToday ? "processing" : "default"}
            text={isToday ? "Bugungi dars" : "Kutilmoqda"}
          />
        );
      },
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: GroupData) => (
        <Space>
          <Tooltip title="Batafsil ko'rish">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleNavigate(record)}
              size="small"
            >
              Ko'rish
            </Button>
          </Tooltip>
          <Tooltip title="Ulashish">
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => shareData()}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>iTech Academy Dashboard</h1>
            <p>Zamonaviy davomat boshqaruv tizimi</p>
            <div className="header-stats">
              <Tag color="blue">Jami: {stats.totalGroups}</Tag>
              <Tag color="green">Bugun: {stats.todayGroups}</Tag>
              <Tag color="purple">Mentorlar: {stats.mentors}</Tag>
            </div>
          </div>
          <Space>
            <Tooltip title="Qorong'u rejim">
              <Button
                icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={() => setDarkMode(!darkMode)}
              />
            </Tooltip>
            <Tooltip title="To'liq ekran">
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
              />
            </Tooltip>
            <Tooltip title="Export">
              <Button
                icon={<ExportOutlined />}
                onClick={exportData}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Yangilash
            </Button>
          </Space>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Jami Guruhlar"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
              suffix={
                <Progress
                  type="circle"
                  percent={100}
                  width={30}
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Mentorlar"
              value={stats.mentors}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Faol Guruhlar"
              value={stats.activeGroups}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Bugungi Darslar"
              value={stats.todayGroups}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Enhanced Filters */}
      <Card className="filters-card">
        <div className="filters-content">
          <Search
            placeholder="Guruh yoki mentor nomi..."
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />

          <Select
            placeholder="Mentor bo'yicha filtrlash"
            value={filterMentor}
            onChange={setFilterMentor}
            className="filter-select"
            showSearch
            optionFilterProp="children"
          >
            <Option value="all">Barcha mentorlar</Option>
            {[...new Set(processedData.map(item => item.mentor))].map(mentor => (
              <Option key={mentor} value={mentor}>{mentor}</Option>
            ))}
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerVisible(true)}
          >
            Qo'shimcha filtrlar
          </Button>

          <div className="view-mode-switch">
            <Button.Group>
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                Jadval
              </Button>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                onClick={() => setViewMode('card')}
              >
                Kartalar
              </Button>
            </Button.Group>
          </div>
        </div>
      </Card>

      {/* Groups Display */}
      {viewMode === 'table' ? (
        <Card className="table-card">
          <div className="table-header">
            <div className="table-title">
              <TeamOutlined />
              <div>
                <h3>Guruhlar Ro'yxati</h3>
                <p>{filteredData.length} ta guruh</p>
              </div>
            </div>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportData}>
                Yuklab olish
              </Button>
              <Badge count={selectedGroups.length}>
                <Button icon={<ShareAltOutlined />} onClick={shareData}>
                  Ulashish
                </Button>
              </Badge>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} ta guruh`,
            }}
            scroll={{ x: 1000 }}
            rowSelection={{
              selectedRowKeys: selectedGroups,
              onChange: (selectedRowKeys) => setSelectedGroups(selectedRowKeys as string[]),
            }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((group) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={group.key}>
              <Card
                hoverable
                actions={[
                  <EyeOutlined key="view" onClick={() => handleNavigate(group)} />,
                  <ShareAltOutlined key="share" onClick={shareData} />,
                ]}
              >
                <Card.Meta
                  avatar={<Avatar className="group-avatar">{group.key + 1}</Avatar>}
                  title={group.guruh_nomi}
                  description={
                    <div>
                      <p><UserOutlined /> {group.mentor}</p>
                      <p><CalendarOutlined /> {group.dars_kunlari}</p>
                      <p><ClockCircleOutlined /> {group.dars_boshlanish_vaqti} - {group.dars_tugash_vaqti}</p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Advanced Filters Drawer */}
      <Drawer
        title="Qo'shimcha filtrlar"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={400}
      >
        <div className="drawer-content">
          <div className="filter-section">
            <h4>Avtomatik yangilanish</h4>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Yoqilgan"
              unCheckedChildren="O'chirilgan"
            />
            {autoRefresh && (
              <div style={{ marginTop: 16 }}>
                <p>Yangilanish oralig'i (soniya):</p>
                <Select
                  value={refreshInterval}
                  onChange={setRefreshInterval}
                  style={{ width: '100%' }}
                >
                  <Option value={10}>10 soniya</Option>
                  <Option value={30}>30 soniya</Option>
                  <Option value={60}>1 daqiqa</Option>
                  <Option value={300}>5 daqiqa</Option>
                </Select>
              </div>
            )}
          </div>

          <div className="filter-section">
            <h4>Bildirishnomalar</h4>
            <Switch
              defaultChecked
              checkedChildren={<BellOutlined />}
              unCheckedChildren="O'chirilgan"
            />
          </div>

          <div className="filter-section">
            <h4>Sana oralig'i</h4>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Dashboard;