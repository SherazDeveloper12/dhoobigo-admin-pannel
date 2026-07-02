import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { adminService, BASE_IP, BASE_PORT } from '../../services/api';
import { X, User, Mail, Phone, MapPin, ShieldCheck, Activity, Image as ImageIcon, CheckCircle, FileText, Smartphone, Bike, Store, Info, Wallet } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const IMAGE_BASE = `http://${BASE_IP}:${BASE_PORT}`;

const DocCard = ({ label, labelUrdu, url }) => {
  const [zoomed, setZoomed] = useState(false);
  const fullUrl = url ? (url.startsWith('http') ? url : `${IMAGE_BASE}${url}`) : null;

  return (
    <>
      <div 
        onClick={() => url && setZoomed(true)}
        style={{ 
          background: '#FFFFFF', border: '1px solid var(--card-border)', borderRadius: '20px', 
          overflow: 'hidden', cursor: url ? 'pointer' : 'default', transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}
        className="doc-hover"
      >
        <div style={{ position: 'relative' }}>
          {url ? (
            <img src={fullUrl} alt={label} style={{ width: '100%', aspectRatio: '1.5', objectFit: 'cover' }} />
          ) : (
            <div style={{ aspectRatio: '1.5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)', color: '#94A3B8', gap: '8px' }}>
              <ImageIcon size={24} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Not Provided</span>
            </div>
          )}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '2px' }}>{label}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600 }}>{labelUrdu}</div>
        </div>
      </div>

      {zoomed && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          onClick={() => setZoomed(false)}
        >
           <img src={fullUrl} style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
           <button style={{ position: 'absolute', top: 40, right: 40, background: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <X size={24} />
           </button>
        </div>
      )}
    </>
  );
};

