import React, { useState } from 'react';
import { 
    Download, 
    Upload, 
    FileJson, 
    Database, 
    ShieldCheck, 
    AlertCircle, 
    RefreshCcw 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ImportExportPage = () => {
    const [isImporting, setIsImporting] = useState(false);

    // Export All Data
    const handleExportAll = async () => {
        try {
            const token = localStorage.getItem("auth_token") || "secure_session_active";
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/all-subscriptions`, {
            headers: { Authorization: token }
        });
            downloadJSON(res.data, "Full_Backup_Subscriptions.json");
            Swal.fire('Exported!', 'All data has been exported successfully.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to export data', 'error');
        }
    };

    // Export Specific Types
    const handleExportSpecific = async (type) => {
        try {
            const token = localStorage.getItem("auth_token") || "secure_session_active";
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/all-subscriptions`, {
                headers: { Authorization: token }
            });
            const data = type === 'single' ? res.data.single : res.data.family;
            downloadJSON(data, `${type}_subscriptions.json`);
            Swal.fire('Success', `${type} data exported.`, 'success');
        } catch (err) {
            Swal.fire('Error', 'Export failed', 'error');
        }
    };

    // Helper to download file
    const downloadJSON = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

// Import Data Function (Updated)
const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const jsonData = JSON.parse(event.target.result);
            setIsImporting(true);
            
            
            const token = localStorage.getItem("auth_token") || "secure_session_active";
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/import-data`, jsonData, {
                headers: { Authorization: token }
            });
         
            if (response.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: `Imported ${response.data.singleCount} Single and ${response.data.familyCount} Family records.`,
                    icon: 'success'
                });
            }
        } catch (err) {
            console.error("Import Error:", err);
            Swal.fire('Error', err.response?.data?.error || 'Invalid JSON file structure.', 'error');
        } finally {
            setIsImporting(false);
            e.target.value = null;
        }
    };
    reader.readAsText(file);
};
    return (
        <div className="p-8 bg-[#FBFBFE] min-h-screen font-sans">
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <Database className="text-indigo-600" size={32} />
                    Data Management
                </h1>
                <p className="text-slate-500 text-sm mt-1">Backup your subscription data or restore from a previous session</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Export Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Export Backup</h3>
                            <p className="text-slate-400 text-xs">Download your data to keep it safe</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={handleExportAll}
                            className="flex flex-col items-start p-6 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                        >
                            <ShieldCheck className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" size={28} />
                            <span className="font-bold text-slate-700">Full System Backup</span>
                            <span className="text-slate-400 text-xs mt-1 text-left">Export all single and family group subscriptions into one JSON file.</span>
                        </button>

                        <div className="space-y-3">
                            <button 
                                onClick={() => handleExportSpecific('single')}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileJson size={18} className="text-blue-500" />
                                    <span className="text-sm font-semibold text-slate-600">Single Emails Only</span>
                                </div>
                                <Download size={16} className="text-slate-400" />
                            </button>

                            <button 
                                onClick={() => handleExportSpecific('family')}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileJson size={18} className="text-purple-500" />
                                    <span className="text-sm font-semibold text-slate-600">Family Groups Only</span>
                                </div>
                                <Download size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Import Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Restore Data</h3>
                            <p className="text-slate-400 text-xs">Upload your JSON backup file</p>
                        </div>
                    </div>

                    <div className="relative flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all">
                        <input 
                            type="file" 
                            id="import-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            accept=".json"
                            onChange={handleImport}
                            disabled={isImporting}
                        />
                        
                        {isImporting ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <RefreshCcw className="text-indigo-500 animate-spin mb-3" size={40} />
                                <span className="font-bold text-indigo-600">Importing Data...</span>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                                    <FileJson className="text-amber-500" size={32} />
                                </div>
                                <p className="font-bold text-slate-700">Click or Drag File</p>
                                <p className="text-slate-400 text-xs mt-1">Only .json files are supported</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <AlertCircle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            <strong>Caution:</strong> Importing data will merge or overwrite current records. Make sure you have a current backup before proceeding.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ImportExportPage;