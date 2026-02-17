import { NavLink } from "react-router-dom";
import { LayoutDashboard, UserCheck, Users, Database, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';

const Sidebar = () => {
    const menus = [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20}/> },
        { name: "Single Email", path: "/single-email", icon: <UserCheck size={20}/> },
        { name: "Family Email", path: "/family-email", icon: <Users size={20}/> },
        { name: "Import/Export", path: "/import-export", icon: <Database size={20}/> }, // Database আইকন ব্যবহার করা হয়েছে
    ];

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout?',
            text: "আপনি কি নিশ্চিতভাবে লগআউট করতে চান?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("auth_token");
                window.location.href = "/"; 
            }
        });
    };

    return (
        <div className="w-64 bg-white border-r h-screen p-4 flex flex-col justify-between">
            {/* Top Section: Logo and Menus */}
            <div>
                <h1 className="text-xl font-bold mb-8 text-indigo-600 px-4">SubManager</h1>
                
                <div className="space-y-2">
                    {menus.map((menu) => (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                    : "text-slate-600 hover:bg-slate-50"
                                }`
                            }
                        >
                            {menu.icon}
                            <span className="font-medium">{menu.name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Bottom Section: Logout Button */}
            <div className="border-t pt-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-medium"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;