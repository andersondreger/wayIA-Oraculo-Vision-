import React from 'react';
import {Navigate} from 'react-router-dom';

const ProtectedRoute = ({children}: {children: React.ReactNode}) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Se não houver token, redireciona para a página de login
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
