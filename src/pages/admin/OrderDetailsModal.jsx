import React from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Calendar, User, ShoppingBag, CheckCircle2, Truck, ClipboardList, Timer, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import { SOCKET_URL } from '../../services/api';

const OrderDetailsModal = ({ order, onClose, onAssignRider }) => {
  if (!order) return null;

  const getStatusRank = (status) => {
    const map = {
      'PendingBidding': 0, 'BidSelected': 1, 'PickupScheduled': 2,
      'PickedUp': 3, 'InLaundry': 4, 'ReadyForDelivery': 5,
      'OutForDelivery': 6, 'Completed': 7
    };
    return map[status] ?? 0;
  };

  const rank = getStatusRank(order.status);

  const steps = [
    { label: 'Order Placed', status: rank >= 0 ? 'completed' : 'pending', icon: ClipboardList },
    { label: 'Dhobi Assigned', status: rank >= 1 ? 'completed' : 'pending', icon: User },
    { label: 'Pickup', status: rank >= 2 ? 'completed' : (rank === 2 ? 'current' : 'pending'), icon: Truck },
    { label: 'Laundering', status: rank >= 4 ? 'completed' : (rank === 4 ? 'current' : 'pending'), icon: Timer },
    { label: 'Delivered', status: rank >= 7 ? 'completed' : 'pending', icon: CheckCircle2 },
  ];

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SOCKET_URL}${path}`;
  };

  const modalContent = (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-header">
          <div className="p-header-left">
            <div className="id-badge">MANIFEST {order.id}</div>
            <h2 className="p-title">Logistical Overview</h2>
            <p className="p-subtitle">Order Lifecycle & Chain of Custody</p>
          </div>
          <button className="p-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-body">
          <div className="p-scroll-area">
            {/* Main Stats Row */}
            <div className="p-stats-grid">
              <div className="p-info-box">
                <div className="p-box-head">
                  <User size={14} className="text-primary" />
                  <span>Customer Details</span>
                </div>
                <div className="p-box-body">
                  <div className="p-main-text">{order.customerName || 'Anonymous'}</div>
                  <div className="p-sub-text">Registered Client</div>
                </div>
              </div>

              <div className="p-info-box">
                <div className="p-box-head">
                  <ShoppingBag size={14} className="text-secondary" />
                  <span>Service Package</span>
                </div>
                <div className="p-box-body">
                  <div className="p-main-text">{order.itemsCount} Pieces</div>
                  <div className="p-sub-text text-truncate">{order.serviceDescription}</div>
                </div>
              </div>

              <div className="p-info-box full-width">
                <div className="p-box-head">
                  <MapPin size={14} className="text-error" />
                  <span>Pickup Logistics</span>
                </div>
                <div className="p-box-body">
                  <div className="p-main-text">{order.pickupAddress}</div>
                  <div className="p-sub-text">Geocoded Location Verified</div>
                </div>
              </div>
            </div>

            {/* Visual Lifecycle */}
            <div className="p-section">
              <div className="p-section-header">
                <ShieldCheck size={16} />
                <h3>Order Lifecycle</h3>
              </div>
              <div className="p-lifecycle-track">
                {steps.map((step, idx) => (
                  <div key={idx} className={`p-step ${step.status}`}>
                    <div className="p-step-node">
                      <step.icon size={14} />
                      {step.status === 'completed' && (
                        <div className="node-check"><CheckCircle2 size={10} /></div>
                      )}
                    </div>
                    <span className="p-step-label">{step.label}</span>
                    {idx < steps.length - 1 && <div className="p-step-line" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Handover Evidence */}
            <div className="p-section no-border">
              <div className="p-section-header">
                <Info size={16} />
                <h3>Chain of Custody Evidence</h3>
              </div>
              
              <div className="p-evidence-grid">
                {[
                  { key: 'clothImageUrl', label: 'Initial Inventory', sub: 'Customer Upload' },
                  { key: 'pickupProofUrl', label: 'Rider Pickup', sub: 'Customer → Rider' },
                  { key: 'dhobiDropProofUrl', label: 'Dhobi Receipt', sub: 'Rider → Dhobi' },
                  { key: 'dhobiPickupProofUrl', label: 'Dhobi Handover', sub: 'Dhobi → Rider' },
                  { key: 'deliveryProofUrl', label: 'Final Delivery', sub: 'Rider → Customer' },
                  { key: 'proofImageUrl', label: 'Generic Proof', sub: 'Legacy/Misc' }
                ].map((evidence) => {
                  const url = order[evidence.key];
                  if (!url) return null;
                  
                  return (
                    <div key={evidence.key} className="p-evidence-item">
                      <div 
                        className="p-evidence-card-small"
                        onClick={() => window.open(getFullImageUrl(url), '_blank')}
                      >
                        <img src={getFullImageUrl(url)} alt={evidence.label} />
                        <div className="p-evidence-overlay">
                          <ExternalLink size={14} />
                        </div>
                      </div>
                      <div className="p-evidence-info">
                        <div className="p-ev-label">{evidence.label}</div>
                        <div className="p-ev-sub">{evidence.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!order.clothImageUrl && !order.pickupProofUrl && !order.dhobiDropProofUrl && 
               !order.dhobiPickupProofUrl && !order.deliveryProofUrl && !order.proofImageUrl && (
                <div className="p-evidence-empty">
                  <div className="empty-circle"><Info size={24} /></div>
                  <p>Handover proof pending field agent submission</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-footer">
          <div className="p-footer-left">
            {!order.riderId && order.status === 'BidSelected' && (
              <button className="p-btn-assign" onClick={() => onAssignRider(order.id)}>
                <Truck size={16} />
                Assign Logistics Agent
              </button>
            )}
            {order.status === 'Disputed' && (
              <button 
                className="p-btn-dispute" 
                onClick={() => {
                  window.location.href = `/admin/support?group=${order.id}`;
                }}
              >
                <ShieldCheck size={16} />
                Open Dispute Resolution
              </button>
            )}
          </div>
          <button className="p-btn-close" onClick={onClose}>Close Overview</button>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

          .premium-modal-overlay {
            position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(12px); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            padding: 24px; animation: pFadeIn 0.3s ease;
          }

          .premium-modal-content {
            background: rgba(255, 255, 255, 0.95);
            width: 100%; max-width: 720px; max-height: 90vh;
            border-radius: 32px; overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            display: flex; flex-direction: column;
            font-family: 'Outfit', sans-serif;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .p-header {
            padding: 32px 40px; border-bottom: 1px solid #F1F5F9;
            display: flex; justify-content: space-between; align-items: flex-start;
          }

          .id-badge {
            background: #E0F2FE; color: #0EA5E9; font-size: 0.7rem;
            font-weight: 800; padding: 4px 12px; border-radius: 100px;
            display: inline-block; margin-bottom: 12px; letter-spacing: 1px;
          }

          .p-title { font-size: 1.75rem; font-weight: 800; color: #0F172A; margin: 0; }
          .p-subtitle { font-size: 0.9rem; color: #64748B; margin-top: 4px; }

          .p-close-btn {
            background: #F8FAFC; border: none; width: 44px; height: 44px;
            border-radius: 14px; display: flex; align-items: center; justify-content: center;
            color: #64748B; cursor: pointer; transition: all 0.2s;
          }
          .p-close-btn:hover { background: #F1F5F9; color: #0F172A; transform: rotate(90deg); }

          .p-body { flex: 1; overflow: hidden; position: relative; }
          .p-scroll-area { padding: 32px 40px; overflow-y: auto; max-height: 60vh; }

          .p-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
          .p-info-box { 
            background: #F8FAFC; padding: 20px; border-radius: 20px;
            border: 1px solid #F1F5F9;
          }
          .p-info-box.full-width { grid-column: span 2; }
          .p-box-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
          .p-box-head span { font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
          .p-main-text { font-size: 1rem; font-weight: 700; color: #0F172A; }
          .p-sub-text { font-size: 0.85rem; color: #64748B; margin-top: 4px; }

          .p-section { margin-bottom: 40px; border-bottom: 1px solid #F1F5F9; padding-bottom: 40px; }
          .p-section.no-border { border-bottom: none; padding-bottom: 0; }
          .p-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; color: #0F172A; }
          .p-section-header h3 { font-size: 1rem; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px; }

          .p-lifecycle-track { display: flex; justify-content: space-between; position: relative; padding: 0 10px; }
          .p-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
          .p-step-node { 
            width: 44px; height: 44px; border-radius: 16px; background: #fff;
            display: flex; align-items: center; justify-content: center; color: #94A3B8;
            border: 2px solid #F1F5F9; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
          }
          .node-check {
             position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
             background: #10B981; border-radius: 6px; border: 2px solid #fff;
             display: flex; align-items: center; justify-content: center; color: #fff;
          }
          .p-step-line { 
            position: absolute; top: 22px; left: calc(50% + 22px); width: calc(100% - 44px); height: 2px;
            background: #F1F5F9; z-index: -1; transition: all 0.4s;
          }

          .p-step-label { font-size: 0.7rem; font-weight: 700; color: #94A3B8; margin-top: 14px; text-align: center; }

          .p-step.completed .p-step-node { background: #10B981; color: #fff; border-color: #10B981; scale: 1.1; }
          .p-step.completed .p-step-label { color: #10B981; }
          .p-step.completed .p-step-line { background: #10B981; }

          .p-step.current .p-step-node { background: #0EA5E9; color: #fff; border-color: #0EA5E9; box-shadow: 0 0 20px rgba(14,165,233,0.3); animation: pPulse 2s infinite; }
          .p-step.current .p-step-label { color: #0EA5E9; font-weight: 800; }

          .p-evidence-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
          .p-evidence-item { display: flex; flex-direction: column; gap: 8px; }
          .p-evidence-card-small { 
            width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden;
            position: relative; cursor: pointer; border: 2px solid #fff;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.2s; background: #f1f5f9;
          }
          .p-evidence-card-small:hover { transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .p-evidence-card-small img { width: 100%; height: 100%; object-fit: cover; }
          .p-evidence-overlay {
            position: absolute; inset: 0; background: rgba(14, 165, 233, 0.7);
            display: flex; align-items: center; justify-content: center;
            color: #fff; opacity: 0; transition: all 0.2s;
          }
          .p-evidence-card-small:hover .p-evidence-overlay { opacity: 1; }
          .p-evidence-info { padding: 0 4px; }
          .p-ev-label { font-size: 0.75rem; font-weight: 700; color: #0F172A; }
          .p-ev-sub { font-size: 0.65rem; color: #64748B; margin-top: 2px; }

          .p-evidence-meta { flex: 1; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
          .meta-row label { font-size: 0.75rem; font-weight: 600; color: #64748B; }
          .meta-row span { font-size: 0.85rem; font-weight: 700; color: #0F172A; }
          .status-badge-inline { color: #10B981 !important; }
          .meta-row.accent span { color: #0EA5E9; }
          .meta-desc { font-size: 0.8rem; color: #64748B; line-height: 1.5; margin-top: 12px; }

          .p-evidence-empty {
            background: #F8FAFC; border-radius: 24px; padding: 40px;
            display: flex; flex-direction: column; align-items: center; gap: 16px;
            border: 2px dashed #E2E8F0;
          }
          .empty-circle { width: 64px; height: 64px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #94A3B8; }
          .p-evidence-empty p { font-size: 0.85rem; color: #94A3B8; font-weight: 500; }

          .p-footer {
            padding: 32px 40px; border-top: 1px solid #F1F5F9;
            display: flex; justify-content: space-between; align-items: center;
          }

          .p-btn-assign {
            background: #0F172A; color: #fff; border: none;
            padding: 14px 28px; border-radius: 16px; font-weight: 700;
            display: flex; align-items: center; gap: 10px; cursor: pointer;
            transition: all 0.2s;
          }
          .p-btn-assign:hover { background: #1E293B; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); }
          
          .p-btn-dispute {
            background: #FEF2F2; color: #EF4444; border: 1.5px solid #FEE2E2;
            padding: 14px 28px; border-radius: 16px; font-weight: 700;
            display: flex; align-items: center; gap: 10px; cursor: pointer;
            transition: all 0.2s;
          }
          .p-btn-dispute:hover { background: #EF4444; color: #fff; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.3); }

          .p-btn-close {
            background: transparent; color: #64748B; border: 1.5px solid #E2E8F0;
            padding: 12px 24px; border-radius: 14px; font-weight: 700;
            cursor: pointer; transition: all 0.2s;
          }
          .p-btn-close:hover { background: #F8FAFC; color: #0F172A; border-color: #0F172A; }

          .text-primary { color: #0EA5E9; }
          .text-secondary { color: #10B981; }
          .text-error { color: #EF4444; }

          @keyframes pFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes pPulse { 0% { box-shadow: 0 0 0 0 rgba(14,165,233,0.4); } 70% { box-shadow: 0 0 0 15px rgba(14,165,233,0); } 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); } }

          .p-scroll-area::-webkit-scrollbar { width: 6px; }
          .p-scroll-area::-webkit-scrollbar-track { background: transparent; }
          .p-scroll-area::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        `}</style>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OrderDetailsModal;
