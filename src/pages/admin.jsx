import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/admin/Sidebar";
import { Dashboard } from "../components/admin/Dashboard";
import { BusManager } from "../components/admin/BusManager";
import { RouteManager } from "../components/admin/RouteManager";
import { TicketManager } from "../components/admin/TicketManager";
import { AdminRequestManager } from "../components/admin/AdminRequestManager";

export function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/admin/login");
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/admin/login");
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'buses':
        return <BusManager />;
      case 'routes':
        return <RouteManager />;
      case 'tickets':
        return <TicketManager />;
      case 'requests':
        return <AdminRequestManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}