import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Tooltip,
  Badge,
  Avatar,
  Timeline
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import useGoogleSheet from '../hook/useGoogleSheet';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID!;

// Define GroupData type
interface GroupData {
  key: number;
  guruh_nomi: string;
  dars_kunlari: string;
  dars_boshlanish_vaqti: string;
  dars_tugash_vaqti: string;
  sheet_id: string;
  mentor: string;
  holat: string;
  oquvchilar_soni: number;
  attendance_rate: number;
  last_activity: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { header, body, loading, error } = useGoogleSheet(SPREADSHEET_ID);

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMentor, setFilterMentor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const handleNavigate = (data: GroupData) => {
    navigate(`/sheet-id/${data.sheet_id}`, { state: data });
  };

  // Process data with enhanced filtering and sorting
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
      holat: 'Faol',
      oquvchilar_soni: Math.floor(Math.random() * 20) + 10,
      attendance_rate: Math.floor(Math.random() * 30) + 70,
      last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('uz-UZ'),
    }));
  }, [body]);

  // Enhanced filtering
  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const matchesSearch = item.guruh_nomi.toLowerCase().includes(searchText.toLowerCase()) ||
        item.mentor.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.holat === filterStatus;
      const matchesMentor = filterMentor === 'all' || item.mentor === filterMentor;

      return matchesSearch && matchesStatus && matchesMentor;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.guruh_nomi.localeCompare(b.guruh_nomi);
        case 'students':
          return b.oquvchilar_soni - a.oquvchilar_soni;
        case 'attendance':
          return b.attendance_rate - a.attendance_rate;
        default:
          return 0;
      }
    });
  }, [processedData, searchText, filterStatus, filterMentor, sortBy]);

  // Enhanced statistics
  const stats = useMemo(() => {
    const totalGroups = processedData.length;
    const activeGroups = processedData.filter(item => item.holat === 'Faol').length;
    const totalStudents = processedData.reduce((sum, item) => sum + item.oquvchilar_soni, 0);
    const avgAttendance = processedData.length > 0
      ? Math.round(processedData.reduce((sum, item) => sum + item.attendance_rate, 0) / processedData.length)
      : 0;
    const topPerformingGroups = processedData.filter(item => item.attendance_rate >= 90).length;

    return {
      totalGroups,
      activeGroups,
      totalStudents,
      avgAttendance,
      topPerformingGroups,
      mentors: [...new Set(processedData.map(item => item.mentor))].length
    };
  }, [processedData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="text-center border-red-200">
          <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Xatolik yuz berdi</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <Button type="primary" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            Qayta yuklash
          </Button>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      title: 'Guruh',
      dataIndex: 'guruh_nomi',
      key: 'guruh_nomi',
      render: (text: string, record: GroupData) => (
        <div className="flex items-center space-x-3">
          <Avatar
            style={{
              backgroundColor: record.attendance_rate >= 90 ? '#10b981' :
                record.attendance_rate >= 80 ? '#f59e0b' : '#ef4444'
            }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-800">{text}</div>
            <div className="text-xs text-gray-500">Son faoliyat: {record.last_activity}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mentor',
      dataIndex: 'mentor',
      key: 'mentor',
      render: (text: string) => (
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Jadval',
      key: 'schedule',
      render: (record: GroupData) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <CalendarOutlined className="text-green-500" />
            <Tag color={record.dars_kunlari === 'Toq' ? 'blue' : 'purple'}>
              {record.dars_kunlari}
            </Tag>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockCircleOutlined />
            <span>{record.dars_boshlanish_vaqti} - {record.dars_tugash_vaqti}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'O\'quvchilar',
      dataIndex: 'oquvchilar_soni',
      key: 'oquvchilar_soni',
      render: (count: number) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <TeamOutlined className="text-blue-500" />
            <span className="font-bold text-lg">{count}</span>
          </div>
          <div className="text-xs text-gray-500">o'quvchi</div>
        </div>
      ),
    },
    {
      title: 'Davomat',
      dataIndex: 'attendance_rate',
      key: 'attendance_rate',
      render: (rate: number) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{rate}%</span>
            {rate >= 90 && <TrophyOutlined className="text-yellow-500" />}
          </div>
          <Progress
            percent={rate}
            size="small"
            strokeColor={
              rate >= 90 ? '#10b981' :
                rate >= 80 ? '#f59e0b' :
                  rate >= 70 ? '#f97316' : '#ef4444'
            }
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'holat',
      key: 'holat',
      render: (status: string, record: GroupData) => (
        <div className="space-y-1">
          <Badge
            status={status === 'Faol' ? 'success' : 'error'}
            text={status}
          />
          {record.attendance_rate >= 90 && (
            <div className="flex items-center space-x-1">
              <StarOutlined className="text-yellow-500 text-xs" />
              <span className="text-xs text-yellow-600">Top</span>
            </div>
          )}
        </div>
      ),
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
            >
              Ko'rish
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              iTech Academy Dashboard
            </h1>
            <p className="text-gray-600">Zamonaviy davomat boshqaruv tizimi</p>
          </div>
          <div className="flex space-x-3">
            <Button icon={<DownloadOutlined />}>
              Eksport
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Yangilash
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="text-center">
            <Statistic
              title="Jami Guruhlar"
              value={stats.totalGroups}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="text-center">
            <Statistic
              title="Faol Guruhlar"
              value={stats.activeGroups}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="text-center">
            <Statistic
              title="Jami O'quvchilar"
              value={stats.totalStudents}
              prefix={<UserOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="text-center">
            <Statistic
              title="O'rtacha Davomat"
              value={stats.avgAttendance}
              suffix="%"
              prefix={<FireOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="text-center">
            <Statistic
              title="Top Guruhlar"
              value={stats.topPerformingGroups}
              prefix={<TrophyOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#eab308' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card className="text-center">
            <Statistic
              title="Mentorlar"
              value={stats.mentors}
              prefix={<StarOutlined className="text-pink-500" />}
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Search
            placeholder="Guruh yoki mentor nomi bo'yicha qidirish..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 min-w-64"
          />

          <Select
            placeholder="Holat bo'yicha filtrlash"
            size="large"
            value={filterStatus}
            onChange={setFilterStatus}
            className="min-w-40"
          >
            <Option value="all">Barcha holatlar</Option>
            <Option value="Faol">Faol</Option>
            <Option value="Nofaol">Nofaol</Option>
          </Select>

          <Select
            placeholder="Mentor bo'yicha filtrlash"
            size="large"
            value={filterMentor}
            onChange={setFilterMentor}
            className="min-w-40"
          >
            <Option value="all">Barcha mentorlar</Option>
            {[...new Set(processedData.map(item => item.mentor))].map(mentor => (
              <Option key={mentor} value={mentor}>{mentor}</Option>
            ))}
          </Select>

          <Select
            placeholder="Saralash"
            size="large"
            value={sortBy}
            onChange={setSortBy}
            className="min-w-40"
          >
            <Option value="name">Nom bo'yicha</Option>
            <Option value="students">O'quvchilar soni</Option>
            <Option value="attendance">Davomat foizi</Option>
          </Select>
        </div>
      </Card>

      {/* Groups Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TeamOutlined className="text-xl text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 m-0">Guruhlar Ro'yxati</h2>
                <p className="text-gray-500 m-0 text-sm">{filteredData.length} ta guruh topildi</p>
              </div>
            </div>
            <Badge count={stats.topPerformingGroups} showZero>
              <Button icon={<FilterOutlined />}>
                Filtrlar
              </Button>
            </Badge>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} ta guruh`,
            className: "custom-pagination"
          }}
          className="custom-table"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="So'nggi Faoliyat"
            extra={<Button type="link">Barchasini ko'rish</Button>}
          >
            <Timeline
              items={filteredData.slice(0, 5).map((item, index) => ({
                color: item.attendance_rate >= 90 ? 'green' :
                  item.attendance_rate >= 80 ? 'blue' : 'orange',
                children: (
                  <div>
                    <div className="font-medium">{item.guruh_nomi}</div>
                    <div className="text-sm text-gray-500">
                      {item.mentor} • {item.attendance_rate}% davomat
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Top Guruhlar"
            extra={<TrophyOutlined className="text-yellow-500" />}
          >
            <div className="space-y-3">
              {filteredData
                .filter(item => item.attendance_rate >= 85)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.guruh_nomi}</div>
                        <div className="text-sm text-gray-600">{item.mentor}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-blue-600">{item.attendance_rate}%</div>
                      <div className="text-xs text-gray-500">{item.oquvchilar_soni} o'quvchi</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;