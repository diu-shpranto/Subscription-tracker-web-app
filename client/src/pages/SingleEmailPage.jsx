import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, RefreshCcw, Mail, Plus, Trash2, Search, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import AddSubscriptionModal from '../components/AddSubscriptionModal';

const SingleEmailPage = () => {
    const [subs, setSubs] = useState([]);
    const [filteredSubs, setFilteredSubs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
const [editData, setEditData] = useState(null);
    useEffect(() => {
        fetchSubs();

        const timer = setInterval(() => {
            setSubs(prev => [...prev]);
        }, 60000);

        return () => clearInterval(timer);
    }, []);

 const fetchSubs = async () => {
    try {
        const token = localStorage.getItem("auth_token") || "secure_session_active"; 
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/all-subscriptions`, {
            headers: { Authorization: token }
        });
        setSubs(res.data.single);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
};
    // ------------------------------
    // END DATE AUTO CALCULATION
    // ------------------------------
    const getEndDate = (sub) => {
        if (sub.endDate) {
            return new Date(sub.endDate);
        }

        if (!sub.startDate || !sub.startTime) return null;

        const end = new Date(`${sub.startDate}T${sub.startTime}`);
        end.setDate(end.getDate() + parseInt(sub.durationDays || 0));
        end.setHours(end.getHours() + parseInt(sub.durationHours || 0));

        return end;
    };

    // ------------------------------
    // STATUS CHECK
    // ------------------------------
    const getStatus = (sub) => {
        const end = getEndDate(sub);
        if (!end) return "Unknown";

        const now = new Date();
        const diff = end - now;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        if (diff <= 0) return "Expired";
        if (diff <= sevenDays) return "Expiring";
        return "Active";
    };

    // ------------------------------
    // REMAINING TIME
    // ------------------------------
  const getRemainingTimeData = (sub) => {
    const end = getEndDate(sub);
    if (!end) return { text: "N/A", label: "Unknown" };

    const diff = end - new Date();
    if (diff <= 0) return { text: "Time's up!", label: "Expired" };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    const label = days < 7 ? "Expiring" : "Active";
    return { 
        text: `${days}d ${hours}h`, 
        label: label 
    };
};
 
    // FILTER LOGIC

    useEffect(() => {
        let result = subs.filter(sub =>
            sub.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus !== "all") {
            result = result.filter(sub => {
                const status = getStatus(sub);
                return status.toLowerCase() === filterStatus;
            });
        }

        setFilteredSubs(result);
    }, [searchTerm, filterStatus, subs]);

    // ------------------------------
    // DELETE
    // ------------------------------
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Confirm Delete?',
            text: "Data will be removed permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete'
        });

        if (result.isConfirmed) {
           const token = localStorage.getItem("auth_token") || "secure_session_active";
    await axios.delete(`${import.meta.env.VITE_API_URL}/delete-sub/${id}?type=single`, {
        headers: { Authorization: token }
    });
    fetchSubs();
            Swal.fire('Deleted!', '', 'success');
        }
    };



    // ------------------------------
// EDIT
// ------------------------------
const handleEdit = (sub) => {
    setEditData(sub);
    document.getElementById("add_modal").showModal();
};


// RENEW

const handleRenew = async (sub) => {
    const result = await Swal.fire({
        title: "Renew Subscription?",
        text: "This will reset the start date to today and extend it for 30 days.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: '#f97316',
        confirmButtonText: "Yes, Renew"
    });

    if (!result.isConfirmed) return;

    try {
       
        const now = new Date();
        const startDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const startTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

       
        const token = localStorage.getItem("auth_token") || "secure_session_active";
    await axios.put(`${import.meta.env.VITE_API_URL}/renew-sub/${sub._id}`, {
        startDate, startTime, durationDays: 30, durationHours: 0
    }, {
        headers: { Authorization: token }
    });
    fetchSubs();

        Swal.fire({
            icon: "success",
            title: "Subscription renewed!",
            text: "Started from today for the next 30 days.",
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        console.error("Renew Error:", err);
        Swal.fire("Error", "Could not renew subscription", "error");
    }
};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Single Email Tracking
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Monitor activity from MongoDB Database
                    </p>
                </div>
                <button
  onClick={() => {
    setEditData(null);  
    document.getElementById("add_modal").showModal();
  }}
  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg transition-all"
>
  <Plus size={18} /> Add New Email
</button>

            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <select
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="expiring">Expiring Soon</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-slate-600 uppercase text-xs tracking-wider">
                                <th className="px-8 py-4 font-semibold">Email</th>
                                <th className="py-4 font-semibold">Start Date</th>
                                <th className="py-4 font-semibold">End Date</th>
                                <th className="py-4 font-semibold">Remaining</th>
                                <th className="py-4 font-semibold">Status</th>
                                <th className="px-8 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredSubs.map((sub) => {
                                const status = getStatus(sub);
                                const end = getEndDate(sub);

                                const formattedStart = sub.startDate && sub.startTime
                                    ? new Date(`${sub.startDate}T${sub.startTime}`).toLocaleString("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true
                                    })
                                    : "N/A";

                                const formattedEnd = end
                                    ? end.toLocaleString("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true
                                    })
                                    : "Update Needed";

                                return (
                                    <tr key={sub._id} className="hover:bg-slate-50 transition-all">
                                        <td className="px-8 py-5 font-medium text-slate-800">
                                            {sub.email}
                                        </td>

                                        <td className="py-5 text-slate-600">
                                            {formattedStart}
                                        </td>

                                        <td className="py-5 text-indigo-600 font-medium">
                                            {formattedEnd}
                                        </td>

                                       <td className="py-5">
    {(() => {
        const timeData = getRemainingTimeData(sub);
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs tracking-wide shadow-sm border transition-all ${
                timeData.label === "Expired" 
                    ? "bg-rose-50 text-rose-700 border-rose-100" 
                    : timeData.label === "Expiring"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-teal-50 text-teal-700 border-teal-100"
            }`}>
                <Clock 
                    size={15} 
                    className={timeData.label === "Active" ? "animate-pulse" : ""} 
                />
                <span>{timeData.text}</span>
            </div>
        );
    })()}
</td>

                                        <td className="py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                status === "Active" ? "bg-emerald-100 text-emerald-700" :
                                                status === "Expiring" ? "bg-orange-100 text-orange-700" :
                                                status === "Expired" ? "bg-rose-100 text-rose-700" :
                                                "bg-gray-100 text-gray-600"
                                            }`}>
                                                {status}
                                            </span>
                                        </td>

                                        <td className="px-8 py-5 text-right">
    <div className="flex justify-end gap-2">

        {/* EDIT */}
        <button
            onClick={() => handleEdit(sub)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-lg"
        >
            <Edit size={16} />
        </button>

        {/* DELETE */}
        <button
            onClick={() => handleDelete(sub._id)}
            className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg"
        >
            <Trash2 size={16} />
        </button>

        {/* RENEW */}
        <button
            onClick={() => handleRenew(sub)}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg"
        >
            <RefreshCcw size={16} />
        </button>

    </div>
</td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
<AddSubscriptionModal
    id="add_modal"
    editData={editData}
    onSave={() => {
        fetchSubs();      
        setEditData(null); 
    }}
/>

        </div>
    );
};

export default SingleEmailPage;
