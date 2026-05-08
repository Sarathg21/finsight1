import React from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { 
    ListTodo, Calendar, Users2, Folder, Building2 
} from 'lucide-react';

const DepartmentDistributionCard = ({ 
    departmentData = null,
    departmentName = "Accounts Payables",
    totalSubtasks = 5,
    completedSubtasks = 0,
    submittedSubtasks = 0,
    daysLeft = 28,
    subDepts = 1,
    completionPct = 100 // This seems to be a label in the image, maybe distribution?
}) => {
    // Data for the doughnut chart
    const chartData = departmentData && departmentData.length > 0
        ? departmentData
        : [
            { name: 'Contribution', value: completionPct, fill: '#3B82F6' },
            { name: 'Others', value: Math.max(0, 100 - completionPct), fill: '#F1F5F9' },
        ];

    const COLORS = ['#3B82F6', '#F1F5F9'];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-100 text-[11px] font-bold text-slate-700 z-50">
                    <span className="mr-2">{payload[0].name}:</span>
                    <span style={{ color: payload[0].payload.fill || '#3B82F6' }}>{payload[0].value}%</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 w-full overflow-hidden">
            <h3 className="text-[16px] font-bold text-[#1E293B] mb-6">Department Distribution</h3>
            
            <div className="flex flex-col items-center gap-6 mb-8">
                {/* Top: Doughnut Chart */}
                <div className="relative w-[220px] h-[220px] flex-shrink-0 mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={100}
                                paddingAngle={departmentData?.length > 1 ? 2 : 0}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="relative flex items-center justify-center mb-1">
                            <Folder size={56} className="text-[#FFD700] fill-[#FFD700]" />
                            <Building2 size={22} className="absolute text-[#1E293B] top-[20px]" />
                        </div>
                        <div className="text-center px-6">
                            <p className="text-[12px] font-bold text-[#1E293B] leading-tight mb-0.5">
                                {departmentName}
                            </p>
                            <p className="text-[22px] font-black text-[#1E293B]">
                                {completionPct}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom: Stats Cards */}
                <div className="grid grid-cols-1 gap-2.5 w-full">
                    {/* Total Subtasks */}
                    <div className="bg-[#FAF5FF] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#7C3AED] shadow-sm shrink-0">
                            <ListTodo size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-wider mb-0.5">Total Subtasks</p>
                            <p className="text-[18px] font-black text-[#1E293B] leading-none">{totalSubtasks}</p>
                        </div>
                    </div>

                    {/* Days Left */}
                    <div className="bg-[#F0F9FF] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#0284C7] shadow-sm shrink-0">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-[#0284C7] uppercase tracking-wider mb-0.5">Days Left</p>
                            <p className="text-[18px] font-black text-[#1E293B] leading-none">{daysLeft}</p>
                        </div>
                    </div>

                    {/* Sub-Depts */}
                    <div className="bg-[#F0FDF4] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#16A34A] shadow-sm shrink-0">
                            <Users2 size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-[#16A34A] uppercase tracking-wider mb-0.5">Sub-Depts</p>
                            <p className="text-[18px] font-black text-[#1E293B] leading-none">{subDepts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Progress Bars */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
                {/* Completed */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Total Subtasks Completed</p>
                        <p className="text-[12px] font-black text-[#1E293B]">
                            {completedSubtasks} / {totalSubtasks} <span className="ml-2 text-slate-400 font-bold">{Math.round((completedSubtasks / totalSubtasks) * 100) || 0}%</span>
                        </p>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }} 
                        />
                    </div>
                </div>

                {/* Submitted */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Total Subtasks Submitted</p>
                        <p className="text-[12px] font-black text-[#1E293B]">
                            {submittedSubtasks} / {totalSubtasks} <span className="ml-2 text-slate-400 font-bold">{Math.round((submittedSubtasks / totalSubtasks) * 100) || 0}%</span>
                        </p>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${(submittedSubtasks / totalSubtasks) * 100}%` }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDistributionCard;
