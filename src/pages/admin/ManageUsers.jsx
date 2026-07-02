import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../services/api';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import { ArrowUpRight, Search, Edit, Trash2, Eye } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';

const ManageUsers = () => {
  const { users, loading, fetchUsers, setUsers } = useAdminData();
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const tabs = ['All', 'Customer', 'Dhobi', 'Rider', 'Admin'];

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'All' || u.role === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will revoke their platform access.`)) {
      return;
    }

    try {
      await adminService.deleteUser(id);
      setUsers(users.filter(u => (u.id || u.userId) !== id));
      addToast(`${name} has been removed successfully.`, 'success');
    } catch (error) {
      addToast('Failed to delete user.', 'error');
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Directory</h1>
          <p className="page-subtitle">Manage memberships, roles, and platform permissions.</p>
        </div>
        <button className="btn-primary" onClick={() => window.location.href = '/'}>
          Back to Overview <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="panel animate-fade" style={{ animationDelay: '0.1s' }}>
        <div className="panel-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}s
              {activeTab === tab && <span className="tab-count">{filteredUsers.length}</span>}
            </button>
          ))}
        </div>

        <div className="panel-header" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div className="search-box">
            <Search size={16} color="var(--text-3)" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'All' ? 'members' : activeTab + 's'}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {filteredUsers.length} {activeTab === 'All' ? 'Total Members' : activeTab + 's Found'}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading.users ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading members...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-muted">No members match your search.</td></tr>
              ) : (
                filteredUsers.map((u) => {
                   const userId = u.id || u.userId;
                   return (
                    <tr key={userId} className="data-row">
                      <td>
                        <div className="user-profile">
                          <div className="user-avatar">{u.fullName?.charAt(0)}</div>
                          <div>
                            <div className="user-name">{u.fullName}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`role-tag ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                      <td>
                        <div className={`status-pill ${u.isVerified || u.role === 'Customer' ? 'active' : 'pending'}`}>
                          {u.isVerified || u.role === 'Customer' ? 'Verified' : 'Pending Verification'}
                        </div>
                      </td>
                      <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-row">
                          <button 
                            className="btn-icon" 
                            onClick={() => { setSelectedUser(u); setIsEditing(false); }}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="btn-icon"
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn-icon danger" 
                            onClick={() => handleDelete(userId, u.fullName)}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          isEditMode={isEditing}
          onClose={() => { setSelectedUser(null); setIsEditing(false); }} 
          onUpdate={() => { fetchUsers(); setSelectedUser(null); }}
        />
      )}
    </div>
  );
};

export default ManageUsers;
