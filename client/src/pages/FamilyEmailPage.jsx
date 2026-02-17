import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Clock, Trash2, Edit, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import AddFamilyModal from '../components/AddFamilyModal';

const FamilyEmailPage = () => {
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [editData, setEditData] = useState(null);

const fetchGroups = async () => {
    const token = localStorage.getItem("auth_token"); 
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/all-subscriptions`, {
        headers: {
            Authorization: token 
        }
    });
    setGroups(res.data.family || []);
    setFilteredGroups(res.data.family || []);
};
    useEffect(() => {
        fetchGroups();
        const interval = setInterval(() => setGroups(prev => [...prev]), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
    let data = groups.filter(g => {
        const managerEmail = g.managerEmail?.toLowerCase() || "";
        // MongoDB তে ফিল্ডের নাম memberEmails
        const membersMatch = (g.memberEmails || []).some(m => (m?.toLowerCase() || "").includes(searchTerm.toLowerCase()));
        const searchMatch = managerEmail.includes(searchTerm.toLowerCase()) || membersMatch;

        if (typeFilter === "all") return searchMatch;
        
       
        const currentType = (g.type || "regular").toLowerCase().trim();
        return searchMatch && currentType === typeFilter.toLowerCase();
    });

    setFilteredGroups(data);
}, [searchTerm, typeFilter, groups]);

    // Function to calculate End Date
    const getEndDate = (start, time, d, h) => {
        const date = new Date(`${start}T${time}`);
        date.setDate(date.getDate() + parseInt(d));
        date.setHours(date.getHours() + parseInt(h));
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getStatusInfo = (start, time, d, h) => {
        const end = new Date(`${start}T${time}`);
        end.setDate(end.getDate() + parseInt(d));
        end.setHours(end.getHours() + parseInt(h));
        const diff = end - new Date();
        
        if (diff <= 0) return { label: "Expired", class: "bg-rose-100 text-rose-600", color: "bg-rose-500", text: "0d 0h" };
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        
        if (days < 7) return { label: "Expiring", class: "bg-amber-100 text-amber-600", color: "bg-amber-500", text: `${days}d ${hours}h` };
        return { label: "Active", class: "bg-emerald-100 text-emerald-600", color: "bg-emerald-500", text: `${days}d ${hours}h` };
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Group?',
            text: "This will remove the manager and all linked members!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete'
        });
        if (result.isConfirmed) {
           const token = localStorage.getItem("auth_token") || "secure_session_active";
        await axios.delete(`${import.meta.env.VITE_API_URL}/delete-sub/${id}?type=family`, {
            headers: { Authorization: token } 
        });
        fetchGroups();
            Swal.fire('Deleted!', '', 'success');
        }
    };

    const handleEdit = (group) => {
        setEditData(group);
        document.getElementById("family_modal").showModal();
    };

    const handleRenew = async (group) => {
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
            const startDate = now.toISOString().split('T')[0];
            const startTime = now.toTimeString().split(' ')[0].substring(0, 5);

            const token = localStorage.getItem("auth_token") || "secure_session_active";
        await axios.put(`${import.meta.env.VITE_API_URL}/renew-sub/${group._id}?type=family`, {
            startDate,
            startTime,
            durationDays: 30,
            durationHours: 0
        }, {
            headers: { Authorization: token } 
        });

            Swal.fire({
                icon: "success",
                title: "Subscription renewed!",
                text: "Started from today for the next 30 days.",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Renew Error:", err);
            const message = err?.response?.data?.error || "Could not renew subscription";
            Swal.fire("Error", message, "error");
        }
    };

    return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10">

    {/* ===== HEADER ===== */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Family Email Management
        </h1>
        <p className="text-slate-500 mt-2">
          Monitor and manage shared subscription groups
        </p>
      </div>

      <button
        onClick={() => {
          setEditData(null);
          document.getElementById("family_modal").showModal();
        }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-200 transition"
      >
        <Plus size={18} />
        Add New Family Group
      </button>
    </div>

  
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500">Total Groups</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-2">
          {groups.length}
        </h3>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500">Active Groups</p>
        <h3 className="text-2xl font-bold text-emerald-600 mt-2">
          {
            groups.filter(
              g =>
                getStatusInfo(
                  g.startDate,
                  g.startTime,
                  g.durationDays,
                  g.durationHours
                ).label === "Active"
            ).length
          }
        </h3>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500">Expiring Soon</p>
        <h3 className="text-2xl font-bold text-amber-600 mt-2">
          {
            groups.filter(
              g =>
                getStatusInfo(
                  g.startDate,
                  g.startTime,
                  g.durationDays,
                  g.durationHours
                ).label === "Expiring"
            ).length
          }
        </h3>
      </div>
    </div>

    {/* ===== SEARCH & FILTER ===== */}
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search manager or member emails..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <select
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition bg-white"
        >
          <option value="all">All Types</option>
          <option value="regular">Regular Family</option>
          <option value="renewing">Renewing Family</option>
        </select>
      </div>
    </div>

    {/* ===== TABLE ===== */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="overflow-x-auto">
<table className="w-full text-sm">
  <thead className="bg-slate-50 border-b border-slate-200">
    <tr className="text-left text-slate-600 uppercase text-xs tracking-wider">
      <th className="px-8 py-4 font-semibold">Manager</th>
      <th className="py-4 font-semibold">Type</th>
      <th className="py-4 font-semibold">Members</th>
      <th className="py-4 font-semibold">Start Date</th>
      <th className="py-4 font-semibold">End Date</th>
      <th className="py-4 font-semibold">Remaining</th>
      <th className="py-4 font-semibold text-center">Status</th>
      <th className="px-8 py-4 font-semibold text-right">Actions</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-slate-100">
    {filteredGroups.map((group) => {
   const status = getStatusInfo(group.startDate, group.startTime, group.durationDays, group.durationHours);
     const endDate = getEndDate(group.startDate, group.startTime, group.durationDays, group.durationHours);
const formattedStartDate = new Date(group.startDate).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
      return (
        <tr key={group._id} className="hover:bg-slate-50 transition">
          {/* Manager Info */}
          <td className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                {group.managerEmail[0].toUpperCase()}
              </div>
              <span className="font-medium text-slate-700">{group.managerEmail}</span>
            </div>
          </td>

        {/* Type */}
<td className="py-5">
  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase">
    {group.type || "REGULAR"} {/* groupType এর বদলে type */}
  </span>
</td>

{/* Members Avatars */}

<td className="py-5">
  <div className="flex flex-col gap-1 max-w-[200px]">
    {(group.memberEmails || []).length > 0 ? (
      (group.memberEmails || []).map((email, i) => (
        <div 
          key={i} 
          className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate"
          title={email}
        >
          {email}
        </div>
      ))
    ) : (
      <span className="text-xs text-slate-400 italic">No members</span>
    )}
  </div>
</td>
        {/* Start Date*/}
        <td className="py-5 text-slate-600 font-medium">
          {formattedStartDate}
        </td>
          {/* End Date */}
          <td className="py-5 text-slate-600 font-medium">{endDate}</td>

        {/* Remaining Time  */}
<td className="py-5">
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs tracking-wide shadow-sm border ${
    status.label === "Expired" 
      ? "bg-rose-50 text-rose-700 border-rose-100" 
      : status.label === "Expiring"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-teal-50 text-teal-700 border-teal-100"
  }`}>
    <Clock size={15} className={status.label === "Active" ? "animate-pulse" : ""} />
    <span>{status.text}</span>
  </div>
</td>
          {/* Status Badge */}
          <td className="py-5 text-center">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${status.class}`}>
              {status.label}
            </span>
          </td>

          {/* Actions - Right Aligned */}
          <td className="px-8 py-5">
            <div className="flex justify-end gap-2">
              <button onClick={() => handleEdit(group)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                <Edit size={18} />
              </button>
           
              <button onClick={() => handleDelete(group._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">
                <Trash2 size={18} />
              </button>

                 <button onClick={() => handleRenew(group)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Renew">
                <RefreshCcw size={18} />
              </button>
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={40} className="mb-4 opacity-30" />
            <p className="font-medium">No family groups found</p>
          </div>
        )}
      </div>
    </div>

    <AddFamilyModal
      key={editData ? editData._id : "new-family-group"}
      id="family_modal"
      editData={editData}
      onSave={async (data) => {
        try {
          if (editData) {
            await axios.put(`${import.meta.env.VITE_API_URL}/update-sub/${editData._id}?type=family`, data);
          } else {
            await axios.post(`${import.meta.env.VITE_API_URL}/add-family`, data);
          }

          await fetchGroups();
          setEditData(null);
          Swal.fire({
            icon: "success",
            title: editData ? "Group Updated" : "Group Created",
            showConfirmButton: false,
            timer: 1000,
          });
          return true;
        } catch (err) {
          console.error("Family Save Error:", err);
          Swal.fire("Error", err?.response?.data?.error || "Failed to save family group", "error");
          return false;
        }
      }}
    />
  </div>
);

};

export default FamilyEmailPage;
