import { useState, useEffect } from 'react';
import axios from 'axios';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = roleFilter ? `/api/admin/users?role=${roleFilter}` : '/api/admin/users';
      const res = await axios.get(url);
      setUsers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-text mb-1">USERS</h1>
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">
            // User management & role assignment
          </p>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-bg border border-border rounded px-3 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="text-text-muted font-mono">LOADING USERS...</div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-bg hover:border-accent transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-border bg-bg flex items-center justify-center">
                  <span className="font-display text-lg text-accent">{user.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-text">{user.name}</h3>
                  <p className="text-text-muted font-mono text-xs">{user.email}</p>
                  {user.academicProfile?.departmentId && (
                    <p className="text-text-muted font-mono text-xs mt-1">
                      {user.academicProfile.departmentId.code} • {user.academicProfile.batchId?.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="bg-bg border border-border rounded px-3 py-1 text-text font-mono text-xs focus:outline-none focus:border-accent"
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
                <span className="font-mono text-accent text-sm">
                  {user.totalPoints} pts
                </span>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-3 py-1 border border-border text-text-muted font-mono text-xs rounded hover:border-red-500 hover:text-red-500 transition-all uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManager;