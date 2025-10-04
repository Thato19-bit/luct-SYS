import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles }){
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if(!token || !user) return <Navigate to="/login" />;
  if(roles && roles.length>0){
    const u = JSON.parse(user);
    if(!roles.includes(u.role)) return <Navigate to="/" />;
  }
  return children;
}