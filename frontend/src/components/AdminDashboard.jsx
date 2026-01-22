import React, { useEffect, useState } from 'react';
import { getInventory, getAlerts, getOrderHistory } from '../api';
import { AlertTriangle, Package, History, DollarSign, Activity, TrendingUp } from 'lucide-react';

import { Users } from 'lucide-react'; // Import Users icon

const AdminDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [totalValue, setTotalValue] = useState(0);

  const fetchData = async () => {
    const invData = await getInventory();
    setInventory(invData);
    
    // Calculate total inventory value
    const val = invData.reduce((acc, item) => acc + (item.stock * (item.price || 0)), 0);
    setTotalValue(val);

    const alertData = await getAlerts();
    setAlerts(alertData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl overflow-hidden h-[700px] w-full max-w-5xl flex flex-col border border-white/10">
      {/* Header */}
      <div className="p-6 bg-white/5 backdrop-blur-md border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            Pharmacy Command Center
          </h1>
          <p className="text-gray-400 text-sm">Real-time surveillance & inventory control</p>
        </div>
        <div className="flex gap-4">
           {/* Metric Card */}
           <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                <DollarSign size={18} />
              </div>
              <div>
                 <div className="text-xs text-green-300 uppercase font-bold">Total Value</div>
                 <div className="text-lg font-mono font-bold">${totalValue.toLocaleString()}</div>
              </div>
           </div>
           
           <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                <Activity size={18} />
              </div>
              <div>
                 <div className="text-xs text-blue-300 uppercase font-bold">System Status</div>
                 <div className="text-lg font-mono font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black/20">
        <TabButton 
          active={activeTab === 'inventory'} 
          onClick={() => setActiveTab('inventory')} 
          icon={<Package size={18} />} 
          label="Inventory" 
        />
        <TabButton 
          active={activeTab === 'patients'} 
          onClick={() => setActiveTab('patients')} 
          icon={<Users size={18} />} 
          label="Patients" 
        />
        <TabButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History size={18} />} 
          label="Sales History" 
        />
        <TabButton 
          active={activeTab === 'alerts'} 
          onClick={() => setActiveTab('alerts')} 
          icon={<AlertTriangle size={18} />} 
          label={`Alerts ${alerts.length > 0 ? `(${alerts.length})` : ''}`}
          alert={alerts.length > 0} 
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-black/20 backdrop-blur-sm">
        {activeTab === 'inventory' && <InventoryTable data={inventory} />}
        {activeTab === 'patients' && <PatientsPanel />}
        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'alerts' && <AlertsPanel alerts={alerts} />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, alert }) => (
  <button 
    onClick={onClick}
    className={`flex-1 p-4 font-medium flex items-center justify-center gap-2 transition-all duration-200
      ${active 
        ? 'bg-white/10 text-white border-b-2 border-blue-400 shadow-[inset_0_-2px_10px_rgba(59,130,246,0.3)]' 
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
      }
      ${alert && !active ? 'text-red-400 animate-pulse' : ''}
    `}
  >
    {icon} {label}
  </button>
);

const InventoryTable = ({ data }) => (
  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl">
    <table className="w-full text-left">
      <thead className="bg-black/40 text-gray-400 uppercase text-xs tracking-wider">
        <tr>
          <th className="p-4">Medicine</th>
          <th className="p-4">Price</th>
          <th className="p-4">Stock</th>
          <th className="p-4">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-white/5 transition-colors group">
            <td className="p-4 font-medium text-white group-hover:text-blue-300 transition-colors">
              {item.name}
              <div className="text-xs text-gray-500">{item.unit}</div>
            </td>
            <td className="p-4 font-mono text-gray-300">${item.price?.toFixed(2)}</td>
             <td className="p-4">
                <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${item.stock < 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{width: `${Math.min(item.stock, 100)}%`}}
                        ></div>
                    </div>
                    <span className="font-mono text-sm">{item.stock}</span>
                </div>
            </td>
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                item.stock < 50 
                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                  : 'bg-green-500/20 text-green-400 border-green-500/30'
              }`}>
                {item.stock < 50 ? 'Low Stock' : 'Optimal'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const HistoryPanel = () => {
    const [history, setHistory] = useState([]);
    
    useEffect(() => {
        const fetchHistory = async () => {
             const data = await getOrderHistory();
             setHistory(data);
        };
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    if (history.length === 0) return <div className="text-center text-gray-500 mt-10">No records found.</div>;

    return (
        <div className="space-y-3">
            {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-white">{h.medicine}</div>
                            <div className="text-xs text-gray-400">RX: {h.patient}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-mono font-bold text-green-400">+{h.qty}</div>
                        <div className="text-xs text-gray-500">{h.date}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AlertsPanel = ({ alerts }) => (
  <div className="space-y-4">
    {alerts.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
        <Activity size={48} className="mb-4" />
        <p>All systems nominal. No active alerts.</p>
      </div>
    ) : (
      alerts.map((alert, idx) => (
        <div key={idx} className="bg-red-500/10 border border-red-500/40 p-4 rounded-xl shadow-lg flex items-start gap-4 backdrop-blur-md">
          <div className="p-2 bg-red-500/20 rounded-full text-red-500 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-400 text-lg">System Alert</h3>
            <p className="text-red-200/80 leading-relaxed mt-1">{alert}</p>
          </div>
        </div>
      ))
    )}
  </div>
);

// ... (Helper Components)

const PatientsPanel = () => {
  const [patients, setPatients] = React.useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      // Assuming api.js exports getPatients
      const { getPatients } = await import('../api'); 
      const data = await getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {patients.map((p) => (
        <div key={p.id} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-white">{p.name}</h3>
              <div className="text-sm text-gray-400">ID: #{p.id.toString().padStart(4, '0')} • Age: {p.age}</div>
            </div>
            <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Active</div>
          </div>
          
          <div className="space-y-2 mt-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Allergies</div>
              <div className="flex flex-wrap gap-2">
                {p.allergies && p.allergies !== "None" ? (
                  p.allergies.split(',').map((alg, i) => (
                    <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs border border-red-500/30">
                      {alg.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No known allergies</span>
                )}
              </div>
            </div>
            
             <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Conditions</div>
              <div className="text-sm text-gray-300">{p.conditions || "None"}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
