'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50">
      <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <div className="text-purple-700 text-xl font-semibold">{message}</div>
    </div>
  );
}

function PasswordResetModal({ open, onClose, onSubmit, user }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-md">
        <h3 className="font-bold text-lg mb-2">Reset Password for {user.name} ({user.email})</h3>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                await onSubmit(newPassword);
                setNewPassword('');
                onClose();
              } catch (e) {
                setError('Failed to reset password');
              } finally {
                setLoading(false);
              }
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/');
      return;
    }
    if (session.user?.role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchPendingTeachers();
    fetchUsers();
  }, [session, status, router]);

  const fetchPendingTeachers = async () => {
    try {
      const response = await fetch('/api/admin/approve-teacher');
      if (!response.ok) throw new Error('Failed to fetch pending teachers');
      const data = await response.json();
      setPendingTeachers(data.pendingTeachers || []);
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      setMessage('Error loading pending teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const res = await fetch('/api/admin/user-management');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleTeacherAction = async (teacherEmail, action) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/approve-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} teacher`);
      
      setMessage(`Teacher ${action}d successfully`);
      await fetchPendingTeachers();
    } catch (error) {
      console.error(`Error ${action}ing teacher:`, error);
      setMessage(`Error ${action}ing teacher`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    await fetch('/api/admin/user-management', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword }),
    });
    await fetchUsers();
    setMessage('Password reset successfully');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    await fetch('/api/admin/user-management', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await fetchUsers();
    setMessage('User deleted successfully');
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-2">LearnPad</h1>
            <h2 className="text-xl text-purple-600">Admin Dashboard</h2>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Sign Out
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-purple-100 text-purple-700 rounded-lg">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Management</h2>
          {userLoading ? (
            <LoadingScreen message="Loading users..." />
          ) : users.length === 0 ? (
            <p className="text-gray-600">No users found</p>
          ) : (
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-purple-50">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Provider</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">{user.provider || 'credentials'}</td>
                    <td className="p-2">{user.status}</td>
                    <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 flex gap-2">
                      {user.provider !== 'google' && (
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                        >
                          Reset Password
                        </button>
                      )}
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <PasswordResetModal
          open={showResetModal}
          onClose={() => setShowResetModal(false)}
          onSubmit={pw => handleResetPassword(selectedUser.id, pw)}
          user={selectedUser}
        />
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Teacher Approval Requests</h2>
          
          {pendingTeachers.length === 0 ? (
            <p className="text-gray-600">No pending teacher approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                    <p className="text-gray-600">{teacher.email}</p>
                    <p className="text-sm text-gray-500">
                      Registered: {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleTeacherAction(teacher.email, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleTeacherAction(teacher.email, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 