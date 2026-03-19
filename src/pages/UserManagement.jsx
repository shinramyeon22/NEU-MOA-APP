import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContextBase";
import { userService } from "../services/userService";
import { Navigate, Link } from "react-router-dom";
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  History, 
  LogOut, 
  Shield, 
  ShieldAlert, 
  UserMinus, 
  UserCheck,
  Search
} from "lucide-react";

const UserManagement = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await userService.updateUser(userId, updates);
      fetchUsers();
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  if (authLoading) return null;
  if (!user || user.role !== 'Admin') return <Navigate to="/dashboard" />;

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Link to="/users" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg bg-gray-800 text-purple-400 transition-colors">
              <Users size={20} /> User Management
            </Link>
            <Link to="/audit" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
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
          <h2 className="text-2xl font-bold">User Management</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-64 focus:border-purple-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold text-center">Role</th>
                  <th className="px-6 py-4 font-semibold text-center">Maintenance</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-500 italic">Fetching users...</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 font-bold text-xs uppercase">
                            {u.displayName?.charAt(0) || u.email?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-200">{u.displayName || "Unknown User"}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={u.role || 'Student'} 
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs outline-none focus:border-purple-500"
                        disabled={u.email === user.email}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Student">Student</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleUpdateUser(u.id, { canMaintain: !u.canMaintain })}
                        className={`p-2 rounded-lg transition-colors ${u.canMaintain ? 'text-green-400 hover:bg-green-900/20' : 'text-gray-500 hover:bg-gray-800'}`}
                        title={u.canMaintain ? "Revoke Maintenance" : "Grant Maintenance"}
                      >
                        {u.canMaintain ? <Shield size={18} /> : <ShieldAlert size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${u.blocked ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-green-900/30 text-green-400 border border-green-800/50'}`}>
                        {u.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleUpdateUser(u.id, { blocked: !u.blocked })}
                        disabled={u.email === user.email}
                        className={`p-2 rounded-lg transition-colors ${u.blocked ? 'text-green-400 hover:bg-green-900/20' : 'text-red-400 hover:bg-red-900/20'} disabled:opacity-20`}
                      >
                        {u.blocked ? <UserCheck size={18} /> : <UserMinus size={18} />}
                      </button>
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

export default UserManagement;
