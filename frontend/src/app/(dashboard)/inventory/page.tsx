'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Truck, 
  RefreshCcw, 
  X, 
  PlusCircle, 
  MinusCircle, 
  SlidersHorizontal,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

interface IInventoryItem {
  _id: string;
  name: string;
  category: 'Explosives' | 'Equipment' | 'Safety' | 'Spare Parts' | 'Chemicals';
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  supplier: {
    name: string;
    contact: string;
  };
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const { user } = useAuthStore();
  
  // Data State
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Modals UI States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null);
  
  // Form State - Add New Item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Explosives' | 'Equipment' | 'Safety' | 'Spare Parts' | 'Chemicals'>('Safety');
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [newItemUnit, setNewItemUnit] = useState('units');
  const [newItemMinThreshold, setNewItemMinThreshold] = useState(0);
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemSupplierName, setNewItemSupplierName] = useState('');
  const [newItemSupplierContact, setNewItemSupplierContact] = useState('');
  const [formError, setFormError] = useState('');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Form State - Adjust Stock
  const [adjustAction, setAdjustAction] = useState<'RESTOCK' | 'CONSUME'>('RESTOCK');
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustError, setAdjustError] = useState('');
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const url = activeCategory === 'All' ? '/inventory' : `/inventory?category=${activeCategory}`;
      const { data } = await api.get(url);
      setItems(data.data.items);
    } catch (err: any) {
      console.error('Failed to load inventory stocks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [activeCategory]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!newItemName.trim() || !newItemLocation.trim() || !newItemSupplierName.trim() || !newItemSupplierContact.trim()) {
      setFormError('All fields including complete supplier details are required.');
      return;
    }

    if (newItemQuantity < 0 || newItemMinThreshold < 0) {
      setFormError('Quantity and Min Threshold cannot be negative values.');
      return;
    }

    setSubmittingItem(true);
    try {
      await api.post('/inventory', {
        name: newItemName,
        category: newItemCategory,
        quantity: newItemQuantity,
        unit: newItemUnit,
        minThreshold: newItemMinThreshold,
        location: newItemLocation,
        supplier: {
          name: newItemSupplierName,
          contact: newItemSupplierContact
        }
      });

      // Clear states & Reload
      setNewItemName('');
      setNewItemCategory('Safety');
      setNewItemQuantity(0);
      setNewItemUnit('units');
      setNewItemMinThreshold(0);
      setNewItemLocation('');
      setNewItemSupplierName('');
      setNewItemSupplierContact('');
      setShowAddModal(false);
      await loadInventory();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to create inventory item.';
      setFormError(errMsg);
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleAdjustQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError('');

    if (!selectedItem) return;

    if (adjustAmount <= 0) {
      setAdjustError('Adjustment amount must be greater than zero.');
      return;
    }

    if (adjustAction === 'CONSUME' && selectedItem.quantity < adjustAmount) {
      setAdjustError(`Insufficient warehouse stock. Current active: ${selectedItem.quantity} ${selectedItem.unit}`);
      return;
    }

    setSubmittingAdjustment(true);
    try {
      await api.post(`/inventory/${selectedItem._id}/adjust`, {
        amount: adjustAmount,
        action: adjustAction
      });

      setAdjustAmount(0);
      setShowAdjustModal(false);
      setSelectedItem(null);
      await loadInventory();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to adjust inventory count.';
      setAdjustError(errMsg);
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this inventory item listing from the warehouse registers?')) {
      return;
    }

    try {
      await api.delete(`/inventory/${id}`);
      await loadInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete inventory item.');
    }
  };

  // Helper stats
  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.quantity <= item.minThreshold).length;
  const criticalSafetyItems = items.filter(item => item.category === 'Safety' && item.quantity <= item.minThreshold).length;

  const categories = ['All', 'Explosives', 'Equipment', 'Safety', 'Spare Parts', 'Chemicals'];

  // Search filter
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.supplier.name.toLowerCase().includes(query)
    );
  });

  const canManageItems = user?.role === 'Admin' || user?.role === 'Manager';
  const canAdjustStocks = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Supervisor';

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white">Warehouse Stocks</h1>
          <p className="text-zinc-500 text-sm mt-1">Audit explosive inventories, safety respirators, spare vehicle parts, and warehouse stock compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadInventory()}
            className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh database records"
          >
            <RefreshCcw className="w-4.5 h-4.5" />
          </button>
          {canManageItems && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition-all shadow-md shadow-emerald-500/10 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Register New Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Numerical Bulbs / Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Items card */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Registered Assets</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalItems}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">active material categories catalogued</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`bg-zinc-950 border rounded-2xl p-5 relative overflow-hidden transition-all ${
          lowStockItems > 0 ? 'border-rose-950/40 bg-gradient-to-br from-rose-950/5 to-transparent' : 'border-zinc-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Low Stock Alert</span>
            <div className={`p-2 rounded-lg ${lowStockItems > 0 ? 'bg-rose-950/50 text-rose-400' : 'bg-zinc-900 text-zinc-500'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-extrabold tracking-tight ${lowStockItems > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {lowStockItems}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">items currently below safety buffer</span>
          </div>
        </div>

        {/* Safety items hazard count */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Critical PPE Status</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {criticalSafetyItems > 0 ? `${criticalSafetyItems} Critical` : 'COMPLIANT'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1">PPE wear & safety threshold audits</span>
          </div>
        </div>

        {/* Primary Depot Location */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Main Depot Node</span>
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xl font-bold text-white block">Depot Alpha-Zone</span>
            <span className="text-[10px] text-zinc-500 block mt-2">primary sector warehouse and distribution hub</span>
          </div>
        </div>

      </div>

      {/* Control panel: Category selectors + search inputs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-900 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeCategory === cat 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input field */}
        <div className="relative max-w-sm w-full lg:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, depot, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d0d0e] border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 font-medium italic">
            Retrieving operational supply logs from warehouse database...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500 font-medium italic">
            No stock records match the specified filters or queries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Item Name & Warehouse Location</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Available Stock Count</th>
                  <th className="px-6 py-4">Min. Buffer Threshold</th>
                  <th className="px-6 py-4">Status Dispatch</th>
                  <th className="px-6 py-4">Supplier Node</th>
                  <th className="px-6 py-4 text-center">Operation Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50 text-xs">
                {filteredItems.map(item => {
                  const isLowStock = item.quantity <= item.minThreshold;
                  return (
                    <tr 
                      key={item._id} 
                      className={`hover:bg-zinc-900/20 transition-all ${
                        isLowStock ? 'bg-rose-950/5' : ''
                      }`}
                    >
                      
                      {/* Name & Location */}
                      <td className="px-6 py-4.5">
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-600" /> {item.location}
                        </span>
                      </td>

                      {/* Category Badging */}
                      <td className="px-6 py-4.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide inline-block ${
                          item.category === 'Explosives' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                          item.category === 'Equipment' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                          item.category === 'Safety' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                          item.category === 'Spare Parts' ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' :
                          'bg-blue-950 text-blue-400 border border-blue-900/30'
                        }`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4.5 text-right font-mono font-bold text-sm">
                        <span className={isLowStock ? 'text-rose-400' : 'text-white'}>
                          {item.quantity}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium ml-1">{item.unit}</span>
                      </td>

                      {/* Min Threshold */}
                      <td className="px-6 py-4.5 font-mono text-zinc-400">
                        {item.minThreshold} {item.unit}
                      </td>

                      {/* Low stock alert badge */}
                      <td className="px-6 py-4.5">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-rose-950 text-rose-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border border-rose-900/50">
                            <AlertTriangle className="w-3 h-3" /> LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Secure
                          </span>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="px-6 py-4.5">
                        <span className="font-semibold text-zinc-300 block">{item.supplier?.name}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{item.supplier?.contact}</span>
                      </td>

                      {/* Actions panel */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-center gap-2">
                          {canAdjustStocks && (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowAdjustModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold hover:text-white transition-all active:scale-95 flex items-center gap-1"
                              title="Restock or Consume inventory"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
                            </button>
                          )}
                          {canManageItems && (
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="p-1.5 rounded hover:bg-rose-950/20 text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-950/40 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Register New Inventory Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#09090b] border border-zinc-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            
            <header className="px-6 py-4.5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base font-outfit text-white">Register Warehouse Item</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-850 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                
                {/* Item Name */}
                <div className="col-span-2">
                  <label className="text-zinc-500 block mb-1">Item Title / Name</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. ANFO Explosive Emulsion"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-zinc-500 block mb-1">Inventory Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Explosives">Explosives</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Safety">Safety</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Chemicals">Chemicals</option>
                  </select>
                </div>

                {/* Warehouse Location */}
                <div>
                  <label className="text-zinc-500 block mb-1">Warehouse Location (Zone)</label>
                  <input
                    type="text"
                    required
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    placeholder="e.g. Bunker-3 Zone C"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-zinc-500 block mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="text-zinc-500 block mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="e.g. kg, cases, units"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Min Threshold */}
                <div className="col-span-2">
                  <label className="text-zinc-500 block mb-1">Minimum Safety Buffer (Min Threshold)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemMinThreshold}
                    onChange={(e) => setNewItemMinThreshold(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Trigger low stock safety alarms when quantity reaches or drops below this number.</span>
                </div>

                {/* Supplier Details */}
                <div className="col-span-2 border-t border-zinc-900 pt-3 mt-1 space-y-3">
                  <span className="text-xs font-bold text-zinc-300 block flex items-center gap-1">
                    <Truck className="w-4 h-4 text-emerald-400" /> Supplier Information Node
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-500 block mb-1">Supplier / Manufacturer Name</label>
                      <input
                        type="text"
                        required
                        value={newItemSupplierName}
                        onChange={(e) => setNewItemSupplierName(e.target.value)}
                        placeholder="e.g. Dyno Nobel Inc."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">Supplier Contact (Phone / Email)</label>
                      <input
                        type="text"
                        required
                        value={newItemSupplierContact}
                        onChange={(e) => setNewItemSupplierContact(e.target.value)}
                        placeholder="e.g. orders@dynonobel.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <footer className="pt-4 border-t border-zinc-900 flex gap-3.5 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-all"
                >
                  {submittingItem ? 'Registering Material...' : 'Save New Item Listing'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust Stock levels (RESTOCK / CONSUME) */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#09090b] border border-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            <header className="px-6 py-4.5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base font-outfit text-white">Adjust Material stock</h3>
              </div>
              <button 
                onClick={() => {
                  setShowAdjustModal(false);
                  setSelectedItem(null);
                }}
                className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-850 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <form onSubmit={handleAdjustQuantity} className="p-6 space-y-4">
              
              {/* Item info block */}
              <div className="bg-zinc-900/35 border border-zinc-900 p-3.5 rounded-lg text-xs space-y-1">
                <span className="text-zinc-500 font-medium uppercase tracking-wider block">Target Asset Profile</span>
                <span className="text-white block font-bold text-sm">{selectedItem.name}</span>
                <span className="text-zinc-400 block mt-1">Available Count: <span className="font-mono font-bold text-white">{selectedItem.quantity} {selectedItem.unit}</span> (Buffer threshold: {selectedItem.minThreshold} {selectedItem.unit})</span>
              </div>

              {adjustError && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{adjustError}</span>
                </div>
              )}

              <div className="space-y-4.5 text-xs">
                
                {/* Transaction Action Type */}
                <div>
                  <label className="text-zinc-500 block mb-2 font-bold uppercase tracking-wider">Adjustment Action Type</label>
                  <div className="grid grid-cols-2 gap-3.5">
                    
                    {/* Restock type */}
                    <button
                      type="button"
                      onClick={() => setAdjustAction('RESTOCK')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-bold transition-all ${
                        adjustAction === 'RESTOCK'
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-900/20 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                      }`}
                    >
                      <PlusCircle className="w-4.5 h-4.5" /> Restock Depot (+)
                    </button>

                    {/* Consume type */}
                    <button
                      type="button"
                      onClick={() => setAdjustAction('CONSUME')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-bold transition-all ${
                        adjustAction === 'CONSUME'
                          ? 'bg-rose-950/30 text-rose-400 border-rose-950/40'
                          : 'bg-zinc-900/20 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                      }`}
                    >
                      <MinusCircle className="w-4.5 h-4.5" /> Consume Asset (-)
                    </button>
                    
                  </div>
                </div>

                {/* Adjustment Amount */}
                <div>
                  <label className="text-zinc-500 block mb-1">Adjustment Volume ({selectedItem.unit})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustAmount === 0 ? '' : adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    placeholder="Enter amount..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

              </div>

              <footer className="pt-4 border-t border-zinc-900 flex gap-3.5 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjustment}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all text-black ${
                    adjustAction === 'RESTOCK' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {submittingAdjustment ? 'Executing Ledger...' : 'Commit Stock Change'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
