import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Statistic,
  Row,
  Col,
  Tag,
  Spin,
  Alert,
  Progress,
  Avatar,
  Tooltip,
  Space,
  Timeline,
  Badge
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  FireOutlined,
  TeamOutlined,
  WarningOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import useGoogleSheet from '../hook/useGoogleSheet';
import { sendTelegramMessage } from '../services/telegramService';
import GroupInfoCard from './GroupInfoCard';

// Define AttendanceRow type
interface AttendanceRow {
  fio: string;
  status: string;
}

const SheetDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dataInfo = location.state;
  const [sending, setSending] = useState(false);

  const { header, body, loading, error } = useGoogleSheet(id as string);

  const getLatestDate = () => {
    const dates: string[] = [];
    header.forEach((row: string) => {
      if (typeof row === 'string' && /\d{2}\.\d{2}\.\d{4}/.test(row)) {
        dates.push(row);
      }
    });
    return dates.at(-1);
  };

  const extractDataByDate = (): AttendanceRow[] => {
    const dateIndex = header.indexOf(getLatestDate() ?? '');
    if (dateIndex === -1) return [];
    return body.map((row) => ({
      fio: row[1],
      status: row[dateIndex],
    }));
  };

  const sendAttendanceUpdate = async () => {
    setSending(true);
    const attendanceData = extractDataByDate();
    let message = `📅 Davomat: ${getLatestDate()}:\n\n`;

    message += `Assalomu alekum hurmatli ota-onalar! Bugungi guruhimiz o'quvchilaring davomati bilan tanishib chiqishingizni iltimos qilib qolar edik!\n\n`;
    message += `👥 Guruh: ${dataInfo.guruh_nomi}\n`;
    message += `🕔 Dars boshlanish vaqti: ${dataInfo.dars_boshlanish_vaqti}\n`;
    message += `🕧 Dars tugash vaqti: ${dataInfo.dars_tugash_vaqti}\n`;
    message += `👨‍🏫 Mentor: ${dataInfo.mentor}\n\n`;

    attendanceData.forEach((entry, index) => {
      message += `${index + 1}. ${entry.fio} ${entry.status === 'Keldi' ? '✅' : '❌'}\n`;
    });

    try {
      await sendTelegramMessage({ text: message });
    } finally {
      setSending(false);
    }
  };

  // Auto-send functionality
  useEffect(() => {
    const shouldRunOnDay = (dayType: string) => {
      const today = new Date();
      const day = today.getDay();
      return (day % 2 === 0 && dayType === "Juft") || (day % 2 !== 0 && dayType === "Toq");
    };

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      if (hour === 10 && minute === 0 && shouldRunOnDay(dataInfo?.dars_kunlari)) {
        sendAttendanceUpdate();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [dataInfo, sendAttendanceUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 text-lg">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Xatolik yuz berdi"
          description={error}
          type="error"
          showIcon
          className="shadow-lg"
        />
      </div>
    );
  }

  const attendanceData = extractDataByDate();
  const presentCount = attendanceData.filter(item => item.status === 'Keldi').length;
  const absentCount = attendanceData.filter(item => item.status === 'Kelmadi').length;
  const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

  // Enhanced columns with better styling
  const columns = header.map((headerItem, index) => ({
    title: (
      <div className="text-center font-semibold">
        {headerItem}
      </div>
    ),
    dataIndex: `col_${index}`,
    key: `col_${index}`,
    align: 'center' as const,
    render: (value: any, record: any, rowIndex: number) => {
      if (index === 0) {
        return (
          <div className="flex items-center space-x-2">
            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
              {rowIndex + 1}
            </Avatar>
            <span className="font-medium">{value}</span>
          </div>
        );
      }

      if (value === 'Keldi') {
        return (
          <Tooltip title="Darsga kelgan">
            <CheckCircleOutlined className="text-3xl text-green-500 hover:scale-110 transition-transform" />
          </Tooltip>
        );
      } else if (value === 'Kelmadi') {
        return (
          <Tooltip title="Darsga kelmagan">
            <CloseCircleOutlined className="text-3xl text-red-500 hover:scale-110 transition-transform" />
          </Tooltip>
        );
      }
      return <span className="font-medium">{value}</span>;
    },
  }));

  const dataSource = body.map((row, index) => {
    const rowData: any = { key: index };
    row.forEach((cell, cellIndex) => {
      rowData[`col_${cellIndex}`] = cell;
    });
    return rowData;
  });

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            size="large"
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Orqaga
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {dataInfo?.guruh_nomi}
            </h1>
            <p className="text-gray-600 text-lg">Batafsil davomat ma'lumotlari</p>
          </div>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendAttendanceUpdate}
            loading={sending}
            size="large"
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-none shadow-lg hover:shadow-xl transition-all"
          >
            Telegramga yuborish
          </Button>
        </Space>
      </div>

      {/* Enhanced Group Info Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-blue-50">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <GroupInfoCard
              icon={<UserOutlined className="text-white text-xl" />}
              title="Mentor"
              value={dataInfo?.mentor}
              gradientFrom="#3b82f6"
              gradientTo="#2563eb"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <GroupInfoCard
              icon={<CalendarOutlined className="text-white text-xl" />}
              title="Dars kunlari"
              value={dataInfo?.dars_kunlari}
              gradientFrom="#22c55e"
              gradientTo="#16a34a"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <GroupInfoCard
              icon={<ClockCircleOutlined className="text-white text-xl" />}
              title="Dars vaqti"
              value={`${dataInfo?.dars_boshlanish_vaqti} - ${dataInfo?.dars_tugash_vaqti}`}
              gradientFrom="#f59e42"
              gradientTo="#ea580c"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <GroupInfoCard
              icon={<TeamOutlined className="text-white text-xl" />}
              title="O'quvchilar"
              value={attendanceData.length}
              gradientFrom="#a21caf"
              gradientTo="#7c3aed"
            />
          </Col>
        </Row>
      </Card>

      {/* Enhanced Statistics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <Statistic
              title={<span className="text-green-600 font-semibold text-lg">Kelganlar</span>}
              value={presentCount}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
            />
            <Progress
              percent={Math.round((presentCount / attendanceData.length) * 100)}
              strokeColor="#52c41a"
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
            <Statistic
              title={<span className="text-red-600 font-semibold text-lg">Kelmaganlar</span>}
              value={absentCount}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f', fontSize: '32px', fontWeight: 'bold' }}
            />
            <Progress
              percent={Math.round((absentCount / attendanceData.length) * 100)}
              strokeColor="#ff4d4f"
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 font-semibold text-lg">Davomat foizi</span>
              {attendanceRate >= 90 && <TrophyOutlined className="text-yellow-500 text-xl" />}
              {attendanceRate >= 80 && attendanceRate < 90 && <StarOutlined className="text-blue-500 text-xl" />}
              {attendanceRate < 70 && <WarningOutlined className="text-red-500 text-xl" />}
            </div>
            <div className="text-4xl font-bold mb-2" style={{
              color: attendanceRate >= 90 ? '#52c41a' :
                attendanceRate >= 80 ? '#1890ff' :
                  attendanceRate >= 70 ? '#faad14' : '#ff4d4f'
            }}>
              {attendanceRate}%
            </div>
            <Progress
              percent={attendanceRate}
              strokeColor={
                attendanceRate >= 90 ? '#52c41a' :
                  attendanceRate >= 80 ? '#1890ff' :
                    attendanceRate >= 70 ? '#faad14' : '#ff4d4f'
              }
              showInfo={false}
            />
            <div className="mt-2 text-sm text-gray-600">
              {attendanceRate >= 90 ? 'A\'lo davomat!' :
                attendanceRate >= 80 ? 'Yaxshi davomat' :
                  attendanceRate >= 70 ? 'O\'rtacha davomat' : 'Davomat yaxshilanishi kerak'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Attendance Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CalendarOutlined className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-800">
                  Davomat jadvali
                </span>
                <div className="text-sm text-gray-500">
                  {getLatestDate()} - {attendanceData.length} o'quvchi
                </div>
              </div>
            </div>
            <Space>
              <Badge
                count={presentCount}
                style={{ backgroundColor: '#52c41a' }}
                title="Kelganlar soni"
              />
              <Badge
                count={absentCount}
                style={{ backgroundColor: '#ff4d4f' }}
                title="Kelmaganlar soni"
              />
              <Tag
                color={attendanceRate >= 80 ? 'green' : attendanceRate >= 70 ? 'orange' : 'red'}
                className="text-lg px-3 py-1"
              >
                {attendanceRate}% davomat
              </Tag>
            </Space>
          </div>
        }
        className="shadow-xl border-0"
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="custom-attendance-table"
          rowClassName={(record, index) => {
            const status = record[`col_${header.indexOf(getLatestDate())}`];
            return status === 'Keldi' ? 'bg-green-50 hover:bg-green-100' :
              status === 'Kelmadi' ? 'bg-red-50 hover:bg-red-100' : '';
          }}
        />
      </Card>

      {/* Additional Analytics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="Davomat Tahlili"
            className="shadow-lg border-0"
            extra={<FireOutlined className="text-orange-500" />}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <span className="font-medium">Eng yaxshi ko'rsatkich</span>
                <span className="font-bold text-green-600">{attendanceRate >= 90 ? 'A\'lo' : attendanceRate >= 80 ? 'Yaxshi' : 'Yaxshilanishi kerak'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <span className="font-medium">Jami darslar</span>
                <span className="font-bold text-blue-600">{header.filter(h => /\d{2}\.\d{2}\.\d{4}/.test(h)).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <span className="font-medium">Faol o'quvchilar</span>
                <span className="font-bold text-purple-600">{presentCount}/{attendanceData.length}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Tavsiyalar"
            className="shadow-lg border-0"
            extra={<StarOutlined className="text-yellow-500" />}
          >
            <Timeline
              items={[
                {
                  color: attendanceRate >= 90 ? 'green' : 'blue',
                  children: attendanceRate >= 90 ?
                    'Ajoyib! Davomat juda yaxshi darajada' :
                    'Davomatni yaxshilash uchun qo\'shimcha choralar ko\'ring'
                },
                {
                  color: absentCount === 0 ? 'green' : 'orange',
                  children: absentCount === 0 ?
                    'Barcha o\'quvchilar darsda qatnashgan' :
                    `${absentCount} ta o\'quvchi bilan individual ishlash tavsiya etiladi`
                },
                {
                  color: 'blue',
                  children: 'Ota-onalar bilan muntazam aloqa o\'rnatish muhim'
                },
                {
                  color: 'purple',
                  children: 'Davomat statistikasini haftalik tahlil qiling'
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SheetDetail;