import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const initialForm = { projectId: '', amount: '' };

export default function Bids() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const authHeader = { Authorization: `Bearer ${user?.token}` };

  const loadBids = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/bids', { headers: authHeader });
      setBids(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) loadBids();
  }, [user?.token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectId.trim() || !form.amount) return;

    const payload = { projectId: form.projectId, amount: Number(form.amount) };

    if (editingId) {
      await axiosInstance.put(`/api/bids/${editingId}`, payload, { headers: authHeader });
    } else {
      await axiosInstance.post('/api/bids', payload, { headers: authHeader });
    }
    setForm(initialForm);
    setEditingId(null);
    await loadBids();
  };

  const onEdit = (b) => {
    setEditingId(b._id);
    setForm({ projectId: b.projectId || '', amount: b.amount || '' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this bid?')) return;
    await axiosInstance.delete(`/api/bids/${id}`, { headers: authHeader });
    await loadBids();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bids</h1>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow rounded p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium">Project ID</label>
          <input
            className="w-full border rounded p-2"
            name="projectId"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            placeholder="Enter the project ID you want to bid on"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bid Amount (AUD)</label>
          <input
            className="w-full border rounded p-2"
            type="number"
            min="0"
            name="amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. 250"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update Bid' : 'Place Bid'}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Project ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
        </table>
        <table className="w-full text-left">
          <tbody>
            {bids.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-3 font-mono text-sm">{b.projectId}</td>
                <td className="p-3">{b.amount ? `$${b.amount}` : '-'}</td>
                <td className="p-3 text-sm">{b.status || 'Pending'}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => onEdit(b)} className="px-3 py-1 rounded border">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(b._id)}
                    className="px-3 py-1 rounded bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!bids.length && (
              <tr>
                <td className="p-3 text-sm text-gray-500" colSpan={4}>
                  No bids found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
