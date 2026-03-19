import React, { useMemo, useState } from "react";
import { X } from "lucide-react";

const MOAModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const emptyFormData = useMemo(
    () => ({
      hteid: "",
      company: "",
      address: "",
      contact: "",
      email: "",
      industry: "",
      effective: "",
      expiration: "",
      status: "",
      college: "",
      notes: "",
    }),
    []
  );

  const [formData, setFormData] = useState(() => ({
    ...emptyFormData,
    ...(initialData || {}),
  }));

  const industries = ["Telecom", "Food", "Services", "Technology", "Finance", "Others"];
  const colleges = [
    "College of Computer Studies",
    "College of Engineering",
    "College of Business Administration",
    "College of Education",
    "College of Nursing"
  ];
  const statuses = [
    "APPROVED: Signed by President",
    "APPROVED: On-going notarization",
    "APPROVED: No notarization needed",
    "PROCESSING: Awaiting signature",
    "PROCESSING: Sent to Legal",
    "PROCESSING: Sent to VPAA/OP",
    "EXPIRED: No renewal",
    "EXPIRING: Two months before"
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-800/30 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-2xl font-bold">{initialData ? "Edit MOA" : "New MOA"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">HTE ID *</label>
            <input
              type="text"
              required
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.hteid}
              onChange={(e) => setFormData({ ...formData, hteid: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Company Name *</label>
            <input
              type="text"
              required
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <textarea
              rows="2"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none resize-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contact Person</label>
            <input
              type="text"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
            <input
              type="email"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Industry</label>
            <select
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            >
              <option value="">Select...</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">College</label>
            <select
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            >
              <option value="">Select...</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Effective Date</label>
            <input
              type="date"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.effective}
              onChange={(e) => setFormData({ ...formData, effective: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Expiration Date</label>
            <input
              type="date"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.expiration}
              onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Status *</label>
            <select
              required
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="">Select...</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Internal Notes</label>
            <textarea
              rows="4"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none resize-y"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors font-bold shadow-lg shadow-purple-900/20"
            >
              {initialData ? "Update Agreement" : "Save Agreement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MOAModal;
