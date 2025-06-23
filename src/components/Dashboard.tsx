import React, { useState, useMemo } from 'react';
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
  Avatar
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import useGoogleSheet from '../hook/useGoogleSheet';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

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
  const { header, body, loading, error } = useGoogleSheet(SPREADSHEET_ID);

  const [searchText, setSearchText] = useState('');
  const [filterMentor, setFilterMentor] = useState<string>('all');

  const handleNavigate = (data: GroupData) => {
    navigate(`/sheet-id/${data.sheet_id}`, { state: data });
  };

  // Faqat Google Sheet'dan kelayotgan ma'lumotlarni ishlatish
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

  // Filtrlash
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchesSearch = item.guruh_nomi.toLowerCase().includes(searchText.toLowerCase()) ||
        item.mentor.toLowerCase().includes(searchText.toLowerCase());
      const matchesMentor = filterMentor === 'all' || item.mentor === filterMentor;

      return matchesSearch && matchesMentor;
    });
  }, [processedData, searchText, filterMentor]);

  // Statistika
  const stats = useMemo(() => {
    const totalGroups = processedData.length;
    const mentors = [...new Set(processedData.map(item => item.mentor))].length;

    return {
      totalGroups,
      mentors
    };
  }, [processedData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Card className="error-card">
          <div className="error-content">
            <h3>Xatolik yuz berdi</h3>
            <p>{error}</p>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => window.location.reload()}
            >
              Qayta yuklash
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: 'Guruh nomi',
      dataIndex: 'guruh_nomi',
      key: 'guruh_nomi',
      render: (text: string, record: GroupData, index: number) => (
        <div className="group-cell">
          <Avatar size="small" className="group-avatar">
            {index + 1}
          </Avatar>
          <span className="group-name">{text}</span>
        </div>
      ),
    },
    {
      title: 'Mentor',
      dataIndex: 'mentor',
      key: 'mentor',
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
      render: (text: string) => (
        <Tag color={text === 'Toq' ? 'blue' : 'purple'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Dars vaqti',
      key: 'schedule',
      render: (record: GroupData) => (
        <div className="schedule-cell">
          <ClockCircleOutlined className="schedule-icon" />
          <span>{record.dars_boshlanish_vaqti} - {record.dars_tugash_vaqti}</span>
        </div>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: GroupData) => (
        <Tooltip title="Batafsil ko'rish">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleNavigate(record)}
          >
            Ko'rish
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>iTech Academy Dashboard</h1>
            <p>Davomat boshqaruv tizimi</p>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Yangilash
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Jami Guruhlar"
              value={stats.totalGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mentorlar"
              value={stats.mentors}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Faol Guruhlar"
              value={stats.totalGroups}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bugungi Darslar"
              value={Math.floor(stats.totalGroups / 2)}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
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
          >
            <Option value="all">Barcha mentorlar</Option>
            {[...new Set(processedData.map(item => item.mentor))].map(mentor => (
              <Option key={mentor} value={mentor}>{mentor}</Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Groups Table */}
      <Card className="table-card">
        <div className="table-header">
          <div className="table-title">
            <TeamOutlined />
            <div>
              <h3>Guruhlar Ro'yxati</h3>
              <p>{filteredData.length} ta guruh</p>
            </div>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} ta guruh`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;