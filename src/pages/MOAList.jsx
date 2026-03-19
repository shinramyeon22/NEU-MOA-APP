// MOAList.jsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/authContextBase";
import { moaService } from "../services/moaService";
import MOAModal from "../components/MOAModal";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw,
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  LogOut 
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";

const MOAList = () => {
  const { user, logout } = useAuth();
  const [moas, setMoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filters, setFilters] = useState({
    college: "",
    status: "",
    industry: "",
  });

  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMoa, setEditingMoa] = useState(null);

  const canMaintain = user?.role === 'Admin' || user?.canMaintain === true;

  const fetchMOAs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await moaService.getMOAs({
        ...filters,
        role: user.role,
        showDeleted: showDeleted && user.role === 'Admin'
      });
      setMoas(data);
    } catch (error) {
      console.error("Failed to fetch MOAs", error);
    } finally {
      setLoading(false);
    }
  }, [filters, showDeleted, user]);

  useEffect(() => {
    fetchMOAs();
  }, [fetchMOAs]);

  const handleSave = async (formData) => {
    try {
      await moaService.saveMOA(formData, user.uid, !!editingMoa);
      setIsModalOpen(false);
      setEditingMoa(null);
      fetchMOAs();
    } catch (error) {
      alert("Failed to save MOA: " + error.message);
    }
  };

  const handleDelete = async (moaId) => {
    if (window.confirm("Are you sure you want to soft delete this MOA?")) {
      try {
        await moaService.softDeleteMOA(moaId, user.uid);
        fetchMOAs();
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  const handleRecover = async (moaId) => {
    if (window.confirm("Recover this deleted MOA?")) {
      try {
        await moaService.saveMOA({ id: moaId, deleted: false }, user.uid, true);
        fetchMOAs();
      } catch (error) {
        alert("Recovery failed: " + error.message);
      }
    }
  };

  const filteredMoas = useMemo(() => {
    return moas.filter(moa => {
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = 
        (moa.company?.toLowerCase() || "").includes(term) ||
        (moa.hteid?.toLowerCase() || "").includes(term) ||
        (moa.contact?.toLowerCase() || "").includes(term) ||
        (moa.address?.toLowerCase() || "").includes(term);

      const matchesCollege = !filters.college || moa.college === filters.college;
      const matchesStatus = !filters.status || moa.status === filters.status;
      const matchesIndustry = !filters.industry || moa.industry === filters.industry;

      return matchesSearch && matchesCollege && matchesStatus && matchesIndustry;
    });
  }, [moas, searchTerm, filters]);

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
          <Link to="/dashboard" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/moas" className="flex items-center gap-3 w-full text-left py-3 px-4 rounded-lg bg-gray-800 text-purple-400 transition-colors">
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
          <h2 className="text-2xl font-bold">MOA List</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by company, HTE ID, contact..." 
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-80 focus:border-purple-500 outline-none text-sm transition-all focus:w-96"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {canMaintain && (
              <button 
                onClick={() => { setEditingMoa(null); setIsModalOpen(true); }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <Plus size={18} /> Add New MOA
              </button>
            )}
          </div>
        </header>

        {/* Filters Bar */}
        <div className="px-8 py-4 bg-gray-900 border-b border-gray-800 flex flex-wrap gap-4 items-center">
          <select 
            value={filters.college} 
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-purple-500"
          >
            <option value="">All Colleges</option>
            {[
              "College of Computer Studies",
              "College of Engineering",
              "College of Business Administration",
              "College of Education",
              "College of Nursing"
            ].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            value={filters.status} 
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            {[
              "APPROVED: Signed by President",
              "APPROVED: On-going notarization",
              "APPROVED: No notarization needed",
              "PROCESSING: Awaiting signature",
              "PROCESSING: Sent to Legal",
              "PROCESSING: Sent to VPAA/OP",
              "EXPIRED: No renewal",
              "EXPIRING: Two months before"
            ].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select 
            value={filters.industry} 
            onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-purple-500"
          >
            <option value="">All Industries</option>
            {["Telecom", "Food", "Services", "Technology", "Finance", "Others"].map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          {isAdmin && (
            <label className="flex items-center gap-2 text-sm ml-auto">
              <input 
                type="checkbox" 
                checked={showDeleted} 
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="accent-purple-500 w-4 h-4"
              />
              Show Deleted MOAs
            </label>
          )}
        </div>

        {/* Table */}
        <div className="p-8 flex-1 overflow-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">HTE ID</th>
                  <th className="px-6 py-4 font-semibold">Company Name</th>
                  {isStudent && <th className="px-6 py-4 font-semibold">Address</th>}
                  {!isStudent && <th className="px-6 py-4 font-semibold">Industry</th>}
                  {!isStudent && <th className="px-6 py-4 font-semibold">College</th>}
                  {!isStudent && <th className="px-6 py-4 font-semibold">Expiration</th>}
                  <th className="px-6 py-4 font-semibold">Status</th>
                  {isStudent && <th className="px-6 py-4 font-semibold">Contact Person</th>}
                  {isStudent && <th className="px-6 py-4 font-semibold">Email</th>}
                  {canMaintain && <th className="px-6 py-4 font-semibold text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={isStudent ? 6 : 8} className="px-6 py-20 text-center text-gray-500">
                      Loading MOAs...
                    </td>
                  </tr>
                ) : filteredMoas.length === 0 ? (
                  <tr>
                    <td colSpan={isStudent ? 6 : 8} className="px-6 py-20 text-center text-gray-500">
                      No MOAs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMoas.map((moa) => (
                    <tr key={moa.id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-purple-400">{moa.hteid}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-200">{moa.company}</div>
                      </td>

                      {isStudent && <td className="px-6 py-4 text-sm text-gray-400">{moa.address}</td>}
                      {!isStudent && <td className="px-6 py-4 text-sm text-gray-400">{moa.industry}</td>}
                      {!isStudent && <td className="px-6 py-4 text-sm">{moa.college}</td>}
                      {!isStudent && <td className="px-6 py-4 text-sm text-gray-400">{moa.expiration || "N/A"}</td>}

                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          moa.status.startsWith('APPROVED') ? 'bg-green-900/30 text-green-400 border border-green-800/50' :
                          moa.status.startsWith('PROCESSING') ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
                          'bg-red-900/30 text-red-400 border border-red-800/50'
                        }`}>
                          {moa.status.split(':')[0]}
                        </span>
                      </td>

                      {isStudent && <td className="px-6 py-4">{moa.contact}</td>}
                      {isStudent && <td className="px-6 py-4 text-sm text-blue-400">{moa.email}</td>}

                      {canMaintain && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingMoa(moa); setIsModalOpen(true); }}
                              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>

                            {isAdmin && (
                              moa.deleted ? (
                                <button 
                                  onClick={() => handleRecover(moa.id)}
                                  className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg"
                                  title="Recover"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleDelete(moa.id)}
                                  className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                                  title="Soft Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      <MOAModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingMoa(null); }} 
        onSave={handleSave}
        initialData={editingMoa}
      />
    </div>
  );
};

export default MOAList;