import React from 'react';
import { Avatar } from 'antd';

interface GroupInfoCardProps {
    icon: React.ReactNode;
    title: string;
    value: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
}

const GroupInfoCard: React.FC<GroupInfoCardProps> = ({ icon, title, value, gradientFrom, gradientTo }) => (
    <div className={`flex items-center space-x-4 p-4 rounded-lg`} style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}>
            {icon}
        </div>
        <div>
            <div className="text-sm text-gray-500 font-medium">{title}</div>
            <div className="font-bold text-lg text-gray-800">{value}</div>
        </div>
    </div>
);

export default GroupInfoCard; 