import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Mail, Users, Clock, PlusCircle, Trash2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, expiring: 0, expired: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
          const token = localStorage.getItem("auth_token") || "secure_session_active";
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/all-subscriptions`, {
            headers: { Authorization: token }
        });
            const combinedData = [...(response.data.single || []), ...(response.data.family || [])];
            setSubscriptions(combinedData);
            calculateStats(combinedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getStatusInfo = (sub) => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const startDate = new Date(`${sub.startDate}T${sub.startTime || '00:00'}`);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (parseInt(sub.durationDays) || 0));

        if (endDate < today) return { label: 'Expired', color: 'text-red-600 bg-red-50 border-red-100', icon: <XCircle size={14}/> };
        if (endDate <= nextWeek) return { label: 'Expiring Soon', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: <AlertCircle size={14}/> };
        return { label: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <CheckCircle2 size={14}/> };
    };

    const calculateStats = (data) => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        let active = 0, expiring = 0, expired = 0;

        data.forEach(sub => {
            const startDate = new Date(`${sub.startDate}T${sub.startTime || '00:00'}`);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (parseInt(sub.durationDays) || 0));

            if (endDate < today) expired++;
            else {
                active++;
                if (endDate <= nextWeek) expiring++;
            }
        });

        setStats({ total: data.length, active, expiring, expired });
    };

    const handleDelete = async (id, type) => {
        if(window.confirm("Are you sure you want to delete this subscription?")) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/delete-sub/${id}?type=${type}`);
                const updatedList = subscriptions.filter(sub => String(sub._id) !== String(id));
                setSubscriptions(updatedList);
                calculateStats(updatedList);
            } catch (error) {
                alert("Delete failed!");
            }
        }
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Subscription Hub</h1>
                    <p className="text-slate-500 mt-1">Manage and track your service renewals efficiently.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 font-medium">
                    <PlusCircle size={20}/> New Subscription
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total" value={stats.total} icon={<LayoutDashboard size={22}/>} color="blue" />
                <StatCard title="Active" value={stats.active} icon={<CheckCircle2 size={22}/>} color="emerald" />
                <StatCard title="Expiring Soon" value={stats.expiring} icon={<AlertCircle size={22}/>} color="orange" />
                <StatCard title="Expired" value={stats.expired} icon={<XCircle size={22}/>} color="red" />
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Subscription Details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-sm uppercase tracking-wider">
                                <th className="px-8 py-4 font-semibold text-xs text-center">Category</th>
                                <th className="px-6 py-4 font-semibold text-xs">Email / Manager</th>
                                <th className="px-6 py-4 font-semibold text-xs">Start Date</th>
                                <th className="px-6 py-4 font-semibold text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-xs text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subscriptions.map((sub) => {
                                const status = getStatusInfo(sub);
                                return (
                                    <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter border ${sub.managerEmail ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {sub.managerEmail ? 'Family' : 'Single'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    <Mail size={16}/>
                                                </div>
                                                <span className="font-medium text-slate-700">{sub.email || sub.managerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{sub.startDate}</td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(sub._id, sub.managerEmail ? 'family' : 'single')}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {subscriptions.length === 0 && (
                        <div className="p-20 text-center text-slate-400">
                            No subscriptions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component for Stats to keep it clean
const StatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: "text-blue-600 bg-blue-50",
        emerald: "text-emerald-600 bg-emerald-50",
        orange: "text-orange-600 bg-orange-50",
        red: "text-red-600 bg-red-50"
    };
    
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
        </div>
    );
};

export default Dashboard;
