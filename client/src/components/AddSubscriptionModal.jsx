import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { X, Mail, Calendar, Clock } from "lucide-react";

const AddSubscriptionModal = ({ id, onSave, editData }) => {

  const [formData, setFormData] = useState({
    email: "",
    startDate: "",
    startTime: "",
    durationDays: 30,
    durationHours: 0
  });

  // Auto Fill for Edit
  useEffect(() => {
    if (editData) {
      setFormData({
        email: editData.email || "",
        startDate: editData.startDate || "",
        startTime: editData.startTime || "",
        durationDays: editData.durationDays || 30,
        durationHours: editData.durationHours || 0
      });
    } else {
      setFormData({
        email: "",
        startDate: "",
        startTime: "",
        durationDays: 30,
        durationHours: 0
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editData) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/update-sub/${editData._id}`,
          formData
        );

        Swal.fire("Updated!", "Subscription updated successfully", "success");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/add-single`,
          formData
        );

        Swal.fire("Added!", "Subscription added successfully", "success");
      }

      onSave();
      document.getElementById(id).close();

    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-2xl p-0 rounded-2xl shadow-2xl bg-white border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-indigo-600 to-indigo-500">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {editData ? "Edit Single Email" : "Add New Single Email"}
            </h3>
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

          {/* Email Section */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Start Time
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Duration Section */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Duration (days)
              </label>
              <input
                name="durationDays"
                type="number"
                value={formData.durationDays}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Duration (hours)
              </label>
              <input
                name="durationHours"
                type="number"
                value={formData.durationHours}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
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
              {editData ? "Update" : "Save"}
            </button>
          </div>

        </form>
      </div>
    </dialog>
  );
};

export default AddSubscriptionModal;
