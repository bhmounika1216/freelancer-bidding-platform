// Projects.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const initialForm = { title: '', description: '', budget: '' };

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeader = { Authorization: `Bearer ${user?.token}` };

  const loadProjects = async () => {
    setLoading(true);
    try {
      if (user?.token) {
        const { data } = await axiosInstance.get('/api/projects', { headers: authHeader });
        setProjects(Array.isArray(data) ? data : []);
      } else {
        // Dummy data for testing without login
        setProjects([
          { _id: '1', title: 'Test Project 1', description: 'Demo project description', budget: 100 },
          { _id: '2', title: 'Test Project 2', description: 'Another demo project', budget: 250 },
        ]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user?.token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      if (editingId && user?.token) {
        await axiosInstance.put(`/api/projects/${editingId}`, form, { headers: authHeader });
      } else if (user?.token) {
        await axiosInstance.post('/api/projects', form, { headers: authHeader });
      } else {
        // Dummy add for testing
        setProjects([...projects, { ...form, _id: Date.now().toString() }]);
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to submit project:', err);
    }
  };

  const onEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title ?? '',
      description: p.description ?? '',
      budget: p.budget ?? '',
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      if (user?.token) {
        await axiosInstance.delete(`/api/projects/${id}`, { headers: authHeader });
      } else {
        // Dummy delete for testing
        setProjects(projects.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      loadProjects();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow rounded p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="w-full border rounded p-2"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Build a landing page"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What needs to be done?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Budget (AUD)</label>
          <input
            className="w-full border rounded p-2"
            type="number"
            min="0"
            name="budget"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            placeholder="e.g. 500"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update Project' : 'Create Project'}
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
              <th className="p-3">Title</th>
              <th className="p-3">Budget</th>
              <th className="p-3">Description</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.budget ? `$${p.budget}` : '-'}</td>
                <td className="p-3 text-sm">{p.description}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => onEdit(p)} className="px-3 py-1 rounded border">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p._id)}
                    className="px-3 py-1 rounded bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!projects.length && (
              <tr>
                <td className="p-3 text-sm text-gray-500" colSpan={4}>
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
