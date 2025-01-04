
import { Table } from 'antd';
import useGoogleSheet from '../hook/useGoogleSheet';
import { useLocation, useParams } from 'react-router-dom';

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const SheetDetail = () => {

    const botToken = import.meta.env.VITE_BOT_TOKEN;
    const chatId = import.meta.env.VITE_CHAT_ID;

    const { id } = useParams();
    const location = useLocation();
    const dataInfo = location.state;


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


    const sendTelegramMessage = async (message: string) => {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        try {
            await axios.post(url, {
                chat_id: chatId,
                text: message,
            });
            console.log("Message sent successfully!");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
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


        sendTelegramMessage(message);
    };

    if (loading) {
        return <div>Loading...</div>;
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
