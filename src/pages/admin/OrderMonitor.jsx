import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Search, Filter, MapPin, ShoppingBag, ArrowUpRight } from 'lucide-react';
import OrderTrackingMap from './OrderTrackingMap';
import OrderDetailsModal from './OrderDetailsModal';

const OrderMonitor = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await adminService.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAssignRider = async (orderId) => {
    const ids = Array.isArray(orderId) ? orderId : [orderId];
    try {
      // Logic would call API to assign first available rider to these IDs
      console.log('Assigning rider for orders:', ids);
      // await adminService.assignBatchRider(ids);
      alert(`${ids.length} Order(s) assigned to available logistics agent! (Mock Logic)`);
      fetchOrders();
      setSelectedOrder(null);
      setSelectedIds([]);
    } catch (err) {
      alert('Could not assign rider(s).');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const statusClass = (s) => s ? s.toLowerCase().replace(' ', '') : 'pending';

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Service Stream</h1>
          <p className="page-subtitle">Real-time monitoring of transactions and laundry movements.</p>
        </div>
      </div>

      <div className="monitor-grid">
        {/* Feed */}
        <div className="panel flex-3">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Live Feed</h3>
              <p className="panel-sub">Active transactions in the city</p>
            </div>
            {selectedIds.length > 0 && (
              <div className="batch-actions">
                <button 
                  className="btn-batch-assign"
                  onClick={() => handleAssignRider(selectedIds)}
                >
                  Assign {selectedIds.length} Orders
                </button>
              </div>
            )}
          </div>

          <div className="feed-list">
            {loading ? (
              <div className="p-4 text-center">Crunching live data...</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={`feed-item ${selectedIds.includes(order.id) ? 'selected' : ''}`}>
                  <div className="item-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                    />
                  </div>
                  <div className="item-main" onClick={() => toggleSelect(order.id)} style={{ cursor: 'pointer' }}>
                    <div className={`status-pip ${statusClass(order.status)}`} />
                    <div className="details">
                      <span className="id">#ORD-{order.id}</span>
                      <h4>{order.customerName || 'Customer'} <span className="arrow">→</span> {order.serviceDescription}</h4>
                      <div className="meta">
                        <span><MapPin size={11} /> {order.pickupAddress.split(',')[0]}</span>
                        <span><ShoppingBag size={11} /> {order.itemsCount} Pieces</span>
                      </div>
                    </div>
                  </div>
                  <div className="item-action">
                    <span className={`status-txt ${statusClass(order.status)}`}>{order.status}</span>
                    <button 
                      className="btn-details"
                      onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                    >
                      Details <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Visualization */}
        <div className="flex-4">
          <OrderTrackingMap orders={orders} />
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onAssignRider={handleAssignRider}
        />
      )}
    </div>
  );
};

export default OrderMonitor;
