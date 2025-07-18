import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminPermision = ({ children }) => {
  const user = useSelector((state) => state.user);

  // Fix: Properly handle unauthenticated or non-admin users
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminPermision;