const UserDetailsModal = ({ user: rawUser, onClose, onUpdate }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const isProfessional = (rawUser.role || rawUser.Role) === 'Dhobi' || (rawUser.role || rawUser.Role) === 'Rider';
  const [activeTab, setActiveTab] = useState(isProfessional ? 'docs' : 'info'); 

  const user = {
    ...rawUser,
    id: rawUser.id || rawUser.userId,
    fullName: rawUser.fullName || rawUser.FullName,
    role: rawUser.role || rawUser.Role,
    email: rawUser.email || rawUser.Email,
    phoneNumber: rawUser.phoneNumber || rawUser.PhoneNumber,
    address: rawUser.address || rawUser.Address,
    cnicNumber: rawUser.cnicNumber || rawUser.CnicNumber,
    shopName: rawUser.shopName || rawUser.ShopName || 'Personal Business',
    vehicleNumber: rawUser.vehicleNumber || rawUser.VehicleNumber,
    isVerified: rawUser.isVerified || rawUser.IsVerified,
    profilePictureUrl: rawUser.profilePictureUrl || rawUser.ProfilePictureUrl,
    cnicImageUrl: rawUser.cnicImageUrl || rawUser.CnicImageUrl,
    selfieWithIdUrl: rawUser.selfieWithIdUrl || rawUser.SelfieWithIdUrl,
    policeVerificationUrl: rawUser.policeVerificationUrl || rawUser.PoliceVerificationUrl,
    drivingLicenseUrl: rawUser.drivingLicenseUrl || rawUser.DrivingLicenseUrl,
    vehicleRegistrationUrl: rawUser.vehicleRegistrationUrl || rawUser.VehicleRegistrationUrl,
    vehicleImageUrl: rawUser.vehicleImageUrl || rawUser.VehicleImageUrl,
    electricityBillUrl: rawUser.electricityBillUrl || rawUser.ElectricityBillUrl,
    equipmentImageUrl: rawUser.equipmentImageUrl || rawUser.EquipmentImageUrl,
    businessLicenseUrl: rawUser.businessLicenseUrl || rawUser.BusinessLicenseUrl,
  };

  const fetchWallet = async () => {
    try {
      const response = await adminService.getUserWallet(user.id);
      setWallet(response.data);
    } catch (err) {
      console.warn('Failed to fetch wallet for user:', user.id);
    }
  };

  useEffect(() => {
    if (activeTab === 'finance') {
      fetchWallet();
    }
  }, [user.id, activeTab]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await adminService.verifyUser(user.id);
      addToast(`${user.role} Verified!`, 'success');
      onUpdate();
      onClose();
    } catch (err) {
      addToast('Error during verification.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantCredit = async (amount) => {
    setLoading(true);
    try {
      await adminService.adjustUserBalance(user.id, amount, `Admin Simulator Credit (+${amount})`);
      addToast(`Granting Rs. ${amount.toLocaleString()}...`, 'info');
      await fetchWallet();
      addToast(`Funds successfully Manifested in Ledger.`, 'success');
    } catch (err) {
      addToast('Financial bypass failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' }} onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '900px', maxHeight:'90vh', background: 'white', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Fixed Header */}
        <div style={{ background: 'var(--primary)', padding: '30px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '20px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', background: 'white' }}>
                 {user.profilePictureUrl ? (
                    <img src={`${IMAGE_BASE}${user.profilePictureUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={30} color="var(--text-3)" /></div>}
              </div>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '2px' }}>{user.fullName}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>{user.role} Partner</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>#{user.id} Registry</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#F8FAFC', padding: '12px 30px', borderBottom: '1px solid var(--border-light)' }}>
          {isProfessional && (
            <button 
              className={`admin-tab ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
              style={{ 
                background: activeTab === 'docs' ? 'white' : 'transparent', 
                border: 'none', 
                boxShadow: activeTab === 'docs' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', color: activeTab === 'docs' ? 'var(--primary)' : 'var(--text-3)', cursor: 'pointer', transition: '0.2s'
              }}
            >
              Verification Data
            </button>
          )}
          <button 
            className={`admin-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            style={{ 
              background: activeTab === 'info' ? 'white' : 'transparent', 
              border: 'none', 
              boxShadow: activeTab === 'info' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              padding: '10px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-3)', cursor: 'pointer', transition: '0.2s', marginLeft: 10
            }}
          >
            Partner Intelligence
          </button>
          <button 
            className={`admin-tab ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
            style={{ 
              background: activeTab === 'finance' ? 'white' : 'transparent', 
              border: 'none', 
              boxShadow: activeTab === 'finance' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              padding: '10px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', color: activeTab === 'finance' ? 'var(--primary)' : 'var(--text-3)', cursor: 'pointer', transition: '0.2s', marginLeft: 10
            }}
          >
            Financial Ledger
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {activeTab === 'docs' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {isProfessional && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <ShieldCheck size={18} color="var(--primary)" />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase' }}>Government Compliance</h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <DocCard label="CNIC FRONT" labelUrdu="شناختی کارڈ فرنٹ" url={user.cnicImageUrl} />
                    <DocCard label="ID SELFIE" labelUrdu="شناختی کارڈ کے ساتھ تصویر" url={user.selfieWithIdUrl} />
                    <DocCard label="POLICE REPORT" labelUrdu="پولیس رپورٹ" url={user.policeVerificationUrl} />
                  </div>
                </section>
              )}

              {user.role === 'Dhobi' && (
                <section>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Store size={18} color="var(--primary)" />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase' }}>Physical Infrastructure</h4>
                    </div>
                    <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: '16px', marginBottom:'16px', border: '1px solid var(--border-light)' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)' }}>IDENTIFIED SHOP NAME:</span>
                       <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)', marginTop:'4px' }}>{user.shopName}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <DocCard label="ELECTRICITY BILL" labelUrdu="بجلی کا بل" url={user.electricityBillUrl} />
                      <DocCard label="EQUIPMENT PHOTO" labelUrdu="مشینری کی تصویر" url={user.equipmentImageUrl} />
                      <DocCard label="SHOP LICENSE" labelUrdu="دکان کا ثبوت" url={user.businessLicenseUrl} />
                    </div>
                </section>
              )}

              {user.role === 'Rider' && (
                <section>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Bike size={18} color="var(--primary)" />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase' }}>Logistics Verification</h4>
                    </div>
                    <div style={{ background: 'var(--bg-light)', padding: '16px', borderRadius: '16px', marginBottom:'16px', border: '1px solid var(--border-light)' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)' }}>VEHICLE IDENTIFIER:</span>
                       <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-1)', marginTop:'4px', fontFamily:'monospace' }}>{user.vehicleNumber}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <DocCard label="DRIVING LICENSE" labelUrdu="ڈرائیونگ لائسنس" url={user.drivingLicenseUrl} />
                      <DocCard label="BIKE BOOK" labelUrdu="بائیک کے کاغذات" url={user.vehicleRegistrationUrl} />
                      <DocCard label="BIKE PHOTO" labelUrdu="بائیک کی تصویر" url={user.vehicleImageUrl} />
                    </div>
                </section>
              )}
            </div>
          ) : activeTab === 'info' ? (
            <div style={{ display: 'grid', gridTemplateColumns: isProfessional ? '1fr 1fr' : '1fr', gap: '30px' }}>
              <div style={{ background: 'white', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '24px' }}>
                 <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>Contact Points</label>
                 <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                       <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Smartphone size={18} color="var(--primary)" /></div>
                       <div><div style={{ fontWeight: 800, color: 'var(--text-1)' }}>{user.phoneNumber}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Primary Mobile</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                       <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={18} color="var(--primary)" /></div>
                       <div><div style={{ fontWeight: 800, color: 'var(--text-1)' }}>{user.email}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Official Email</div></div>
                    </div>
                 </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap: '16px' }}>
                  {isProfessional && (
                    <div style={{ background: 'var(--accent-light)', border: '1px solid rgba(16,185,129,0.2)', padding: '24px', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)' }}>VETTING STATUS</span><Activity size={14} color="var(--accent)" /></div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)' }}>{user.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}</div>
                    </div>
                  )}
                  {isProfessional && (
                    <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-3)' }}>IDENTIFIER</span><Info size={14} color="var(--text-3)" /></div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-1)' }}>{user.cnicNumber || 'DOCS MISSING'}</div>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ background: '#0F172A', color: 'white', padding: '40px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Standing</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, marginTop: '8px' }}>Rs. {(wallet?.balance || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', textAlign: 'center', minWidth: '120px' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>LEDGER STATUS</div>
                     <div style={{ fontWeight: 900, fontSize: '1.1rem', color: (wallet?.balance || 0) < 0 ? '#F87171' : '#34D399', marginTop: '4px' }}>
                        {(wallet?.balance || 0) < 0 ? 'DEFICIT' : 'HEALTHY'}
                     </div>
                  </div>
               </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button 
                        onClick={() => handleGrantCredit(5000)}
                        disabled={loading}
                        style={{ width: '100%', background: 'white', border: '2px dashed var(--primary)', padding: '24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s' }}
                        className="finance-btn"
                      >
                         <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>SIMULATOR CREDIT</div>
                         <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-1)' }}>Grant Rs. 5,000</div>
                      </button>
                      <button 
                        onClick={() => handleGrantCredit(-5000)}
                        disabled={loading}
                        style={{ width: '100%', background: 'white', border: '2px dashed #EF4444', padding: '24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s' }}
                        className="finance-btn-danger"
                      >
                         <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>SIMULATOR DEBIT</div>
                         <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-1)' }}>Deduct Rs. 5,000</div>
                      </button>
                   </div>
 
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <button 
                        onClick={() => handleGrantCredit(10000)}
                        disabled={loading}
                        style={{ width: '100%', background: 'white', border: '2px dashed var(--accent)', padding: '24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s' }}
                        className="finance-btn-alt"
                      >
                         <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>SIMULATOR CREDIT</div>
                         <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-1)' }}>Grant Rs. 10,000</div>
                      </button>
                      <button 
                        onClick={() => handleGrantCredit(-10000)}
                        disabled={loading}
                        style={{ width: '100%', background: 'white', border: '2px dashed #EF4444', padding: '24px', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s' }}
                        className="finance-btn-danger"
                      >
                         <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>SIMULATOR DEBIT</div>
                         <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-1)' }}>Deduct Rs. 10,000</div>
                      </button>
                   </div>
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 30px', background: '#F8FAFC', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', padding: '14px 32px', borderRadius: '16px', fontWeight: 800, color: 'var(--text-2)', cursor: 'pointer' }}>Close Review</button>
           {!user.isVerified && (
             <button 
                onClick={handleVerify}
                disabled={loading}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}
             >
                {loading ? 'Processing...' : `Approve ${user.role} Partner`}
             </button>
           )}
        </div>

        <style>{`
          .doc-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: var(--primary) !important; }
          .admin-tab:hover { background: #EEF2FF !important; color: var(--primary) !important; }
          .admin-tab.active { background: white !important; color: var(--primary) !important; }
          .finance-btn:hover { background: #F0F9FF !important; border-style: solid !important; border-color: var(--primary) !important; transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(15, 23, 42, 0.1); }
          .finance-btn-alt:hover { background: #ECFDF5 !important; border-style: solid !important; border-color: var(--accent) !important; transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(16, 185, 129, 0.1); }
          .finance-btn-danger:hover { background: #FEF2F2 !important; border-style: solid !important; border-color: #EF4444 !important; transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(239, 68, 68, 0.1); }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default UserDetailsModal;
