import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet /> {/* এখানে পেজগুলো রেন্ডার হবে */}
      </div>
    </div>
  );
};

export default MainLayout;