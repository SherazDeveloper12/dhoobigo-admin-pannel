import { useEffect, useState } from 'react';
import { adminService, BASE_IP, BASE_PORT } from '../../services/api';
import { useAdminData } from '../../context/AdminDataContext';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, Shield, Calendar, Info, ExternalLink, XCircle, User } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';

const DhobiVerification = () => {
  const { users, loading, fetchUsers } = useAdminData();
  const [activeTab, setActiveTab] = useState('Dhobi');
  const [apps, setApps] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToast();

  const tabs = ['Dhobi', 'Rider', 'Tier Upgrades'];

  const fetchUpgrades = async () => {
    try {
      const resp = await adminService.getPendingUpgrades();
      setApps(resp.data.map(u => ({
        ...u,
        id: u.userId,
        name: u.fullName,
        shop: u.shopName || 'Upgrade Request',
        location: u.email,
        type: 'Upgrade',
        targetRole: u.requestedRole,
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
        cnic: u.requestedRole,
        isUpgrade: true
      })));
    } catch (e) {
      addToast('Failed to fetch upgrade requests', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'Tier Upgrades') {
      fetchUpgrades();
    } else {
      fetchUsers();
    }
  }, [fetchUsers, activeTab]);

  useEffect(() => {
    if (activeTab !== 'Tier Upgrades' && users && Array.isArray(users)) {
      const pending = users.filter(u => u.role === activeTab && !u.isVerified);
      setApps(pending.map(u => ({
        ...u, 
        id: u.userId || u.id,
        name: u.fullName || u.FullName,
        shop: u.shopName || u.ShopName || (u.role === 'Dhobi' ? 'Independent Shop' : 'Delivery Rider'),
        location: u.address || u.Address || 'Pending Details',
        type: u.role,
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
        cnic: u.cnicNumber || u.CnicNumber || 'Not Provided',
      })));
    }
  }, [users, activeTab]);

  const handleApprove = async (id) => {
    const isUpgrade = activeTab === 'Tier Upgrades';
    setApps(prev => prev.filter(a => a.id !== id));
    
    try {
      if (isUpgrade) {
        await adminService.approveUpgrade(id, true);
      } else {
        await adminService.verifyUser(id);
      }
      addToast(isUpgrade ? 'Tier upgraded!' : 'Provider approved!', 'success');
      fetchUsers(true);
      if (isUpgrade) fetchUpgrades();
    } catch (error) {
      addToast('Action failed', 'error');
      fetchUsers(true);
    }
  };

  const handleReject = async (id) => {
    const isUpgrade = activeTab === 'Tier Upgrades';
    setApps(prev => prev.filter(a => a.id !== id));

    try {
      if (isUpgrade) {
        await adminService.approveUpgrade(id, false);
      } else {
        await adminService.deleteUser(id);
      }
      addToast(isUpgrade ? 'Upgrade rejected' : 'Application rejected', 'info');
      fetchUsers(true);
      if (isUpgrade) fetchUpgrades();
    } catch (error) {
      addToast('Action failed', 'error');
      fetchUsers(true);
    }
  };

  const IMAGE_BASE = `http://${BASE_IP}:${BASE_PORT}`;

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Identity & Trust Hub</h1>
          <p className="page-subtitle">Perform rigorous vetting of new platform partners.</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--accent-light)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:'10px 18px' }}>
          <CheckCircle2 size={16} color="var(--accent)" />
          <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--accent)' }}>{apps.length} Applications Pending</span>
        </div>
      </div>

      <div className="panel animate-fade" style={{ marginBottom: '24px', padding: 0 }}>
        <div className="panel-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Tier Upgrades' ? 'Partner Growth' : `${tab} Applicants`}
              <span className="tab-count">
                {tab === 'Tier Upgrades' 
                  ? users?.filter(u => u.isUpgradePending).length || 0 
                  : users?.filter(u => u.role === tab && !u.isVerified).length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="verification-grid">
        {loading.users ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Syncing with Hub...</div>
        ) : apps.map((app, index) => (
          <div key={app.id} className="app-card animate-fade" style={{ animationDelay: `${index * 0.08}s` }} onClick={() => setSelectedUser(app)}>
            <div className="app-header">
              <div className="shop-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)', position: 'relative', overflow: 'hidden' }}>
                {app.profilePictureUrl ? (
                  <img 
                    src={app.profilePictureUrl.startsWith('http') ? app.profilePictureUrl : `${IMAGE_BASE}${app.profilePictureUrl}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <User size={22} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-1)' }}>{app.shop}</h3>
                <span className="app-id">LID #{app.id}</span>
              </div>
            </div>

            <div className="app-body" style={{ marginTop: '16px' }}>
              <div className="info-row">
                <span className="label">Partner Name</span>
                <span className="value" style={{ fontWeight: 700 }}>{app.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Govt ID / CNIC</span>
                <span className="value" style={{ color: 'var(--primary)', fontWeight: 800 }}>{app.cnic}</span>
              </div>
              <div className="info-row">
                <span className="label">Registered</span>
                <span className="value-with-icon" style={{ fontSize: '0.8rem' }}><Calendar size={13} /> {app.joined}</span>
              </div>
            </div>

            <div className="doc-preview" style={{ marginTop: '20px', border: '1px dashed var(--border)', background: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={14} color="var(--primary)" />
                <span style={{ fontSize:'0.75rem', color:'var(--text-2)', fontWeight: 700 }}>Review Verification Assets</span>
              </div>
              <ExternalLink size={12} color="var(--text-3)" />
            </div>

            <div className="app-footer" onClick={e => e.stopPropagation()} style={{ marginTop: '20px' }}>
              <button className="btn-reject" onClick={() => handleReject(app.id)}>Reject</button>
              <button className="btn-approve" onClick={() => handleApprove(app.id)}>
                Approve {app.type}
              </button>
            </div>
          </div>
        ))}

        {!loading.users && apps.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px' }}>
            <CheckCircle2 size={56} color="var(--accent)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text-1)', marginBottom:8 }}>All Verified!</h3>
            <p style={{ color:'var(--text-2)', fontSize:'0.95rem' }}>The ecosystem is fully secure at this time.</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdate={() => { fetchUsers(true); setSelectedUser(null); }} 
        />
      )}
    </div>
  );
};

export default DhobiVerification;
