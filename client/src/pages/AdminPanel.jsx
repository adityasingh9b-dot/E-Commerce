import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminPanel = () => {
  const user = useSelector(state => state.user);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6 text-red-600 text-center font-semibold bg-red-100 rounded">
        🚫 You’re not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 my-6">
      <h1 className="text-2xl font-bold mb-6">🛠️ Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <Link to="/dashboard/upload-product" className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition">
          📦 Upload Product
        </Link>

        <Link to="/dashboard/product" className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition">
          🛍️ Manage Products
        </Link>

        <Link to="/dashboard/category" className="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition">
          🗂️ Manage Categories
        </Link>

        <Link to="/dashboard/subcategory" className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 transition">
          🔖 Manage Subcategories
        </Link>

        {/* ✅ Updated this link to point to admin order view */}
        <Link to="/dashboard/admin-orders" className="bg-red-600 text-white p-4 rounded-lg shadow hover:bg-red-700 transition">
          📑 View Orders
        </Link>

      </div>
    </div>
  );
};

export default AdminPanel;

