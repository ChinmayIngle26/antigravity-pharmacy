import React, { useEffect, useState } from 'react';
import { getInventory, getAlerts, getOrderHistory } from '../api';
import { AlertTriangle, Package, History } from 'lucide-react';

const AdminDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');

  const fetchData = async () => {
    const invData = await getInventory();
    setInventory(invData);
    const alertData = await getAlerts();
    setAlerts(alertData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-[600px] w-full max-w-4xl flex flex-col">
      <div className="bg-slate-800 text-white p-4 font-bold flex justify-between items-center">
        <span>Admin Dashboard</span>
        <div className="text-xs bg-slate-700 px-2 py-1 rounded">Live Updates</div>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 p-3 font-medium flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'text-pharmacy-600 border-b-2 border-pharmacy-600' : 'text-gray-500'}`}
        >
          <Package size={18} /> Inventory
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 p-3 font-medium flex items-center justify-center gap-2 ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          <History size={18} /> History
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 p-3 font-medium flex items-center justify-center gap-2 ${activeTab === 'alerts' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
        >
          <AlertTriangle size={18} /> Alerts ({alerts.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {activeTab === 'inventory' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-200 text-gray-600 uppercase">
              <tr>
                <th className="p-2">Medicine</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 font-medium">{item.name}</td>
                  <td className="p-2">{item.stock}</td>
                  <td className="p-2">{item.unit}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.stock < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {item.stock < 20 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'history' && (
          <HistoryTab />
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No alerts active.</div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" />
                  <p className="text-red-800">{alert}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getOrderHistory();
      setHistory(data);
    };
    fetchHistory();
    // Poll for history updates
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  if (history.length === 0) return <div className="text-center text-gray-500 mt-10">No order history found.</div>;

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-200 text-gray-600 uppercase">
        <tr>
          <th className="p-2">Date</th>
          <th className="p-2">Patient</th>
          <th className="p-2">Medicine</th>
          <th className="p-2">Qty</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {history.map((h) => (
          <tr key={h.id}>
            <td className="p-2 text-gray-500">{h.date}</td>
            <td className="p-2 font-medium">{h.patient}</td>
            <td className="p-2">{h.medicine}</td>
            <td className="p-2">{h.qty}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminDashboard;
