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
  Badge,
  Modal,
  Input,
  Select
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
  StarOutlined,
  DownloadOutlined,
  SearchOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import useGoogleSheet from '../hook/useGoogleSheet';
import { sendTelegramMessage } from '../services/telegramService';
import GroupInfoCard from './GroupInfoCard';
import * as XLSX from 'xlsx';

const SheetDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dataInfo = location.state;
  const [sending, setSending] = useState(false);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { header, body, loading, error } = useGoogleSheet(id as string);

  // --- Yangi format uchun yordamchi funksiyalar ---
  // header: 1-qatordagi sarlavhalar, body: barcha qatorlar (shu jumladan 2-qatordagi sub-headerlar va o'quvchilar)

  // 1-qatordagi sarlavhalar (header)
  // 2-qatordagi sub-headerlar (body[0])
  // 3-qatordan boshlab o'quvchilar (body.slice(1))

  // Sana ustunlari uchun indexlarni topamiz (faqat o'tgan va bugungi sanalar)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateColumnIndexes: number[] = [];
  if (header && header.length > 0) {
    header.forEach((item: string, idx: number) => {
      if (/\d{2}\/\d{2}\/\d{4}/.test(item)) {
        const [d, m, y] = item.split('/');
        // Sana formatini to'g'ri o'qish uchun (YYYY-MM-DD)
        const columnDate = new Date(`${y}-${m}-${d}`);
        columnDate.setHours(0, 0, 0, 0);

        if (columnDate <= today) {
          dateColumnIndexes.push(idx);
        }
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

  // Telegramga yuborish uchun tanlangan sananing davomatini chiqarish
  const extractAttendanceByDate = (dateIdx: number) => {
    if (dateIdx === -1) return [];
    return dataSource.map((row: any) => ({
      fio: row.fio,
      status: row[`davomat_${dateIdx}`],
    }));
  };

  const getDateByIdx = (dateIdx: number) => {
    if (dateIdx === -1) return '';
    return header[dateIdx];
  };

  const sendAttendanceUpdate = async () => {
    setSending(true);
    // Tanlangan sana bo'yicha index, agar yo'q bo'lsa oxirgi sana
    const dateIdx = selectedDateIdx !== null ? selectedDateIdx : lastDateIdx;
    const attendanceData = extractAttendanceByDate(dateIdx);
    let message = `📅 Davomat: ${getDateByIdx(dateIdx)}:\n\n`;

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

  // Sana bo'yicha filtr uchun
  const filteredDateIdx = selectedDateIdx !== null ? selectedDateIdx : (dateColumnIndexes.length > 0 ? dateColumnIndexes[dateColumnIndexes.length - 1] : -1);
  const filteredDate = filteredDateIdx !== -1 ? header[filteredDateIdx] : '';

  // Qidiruv uchun filtrlangan dataSource
  const filteredDataSource = dataSource.filter(row => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      (row.fio && row.fio.toLowerCase().includes(search)) ||
      (row.id && row.id.toLowerCase().includes(search))
    );
  });

  // Sana bo'yicha statistikalar
  const presentCountFiltered = filteredDateIdx !== -1 ? filteredDataSource.filter(row => row[`davomat_${filteredDateIdx}`] === '100%').length : 0;
  const absentCountFiltered = filteredDateIdx !== -1 ? filteredDataSource.filter(row => row[`davomat_${filteredDateIdx}`] === '0%').length : 0;
  const attendanceRateFiltered = filteredDataSource.length > 0 ? Math.round((presentCountFiltered / filteredDataSource.length) * 100) : 0;
  // O'rtacha o'zlashtirish (faqat tanlangan sana uchun)
  let avgMasteryFiltered = 0;
  if (filteredDateIdx !== -1 && filteredDataSource.length > 0) {
    let sum = 0, count = 0;
    filteredDataSource.forEach(row => {
      const mastery = row[`davomat_${filteredDateIdx + 1}`];
      if (mastery && mastery.endsWith('%')) {
        sum += parseInt(mastery);
        count++;
      }
    });
    avgMasteryFiltered = count > 0 ? Math.round(sum / count) : 0;
  }

  // Excel yuklab olish
  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredDataSource.map(row => {
      const obj: any = {
        'T/R': row.tr,
        'ID': row.id,
        'F.I.O': row.fio,
        "Umumiy davomat (%)": row.davomat,
        "Umumiy o'zlashtirish (%)": row.ozlashtirish,
      };
      dateColumnIndexes.forEach(idx => {
        obj[header[idx]] = row[`davomat_${idx}`];
        obj[header[idx] + ' o\'zlashtirish'] = row[`davomat_${idx + 1}`];
        obj[header[idx] + ' izoh'] = row[`davomat_${idx + 2}`];
      });
      return obj;
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Davomat');
    XLSX.writeFile(wb, 'davomat.xlsx');
  };

  // O'quvchi tafsilotlari modalini ochish
  const handleRowClick = (record: any) => {
    setSelectedStudent(record);
    setModalVisible(true);
  };

  // Dars kunlari bo'yicha statistikalar (har bir dars kuni uchun sana va hafta kuni)
  const weekDays = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const lessonDays = dateColumnIndexes.map(dateIdx => {
    const dateStr = header[dateIdx];
    const [d, m, y] = dateStr.split('/');
    const dateObj = new Date(`${y}-${m}-${d}`);
    const weekDay = weekDays[dateObj.getDay()];
    // Shu sanada barcha o'quvchilar uchun davomat foizi
    let present = 0, total = 0;
    dataSource.forEach(row => {
      const att = row[`davomat_${dateIdx}`];
      if (att && att.endsWith('%')) {
        total++;
        if (att === '100%') present++;
      }
    });
    return {
      date: dateStr,
      weekDay,
      percent: total > 0 ? Math.round((present / total) * 100) : 0
    };
  });

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
            className="border-none shadow-none bg-gray-100 hover:bg-gray-200"
          >
            Orqaga
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dataInfo?.guruh_nomi}
            </h1>
            <p className="text-gray-500 text-base">Batafsil davomat ma'lumotlari</p>
          </div>
        </div>
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
            <Progress percent={avgAttendance} strokeColor="#10b981" showInfo={false} className="mt-2" />
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
            <Progress percent={avgMastery} strokeColor="#f59e0b" showInfo={false} className="mt-2" />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center">
            <Statistic
              title={`Tanlangan sana: ${filteredDate || '—'}`}
              value={attendanceRateFiltered + '%'}
              prefix={<BarChartOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
            <Progress percent={attendanceRateFiltered} strokeColor="#3b82f6" showInfo={false} className="mt-2" />
          </Card>
        </Col>
      </Row>

      {/* Haftalik davomat statistikasi */}
      <Card className="mb-4" title="Dars kunlari va davomat" extra={<BarChartOutlined className="text-blue-500" />}>
        <div className="flex flex-wrap gap-4">
          {lessonDays.map(lday => (
            <div key={lday.date} className="flex flex-col items-center w-40 p-2 border rounded bg-white">
              <span className="font-medium text-gray-700">{lday.date}</span>
              <span className="text-xs text-gray-500 mb-1">{lday.weekDay}</span>
              <Progress percent={lday.percent} strokeColor="#3b82f6" showInfo={true} />
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance Table */}
      <Card
        title={
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarOutlined className="text-xl text-blue-500" />
                <div>
                  <span className="text-lg font-semibold text-gray-800">
                    Davomat jadvali
                  </span>
                  <div className="text-sm text-gray-500">
                    {filteredDate} - {filteredDataSource.length} o'quvchi
                  </div>
                </div>
              </div>
              <Space>
                <Badge
                  count={presentCountFiltered}
                  style={{ backgroundColor: '#10b981' }}
                  title="Kelganlar soni"
                />
                <Badge
                  count={absentCountFiltered}
                  style={{ backgroundColor: '#ef4444' }}
                  title="Kelmaganlar soni"
                />
                <Tag
                  color={attendanceRateFiltered >= 80 ? 'green' : attendanceRateFiltered >= 70 ? 'orange' : 'red'}
                >
                  {attendanceRateFiltered}% davomat
                </Tag>
              </Space>
            </div>
            <div className="flex flex-wrap gap-2 items-center mt-2">
              <Input
                placeholder="Ism yoki ID bo'yicha qidirish"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select
                placeholder="Sana tanlang"
                style={{ width: 180 }}
                allowClear
                value={selectedDateIdx}
                onChange={v => setSelectedDateIdx(v)}
                options={dateColumnIndexes.map(idx => ({ label: header[idx], value: idx }))}
              />
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadExcel}
                size="middle"
              >
                Excel
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendAttendanceUpdate}
                loading={sending}
                size="middle"
              >
                Telegramga yuborish
              </Button>
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredDataSource}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="custom-attendance-table"
          rowClassName={(_record, _index) => {
            if (filteredDateIdx === -1) return '';
            const status = _record[`davomat_${filteredDateIdx}`] ?? '';
            return status === '100%' ? 'bg-green-50' :
              status === '0%' ? 'bg-red-50' : '';
          }}
          onRow={record => ({
            onClick: () => handleRowClick(record)
          })}
        />
      </Card>

      {/* O'quvchi tafsilotlari modal */}
      <Modal
        open={modalVisible}
        title={selectedStudent ? selectedStudent.fio : ''}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedStudent && (
          <div className="space-y-2">
            <div><b>ID:</b> {selectedStudent.id}</div>
            <div><b>Umumiy davomat:</b> {selectedStudent.davomat}</div>
            <div><b>Umumiy o'zlashtirish:</b> {selectedStudent.ozlashtirish}</div>
            <div className="mt-4">
              <b>Barcha darslar bo'yicha:</b>
              <Table
                size="small"
                columns={[
                  ...dateColumnIndexes.map(idx => ({
                    title: header[idx],
                    dataIndex: `davomat_${idx}`,
                    key: `davomat_${idx}`,
                    render: (value: any, _record: any, _index: number) => {
                      if (value === '100%') return <CheckCircleOutlined className="text-green-500" />;
                      if (value === '0%') return <CloseCircleOutlined className="text-red-500" />;
                      return value;
                    }
                  })),
                  {
                    title: "O'zlashtirish",
                    dataIndex: 'mastery',
                    key: 'mastery',
                    render: (value: any, record: any, _index: number) => record.mastery
                  },
                  {
                    title: 'Izoh',
                    dataIndex: 'izoh',
                    key: 'izoh',
                    render: (value: any, record: any, _index: number) => record.izoh
                  }
                ]}
                dataSource={dateColumnIndexes.map(idx => ({
                  key: idx,
                  [`davomat_${idx}`]: selectedStudent[`davomat_${idx}`],
                  mastery: selectedStudent[`davomat_${idx + 1}`],
                  izoh: selectedStudent[`davomat_${idx + 2}`]
                }))}
                pagination={false}
              />
            </div>
          </div>
        )}
      </Modal>

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
                <span className="font-bold text-green-600">{attendanceRateFiltered >= 90 ? 'A\'lo' : attendanceRateFiltered >= 80 ? 'Yaxshi' : 'Yaxshilanishi kerak'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Jami darslar</span>
                <span className="font-bold text-blue-600">{dateColumnIndexes.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Faol o'quvchilar</span>
                <span className="font-bold text-purple-600">{presentCountFiltered}/{filteredDataSource.length}</span>
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
                  color: attendanceRateFiltered >= 90 ? 'green' : 'blue',
                  children: attendanceRateFiltered >= 90 ?
                    'Ajoyib! Davomat juda yaxshi darajada' :
                    'Davomatni yaxshilash uchun qo\'shimcha choralar ko\'ring'
                },
                {
                  color: absentCountFiltered === 0 ? 'green' : 'orange',
                  children: absentCountFiltered === 0 ?
                    'Barcha o\'quvchilar darsda qatnashgan' :
                    `${absentCountFiltered} ta o\'quvchi bilan individual ishlash tavsiya etiladi`
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