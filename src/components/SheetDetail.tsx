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

const SheetDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dataInfo = location.state;
  const [sending, setSending] = useState(false);

  const { header, body, loading, error } = useGoogleSheet(id as string);

  // --- Yangi format uchun yordamchi funksiyalar ---
  // header: 1-qatordagi sarlavhalar, body: barcha qatorlar (shu jumladan 2-qatordagi sub-headerlar va o'quvchilar)

  // 1-qatordagi sarlavhalar (header)
  // 2-qatordagi sub-headerlar (body[0])
  // 3-qatordan boshlab o'quvchilar (body.slice(1))

  // Sana ustunlari uchun indexlarni topamiz
  const dateColumnIndexes: number[] = [];
  if (header && header.length > 0) {
    header.forEach((item: string, idx: number) => {
      if (/\d{2}\/\d{2}\/\d{4}/.test(item)) {
        dateColumnIndexes.push(idx);
      }
    });
  }

  // Jadval ustunlarini yasash
  const columns = [
    { title: 'T/R', dataIndex: 'tr', key: 'tr', align: 'center' as const },
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' as const },
    { title: 'F.I.O', dataIndex: 'fio', key: 'fio', align: 'center' as const },
    { title: "Umumiy davomat (%)", dataIndex: 'davomat', key: 'davomat', align: 'center' as const },
    { title: "Umumiy o'zlashtirish (%)", dataIndex: 'ozlashtirish', key: 'ozlashtirish', align: 'center' as const },
    ...dateColumnIndexes.map((dateIdx) => ({
      title: (
        <div className="text-center font-semibold">
          {header[dateIdx]}
        </div>
      ),
      dataIndex: `davomat_${dateIdx}`,
      key: `davomat_${dateIdx}`,
      align: 'center' as const,
      render: (value: any) => {
        if (value === '100%') {
          return (
            <Tooltip title="Darsga kelgan">
              <CheckCircleOutlined className="text-2xl text-green-500" />
            </Tooltip>
          );
        } else if (value === '0%') {
          return (
            <Tooltip title="Darsga kelmagan">
              <CloseCircleOutlined className="text-2xl text-red-500" />
            </Tooltip>
          );
        }
        return <span className="font-medium">{value}</span>;
      }
    }))
  ];

  // DataSource yasash
  const dataSource = body && body.length > 1 ? body.slice(1).map((row: string[], idx: number) => {
    const data: any = {
      key: idx,
      tr: row[0],
      id: row[1],
      fio: row[2],
      davomat: row[3],
      ozlashtirish: row[4],
    };
    dateColumnIndexes.forEach((dateIdx) => {
      data[`davomat_${dateIdx}`] = row[dateIdx];
    });
    return data;
  }) : [];

  // Eng so'nggi sananing indexini topamiz
  const lastDateIdx = dateColumnIndexes.length > 0 ? dateColumnIndexes[dateColumnIndexes.length - 1] : -1;

  // Har bir o'quvchi uchun eng so'nggi sananing "Davomat (%)" ustunini tekshiramiz
  const presentCount = lastDateIdx !== -1 ? dataSource.filter(row => row[`davomat_${lastDateIdx}`] === '100%').length : 0;
  const absentCount = lastDateIdx !== -1 ? dataSource.filter(row => row[`davomat_${lastDateIdx}`] === '0%').length : 0;
  const attendanceRate = dataSource.length > 0 ? Math.round((presentCount / dataSource.length) * 100) : 0;

  // Telegramga yuborish uchun eng so'nggi sananing davomatini chiqarish
  const extractLatestAttendance = () => {
    if (lastDateIdx === -1) return [];
    return dataSource.map((row: any) => ({
      fio: row.fio,
      status: row[`davomat_${lastDateIdx}`],
    }));
  };

  const getLatestDate = () => {
    if (lastDateIdx === -1) return '';
    return header[lastDateIdx];
  };

  const sendAttendanceUpdate = async () => {
    setSending(true);
    const attendanceData = extractLatestAttendance();
    let message = `📅 Davomat: ${getLatestDate()}:\n\n`;

    message += `Assalomu alekum hurmatli ota-onalar! Bugungi guruhimiz o'quvchilaring davomati bilan tanishib chiqishingizni iltimos qilib qolar edik!\n\n`;
    message += `👥 Guruh: ${dataInfo.guruh_nomi}\n`;
    message += `🕔 Dars boshlanish vaqti: ${dataInfo.dars_boshlanish_vaqti}\n`;
    message += `🕧 Dars tugash vaqti: ${dataInfo.dars_tugash_vaqti}\n`;
    message += `👨‍🏫 Mentor: ${dataInfo.mentor}\n\n`;

    attendanceData.forEach((entry: any, index: number) => {
      message += `${index + 1}. ${entry.fio} ${entry.status === '100%' ? '✅' : entry.status === '0%' ? '❌' : entry.status}\n`;
    });

    try {
      await sendTelegramMessage({ text: message });
    } finally {
      setSending(false);
    }
  };

  // Auto-send functionality (o'zgarmadi)
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
  }, [dataInfo]);

  // O'rtacha o'zlashtirish va o'rtacha davomatni hisoblash
  // Faqat darslar ustunlari bo'yicha (dateColumnIndexes)
  let totalAttendance = 0;
  let totalAttendanceCount = 0;
  let totalMastery = 0;
  let totalMasteryCount = 0;

  if (body && body.length > 1) {
    body.slice(1).forEach((row: string[]) => {
      dateColumnIndexes.forEach((dateIdx) => {
        // Davomat (%)
        const att = row[dateIdx];
        if (att && att.endsWith('%')) {
          totalAttendance += parseInt(att);
          totalAttendanceCount++;
        }
        // O'zlashtirish (%) - har bir sana uchun Davomatdan keyingi ustun
        const masteryIdx = dateIdx + 1;
        const mastery = row[masteryIdx];
        if (mastery && mastery.endsWith('%')) {
          totalMastery += parseInt(mastery);
          totalMasteryCount++;
        }
      });
    });
  }

  const avgAttendance = totalAttendanceCount > 0 ? Math.round(totalAttendance / totalAttendanceCount) : 0;
  const avgMastery = totalMasteryCount > 0 ? Math.round(totalMastery / totalMasteryCount) : 0;
  const totalLessons = dateColumnIndexes.length;

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
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            size="large"
          >
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dataInfo?.guruh_nomi}
            </h1>
            <p className="text-gray-600">Batafsil davomat ma'lumotlari</p>
          </div>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendAttendanceUpdate}
            loading={sending}
            size="large"
          >
            Telegramga yuborish
          </Button>
        </Space>
      </div>

      {/* Group Info Card */}
      <Card>
        <Row gutter={[16, 16]}>
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
              gradientFrom="#10b981"
              gradientTo="#059669"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <GroupInfoCard
              icon={<ClockCircleOutlined className="text-white text-xl" />}
              title="Dars vaqti"
              value={`${dataInfo?.dars_boshlanish_vaqti} - ${dataInfo?.dars_tugash_vaqti}`}
              gradientFrom="#f59e0b"
              gradientTo="#d97706"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <GroupInfoCard
              icon={<TeamOutlined className="text-white text-xl" />}
              title="O'quvchilar"
              value={dataSource.length}
              gradientFrom="#8b5cf6"
              gradientTo="#7c3aed"
            />
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Jami darslar"
              value={totalLessons}
              prefix={<CalendarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="O'rtacha davomat"
              value={avgAttendance + '%'}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="O'rtacha o'zlashtirish"
              value={avgMastery + '%'}
              prefix={<StarOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Kelganlar"
              value={presentCount}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
            <Progress
              percent={dataSource.length > 0 ? Math.round((presentCount / dataSource.length) * 100) : 0}
              strokeColor="#10b981"
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title="Kelmaganlar"
              value={absentCount}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ef4444' }}
            />
            <Progress
              percent={dataSource.length > 0 ? Math.round((absentCount / dataSource.length) * 100) : 0}
              strokeColor="#ef4444"
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Davomat foizi</span>
              {attendanceRate >= 90 && <TrophyOutlined className="text-yellow-500" />}
              {attendanceRate >= 80 && attendanceRate < 90 && <StarOutlined className="text-blue-500" />}
              {attendanceRate < 70 && <WarningOutlined className="text-red-500" />}
            </div>
            <div className="text-3xl font-bold mb-2" style={{
              color: attendanceRate >= 90 ? '#10b981' :
                attendanceRate >= 80 ? '#3b82f6' :
                  attendanceRate >= 70 ? '#f59e0b' : '#ef4444'
            }}>
              {attendanceRate}%
            </div>
            <Progress
              percent={attendanceRate}
              strokeColor={
                attendanceRate >= 90 ? '#10b981' :
                  attendanceRate >= 80 ? '#3b82f6' :
                    attendanceRate >= 70 ? '#f59e0b' : '#ef4444'
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

      {/* Attendance Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarOutlined className="text-xl text-blue-500" />
              <div>
                <span className="text-lg font-semibold text-gray-800">
                  Davomat jadvali
                </span>
                <div className="text-sm text-gray-500">
                  {getLatestDate()} - {dataSource.length} o'quvchi
                </div>
              </div>
            </div>
            <Space>
              <Badge
                count={presentCount}
                style={{ backgroundColor: '#10b981' }}
                title="Kelganlar soni"
              />
              <Badge
                count={absentCount}
                style={{ backgroundColor: '#ef4444' }}
                title="Kelmaganlar soni"
              />
              <Tag
                color={attendanceRate >= 80 ? 'green' : attendanceRate >= 70 ? 'orange' : 'red'}
              >
                {attendanceRate}% davomat
              </Tag>
            </Space>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="custom-attendance-table"
          rowClassName={(_record, _index) => {
            if (lastDateIdx === -1) return '';
            const status = _record[`davomat_${lastDateIdx}`] ?? '';
            return status === '100%' ? 'bg-green-50' :
              status === '0%' ? 'bg-red-50' : '';
          }}
        />
      </Card>

      {/* Additional Analytics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Davomat Tahlili"
            extra={<FireOutlined className="text-orange-500" />}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Eng yaxshi ko'rsatkich</span>
                <span className="font-bold text-green-600">{attendanceRate >= 90 ? 'A\'lo' : attendanceRate >= 80 ? 'Yaxshi' : 'Yaxshilanishi kerak'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Jami darslar</span>
                <span className="font-bold text-blue-600">{dateColumnIndexes.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Faol o'quvchilar</span>
                <span className="font-bold text-purple-600">{presentCount}/{dataSource.length}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Tavsiyalar"
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