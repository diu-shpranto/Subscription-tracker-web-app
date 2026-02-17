import React, { useState, useEffect } from "react";
import { Plus, X, Users, Mail } from "lucide-react";

const AddFamilyModal = ({ id, onSave, editData }) => {
 
  const [formData, setFormData] = useState({
    managerEmail: "",
    groupType: "regular",
    startDate: "",
    startTime: "",
    durationDays: 30,
    durationHours: 0,
  });

  const [members, setMembers] = useState([""]);


  useEffect(() => {
    if (editData) {
      setFormData({
        managerEmail: editData.managerEmail || "",
        groupType: editData.type || "regular", 
        startDate: editData.startDate || "",
        startTime: editData.startTime || "",
        durationDays: editData.durationDays || 30,
        durationHours: editData.durationHours || 0,
      });
      
      setMembers(editData.memberEmails?.length ? editData.memberEmails : [""]);
    } else {
      
      setFormData({
        managerEmail: "",
        groupType: "regular",
        startDate: "",
        startTime: "",
        durationDays: 30,
        durationHours: 0,
      });
      setMembers([""]);
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addMemberField = () => {
    if (members.length < 5) setMembers([...members, ""]);
  };

  const removeMemberField = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Basic Validation
    if (!formData.managerEmail) {
      alert("Manager Email is required");
      return;
    }

    // 2. Prepare Data Structure
   
    const submissionData = {
      managerEmail: formData.managerEmail.trim(),
      memberEmails: members.filter((m) => m && m.trim() !== ""), 
      type: formData.groupType, 
      startDate: formData.startDate,
      startTime: formData.startTime,
      durationDays: Number(formData.durationDays) || 0,
      durationHours: Number(formData.durationHours) || 0,
      updatedAt: new Date().toISOString(),
    };

    try {
      // 3. Execution
      const isSuccess = await onSave(submissionData);
      
      if (isSuccess) {
        document.getElementById(id).close();
        if (!editData) {
          // Reset only on successful creation
          setFormData({
            managerEmail: "",
            groupType: "regular",
            startDate: "",
            startTime: "",
            durationDays: 30,
            durationHours: 0,
          });
          setMembers([""]);
        }
      } else {
        // This triggers if onSave returns false
        console.error("Backend rejected the update. Check Network tab for details.");
      }
    } catch (error) {
      // This triggers if the API call fails (e.g., 500 error or Network error)
      console.error("Critical submission error:", error);
    }
  };
  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-3xl p-0 rounded-2xl shadow-2xl bg-white border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-indigo-600 to-indigo-500">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {editData ? "Edit Family Group" : "Create Family Group"}
            </h3>
            <p className="text-indigo-100 text-sm mt-1">
              Configure subscription and member access
            </p>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById(id).close()}
            className="text-white/80 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          {/* Section: Manager Info */}
          <div className="space-y-5">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Manager Information
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Manager Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="managerEmail"
                    type="email"
                    required
                    value={formData.managerEmail}
                    onChange={handleChange}
                    placeholder="manager@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Subscription Type
                </label>
                <select
                  name="groupType"
                  required
                  value={formData.groupType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="regular">Regular Family</option>
                  <option value="renewing">Renewing Family</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Members */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Member Emails ({members.length}/5)
              </h4>
              {members.length < 5 && (
                <button
                  type="button"
                  onClick={addMemberField}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      placeholder={`Member ${index + 1} email`}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(index)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Schedule */}
          <div className="space-y-5">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Subscription Schedule
            </h4>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Start Time</label>
                <input
                  name="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Days</label>
                <input
                  name="durationDays"
                  type="number"
                  value={formData.durationDays}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Hours</label>
                <input
                  name="durationHours"
                  type="number"
                  value={formData.durationHours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => document.getElementById(id).close()}
              className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-md"
            >
              {editData ? "Update Group" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddFamilyModal;
