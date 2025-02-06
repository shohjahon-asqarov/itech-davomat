
import { Spin, Table } from 'antd';
import useGoogleSheet from '../hook/useGoogleSheet';
import { useLocation, useParams } from 'react-router-dom';

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { sendTelegramMessage } from '../services/telegramService';

const SheetDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const dataInfo = location.state;
    console.log(dataInfo);


    const { header, body, loading, error } = useGoogleSheet(id as string);

    const getLatestDate: () => any = () => {
        const dates: string[] = [];
        header.forEach((row: any) => {
            if (typeof row === 'string' && /\d{2}\.\d{2}\.\d{4}/.test(row)) {
                dates.push(row);
            }
        });

        return dates.at(-1);
    }

    const extractDataByDate = () => {

        const dateIndex = header.indexOf(getLatestDate());

        if (dateIndex === -1) return [];

        const result = body.map((row) => {
            return {
                fio: row[1],
                status: row[dateIndex],
            };
        });

        return result;
    };

    const sendAttendanceUpdate = () => {
        const attendanceData = extractDataByDate();
        let message = `📅 Davomat: ${getLatestDate()}:\n\n`;

        message += `Assalomu alekum hurmatli ota-onalar!  Bugungi guruhimiz o'quvchilaring davomati bilan tanishib chiqishingizni iltimos qilib qolar edik! \n\n`

        message += `👥 Guruh: ${dataInfo.guruh_nomi}\n`;
        message += `🕔 Dars boshlanish vaqti: ${dataInfo.dars_boshlanish_vaqti}\n`;
        message += `🕧 Dars tugash vaqti: ${dataInfo.dars_tugash_vaqti}\n`;
        message += `👨‍🏫Mentor: ${dataInfo.mentor}\n\n`;

        attendanceData.forEach((entry, index) => {
            message += `${index + 1}. ${entry.fio} ${entry.status == 'Keldi' ? '✅' : '❌'} \n`;
        });

        sendTelegramMessage({ text: message });

    };

    if (loading) {
        return (
            <div className="loader-container">
                <Spin size="large" />
                <p className="loading-text">Ma'lumotlar yuklanmoqda...</p>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    const columns = header.map((headerItem) => ({
        title: headerItem,
        dataIndex: headerItem.toLowerCase().replace(/\s+/g, '_'),
        key: headerItem.toLowerCase().replace(/\s+/g, '_'),
    }));

    const dataSource = body.map((row, index) => {
        const rowData: any = {};
        row.forEach((cell, cellIndex) => {
            const headerKey = header[cellIndex].toLowerCase().replace(/\s+/g, '_');
            if (cell == 'Keldi') {
                rowData[headerKey] = <CheckCircleOutlined style={{ fontSize: '20px', color: 'green' }} />;
            } else if (cell == 'Kelmadi') {
                rowData[headerKey] = <CloseCircleOutlined style={{ fontSize: '20px', color: 'red' }} />;
            } else {
                rowData[headerKey] = cell;
            }
        });
        return {
            key: index,
            ...rowData,
        };
    });



    // Automatic sending
    function shouldRunOnDay(dayType: string) {
        const today = new Date();
        const day = today.getDay();
        return (day % 2 === 0 && dayType === "Juft") || (day % 2 !== 0 && dayType === "Toq");
    }

    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour === 10 && minute === 0 && shouldRunOnDay(dataInfo.dars_kunlari)) {
            sendAttendanceUpdate();
        }
    }, 60 * 1000);


    return (
        <div className='container overflow-x-scroll pt-20'>
            <Table
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                pagination={false}
                bordered
                title={() => <h2 className='text-center text-2xl font-medium'>iTech Academy </h2>}
                className='min-w-max'

                footer={() => {
                    return (
                        <div className='text-end text-gray-600'>
                            <button onClick={sendAttendanceUpdate} className='bg-blue-500 text-white py-2 px-4 rounded'>
                                Telegramga yuborish: {getLatestDate()}
                            </button>
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default SheetDetail;
