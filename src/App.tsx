import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to admin dashboard */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/settings" element={<Settings />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
