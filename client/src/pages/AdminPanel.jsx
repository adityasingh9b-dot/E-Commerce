import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminPanel = () => {
  const user = useSelector(state => state.user);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="p-8 text-red-700 text-center font-black bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl max-w-md">
          <span className="text-5xl block mb-4">🚫</span>
          <h2 className="text-xl uppercase tracking-tighter">Access Denied</h2>
          <p className="text-sm mt-2 opacity-80">You are not authorized to view the AdiMart Control Center.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 my-10 max-w-6xl">
      {/* Header Section */}
      <div className="mb-10 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
          <span className="bg-black text-white px-3 py-1 rounded">ADMIN</span> 
          Dashboard
        </h1>
        <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-[0.2em]">Manage your IIT Ropar Startup</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Upload Product Card */}
        <Link to="/dashboard/upload-product" 
          className="group bg-blue-700 hover:bg-blue-800 text-white p-8 rounded-2xl shadow-[0_10px_20px_rgba(29,78,216,0.3)] transition-all transform hover:-translate-y-2 border-b-8 border-blue-900">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📦</div>
          <h3 className="text-xl font-black uppercase tracking-tight">Upload Product</h3>
          <p className="text-blue-100 text-xs font-bold mt-1 opacity-80">ADD NEW ITEMS TO INVENTORY</p>
        </Link>

        {/* Manage Products Card */}
        <Link to="/dashboard/product" 
          className="group bg-green-700 hover:bg-green-800 text-white p-8 rounded-2xl shadow-[0_10px_20px_rgba(21,128,61,0.3)] transition-all transform hover:-translate-y-2 border-b-8 border-green-900">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🛍️</div>
          <h3 className="text-xl font-black uppercase tracking-tight">Manage Products</h3>
          <p className="text-green-100 text-xs font-bold mt-1 opacity-80">EDIT OR DELETE STOCK</p>
        </Link>

        {/* Manage Categories Card */}
        <Link to="/dashboard/category" 
          className="group bg-purple-700 hover:bg-purple-800 text-white p-8 rounded-2xl shadow-[0_10px_20_rgba(126,34,206,0.3)] transition-all transform hover:-translate-y-2 border-b-8 border-purple-900">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗂️</div>
          <h3 className="text-xl font-black uppercase tracking-tight">Manage Categories</h3>
          <p className="text-purple-100 text-xs font-bold mt-1 opacity-80">ORGANIZE MENU STRUCTURE</p>
        </Link>

        {/* Manage Subcategories Card */}
        <Link to="/dashboard/subcategory" 
          className="group bg-indigo-700 hover:bg-indigo-800 text-white p-8 rounded-2xl shadow-[0_10px_20px_rgba(67,56,202,0.3)] transition-all transform hover:-translate-y-2 border-b-8 border-indigo-900">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔖</div>
          <h3 className="text-xl font-black uppercase tracking-tight">Subcategories</h3>
          <p className="text-indigo-100 text-xs font-bold mt-1 opacity-80">REFINE PRODUCT TAGS</p>
        </Link>

        {/* View Orders Card - Made RED & Extra Bold */}
        <Link to="/dashboard/myorders" 
          className="group bg-red-600 hover:bg-black text-white p-8 rounded-2xl shadow-[0_15px_30px_rgba(220,38,38,0.4)] transition-all transform hover:-translate-y-2 border-b-8 border-red-900">
          <div className="text-4xl mb-4 group-hover:animate-bounce">📑</div>
          <h3 className="text-xl font-black uppercase tracking-tight">View Orders</h3>
          <p className="text-red-100 text-xs font-bold mt-1 opacity-80 uppercase">Check Incoming Requests</p>
        </Link>

      </div>
    </div>
  );
};

export default AdminPanel;
