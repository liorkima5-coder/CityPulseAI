import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from './supabaseClient';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CENTER_JERUSALEM = [31.7767, 35.2345];

export default function MapView() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*, categories(name)')
      .neq('status', 'סגור'); 

    if (data) {
      const processedTickets = data.map((t) => {
        if (t.lat && t.lng) return { ...t, isReal: true };
        return {
          ...t,
          lat: CENTER_JERUSALEM[0] + (Math.random() - 0.5) * 0.03,
          lng: CENTER_JERUSALEM[1] + (Math.random() - 0.5) * 0.03,
          isReal: false
        };
      });
      setTickets(processedTickets);
    }
  };

  return (
    <div className="h-full w-full relative z-0 bg-[#0f172a]"> 
       <MapContainer center={CENTER_JERUSALEM} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", borderRadius: "1.5rem", background: '#0f172a' }}>
        <TileLayer
          className="dark-map-tiles" // <--- הקסם קורה כאן
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {tickets.map(ticket => (
          <Marker key={ticket.id} position={[ticket.lat, ticket.lng]}>
            <Popup className="custom-popup">
              <div className="text-right p-1" dir="rtl">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-slate-900">{ticket.categories?.name}</strong>
                  {ticket.isReal && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded font-bold">GPS</span>}
                </div>
                <p className="text-xs text-slate-500 mb-1">{ticket.issue_address}</p>
                <div className={`text-xs font-bold inline-block px-2 py-0.5 rounded ${ticket.status === 'חדש' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  {ticket.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}