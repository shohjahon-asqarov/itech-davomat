import React from 'react';

interface GroupInfoCardProps {
    icon: React.ReactNode;
    title: string;
    value: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
}

const GroupInfoCard: React.FC<GroupInfoCardProps> = ({ icon, title, value, gradientFrom, gradientTo }) => (
    <div className="flex items-center space-x-4 p-4 rounded-lg bg-white border border-gray-200">
        <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
            {icon}
        </div>
        <div>
            <div className="text-sm text-gray-500 font-medium">{title}</div>
            <div className="font-semibold text-lg text-gray-800">{value}</div>
        </div>
    </div>
);

export default GroupInfoCard;