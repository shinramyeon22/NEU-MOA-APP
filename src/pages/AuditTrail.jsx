import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContextBase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase";
import { Navigate, Link } from "react-router-dom";
import { 
  History, 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  Search,
  Clock,
  User,
  Activity
} from "lucide-react";
import { format } from "date-fns";

const AuditTrail = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      setLogs(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })));
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!user || user.role !== 'Admin') return <Navigate to="/dashboard" />;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar - Same as Dashboard */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 space-y-1 shrink-0">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
            <img src="https://raw.githubusercontent.com/shinramyeon22/Software_Engineering_2_PROJECT/main/NEULogo.jpg" 
            alt="NEU Logo" 
            className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold tracking-tight">NEU MOA</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/moas" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
            <FileText size={20} /> MOA List
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-800 space-y-1">
            <Link to="/users" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
              <Users size={20} /> User Management
            </Link>
            <Link to="/audit" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg bg-gray-800 text-purple-400 transition-colors">
              <History size={20} /> Audit Trail
            </Link>
          </div>
        </nav>

        <button onClick={logout} className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors mt-auto">
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-950 flex flex-col">
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <History className="text-purple-400" /> Audit Trail
          </h2>
          <button 
            onClick={fetchLogs}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-700"
          >
            Refresh Logs
          </button>
        </header>

        <div className="p-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold"><Clock size={14} className="inline mr-2" /> Timestamp</th>
                  <th className="px-6 py-4 font-semibold"><User size={14} className="inline mr-2" /> User UID</th>
                  <th className="px-6 py-4 font-semibold"><Activity size={14} className="inline mr-2" /> Operation</th>
                  <th className="px-6 py-4 font-semibold">Target ID</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-500 italic">Loading audit logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-500 italic">No logs recorded yet.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {log.timestamp ? format(log.timestamp, "MMM d, yyyy HH:mm:ss") : "N/A"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{log.userId}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        log.operation === 'INSERT' ? 'bg-green-900/20 text-green-400 border border-green-800/30' :
                        log.operation === 'UPDATE' ? 'bg-blue-900/20 text-blue-400 border border-blue-800/30' :
                        'bg-red-900/20 text-red-400 border border-red-800/30'
                      }`}>
                        {log.operation}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-purple-400/70">{log.targetId}</td>
                    <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditTrail;
