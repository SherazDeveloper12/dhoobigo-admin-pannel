import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const OrderTrackingMap = ({ orders = [] }) => {
  const center = [31.5204, 74.3587]; // Lahore, Pakistan

  return (
    <div className="admin-map-container panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Operations Map</h3>
          <p className="panel-sub">Live visual tracking of fleet and orders</p>
        </div>
      </div>
      
      <div className="map-view">
        <MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {orders.filter(o => o.latitude && o.longitude).map((order) => (
            <Marker key={order.id} position={[order.latitude, order.longitude]}>
              <Popup>
                <div className="map-popup">
                  <strong>Order #ORD-{order.id}</strong>
                  <p>{order.serviceDescription}</p>
                  <span className={`status-badge ${order.status.toLowerCase().replace(' ', '')}`}>
                    {order.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        .admin-map-container {
          margin-top: 24px;
          overflow: hidden;
        }
        .map-view {
          padding: 1px;
        }
        .map-popup {
          font-family: 'Inter', sans-serif;
          min-width: 150px;
        }
        .map-popup strong {
          display: block;
          margin-bottom: 4px;
          color: var(--text-1);
        }
        .map-popup p {
          margin: 0 0 8px;
          font-size: 0.85rem;
          color: var(--text-2);
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default OrderTrackingMap;
