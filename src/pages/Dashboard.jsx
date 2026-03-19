// Dashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/authContextBase";
import { moaService } from "../services/moaService";
import { Navigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  LogOut, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  FileSearch 
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    processing: 0,
    expiring: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const moas = await moaService.getMOAs({ role: user.role });
      
      const newStats = {
        total: moas.length,
        approved: moas.filter(m => m.status.startsWith("APPROVED")).length,
        processing: moas.filter(m => m.status.startsWith("PROCESSING")).length,
        expiring: moas.filter(m => m.status.startsWith("EXPIRING")).length,
      };
      
      setStats(newStats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!user) return <Navigate to="/login" replace />;

  const isStudent = user.role === "Student";
  const isAdmin = user.role === "Admin";

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 space-y-1 shrink-0">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <img 
            src="https://raw.githubusercontent.com/shinramyeon22/Software_Engineering_2_PROJECT/main/NEULogo.jpg" 
            alt="NEU Logo" 
            className="w-10 h-10 rounded-full" 
          />
          <span className="text-xl font-bold tracking-tight">NEU MOA</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg bg-gray-800 text-purple-400 transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/moas" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
            <FileText size={20} /> MOA List
          </Link>
          
          {(isAdmin || user.canMaintain) && (
            <div className="pt-4 mt-4 border-t border-gray-800 space-y-1">
              <Link to="/users" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <Users size={20} /> User Management
              </Link>
              <Link to="/audit" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <History size={20} /> Audit Trail
              </Link>
            </div>
          )}
        </nav>

        <button 
          onClick={logout} 
          className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors mt-auto"
        >
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-950 flex flex-col">
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium">{user.displayName || "User"}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{user.role}</div>
            </div>
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-10 h-10 rounded-full border border-purple-500/50" 
              />
            )}
          </div>
        </header>

        <div className="p-8">
          {isStudent ? (
            /* ==================== STUDENT DASHBOARD ==================== */
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="mx-auto w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-8">
                <CheckCircle size={60} className="text-green-400" />
              </div>
              
              <h1 className="text-5xl font-bold mb-4">Welcome, Student</h1>
              <p className="text-xl text-gray-400 mb-10">
                You have access to all <span className="text-green-400 font-semibold">Approved MOAs</span> only.
              </p>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-10">
                <p className="text-gray-300 text-lg leading-relaxed">
                  You can view company details, address, contact person, and email of approved agreements.<br />
                  Processing, expired, or expiring MOAs are hidden from students.
                </p>
              </div>

              <Link 
                to="/moas" 
                className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105"
              >
                <FileText size={24} />
                Browse Approved MOAs
              </Link>
            </div>
          ) : (
            /* ==================== FACULTY & ADMIN DASHBOARD ==================== */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-gray-900 border border-purple-900/50 p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 font-medium">TOTAL MOAs</p>
                      <p className="text-4xl font-bold mt-3 text-purple-400">
                        {loading ? "..." : stats.total}
                      </p>
                    </div>
                    <FileText size={32} className="text-purple-500/50" />
                  </div>
                </div>

                <div className="bg-gray-900 border border-green-900/50 p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 font-medium">APPROVED</p>
                      <p className="text-4xl font-bold mt-3 text-green-400">
                        {loading ? "..." : stats.approved}
                      </p>
                    </div>
                    <CheckCircle size={32} className="text-green-500/50" />
                  </div>
                </div>

                <div className="bg-gray-900 border border-yellow-900/50 p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 font-medium">PROCESSING</p>
                      <p className="text-4xl font-bold mt-3 text-yellow-400">
                        {loading ? "..." : stats.processing}
                      </p>
                    </div>
                    <TrendingUp size={32} className="text-yellow-500/50" />
                  </div>
                </div>

                <div className="bg-gray-900 border border-orange-900/50 p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 font-medium">EXPIRING SOON</p>
                      <p className="text-4xl font-bold mt-3 text-orange-400">
                        {loading ? "..." : stats.expiring}
                      </p>
                    </div>
                    <AlertTriangle size={32} className="text-orange-500/50" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Quick Access</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link 
                    to="/moas" 
                    className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition-colors group"
                  >
                    <FileText size={32} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-lg">Manage MOAs</h4>
                    <p className="text-sm text-gray-400 mt-2">Add, edit, and monitor all agreements</p>
                  </Link>

                  {isAdmin && (
                    <>
                      <Link 
                        to="/users" 
                        className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition-colors group"
                      >
                        <Users size={32} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-lg">User Management</h4>
                        <p className="text-sm text-gray-400 mt-2">Manage roles and permissions</p>
                      </Link>

                      <Link 
                        to="/audit" 
                        className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition-colors group"
                      >
                        <History size={32} className="text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-lg">Audit Trail</h4>
                        <p className="text-sm text-gray-400 mt-2">View all system activities</p>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;