import React from 'react';
import { Table, Spin } from 'antd'; // Ant Design Table va Spin komponentlarini import qilish
import useGoogleSheet from '../hook/useGoogleSheet';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID!;

const TableComponent: React.FC = () => {
    const navigate = useNavigate();

    // useGoogleSheet hook'ini chaqirish
    const { header, body, loading, error } = useGoogleSheet(SPREADSHEET_ID);

    const handleNavigate = (data: any) => {
        navigate(`/sheet-id/${data.sheet_id}`, { state: data });
    };

    // Agar loading holati bo'lsa, loading indikatorini ko'rsatamiz
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

    // Ant Design Table uchun ustunlar tuzish
    const columns = header.map((headerItem) => ({
        title: headerItem,
        dataIndex: headerItem.toLowerCase().replace(/\s+/g, '_'),
        key: headerItem.toLowerCase().replace(/\s+/g, '_'),
    }));

    // Actions
    const additionalColumn = {
        title: `Ko'rish`,
        key: 'actions',
        render: (record: any) => (
            <div className="flex justify-center">
                <EyeOutlined
                    style={{ fontSize: '20px', color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => handleNavigate(record)}
                />
            </div>
        ),
    };

    const extendedColumns = [...columns, additionalColumn];

    const dataSource = body.map((row, index) => {
        const rowData: any = {};
        row.forEach((cell, cellIndex) => {
            const headerKey = header[cellIndex].toLowerCase().replace(/\s+/g, '_');
            rowData[headerKey] = cell;
        });
        return {
            key: index,
            ...rowData,
        };
    });

    return (
        <div className="container overflow-x-scroll py-20 table-container">
            <Table
                columns={extendedColumns}
                dataSource={dataSource}
                loading={loading}
                pagination={false}
                bordered
                title={() => <h2 className="text-center text-2xl font-medium">iTech Academy</h2>}
                className="min-w-max"
            />
        </div>
    );
};

export default TableComponent;
