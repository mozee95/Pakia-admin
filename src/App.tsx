import React from 'react';
import { ClerkProvider, SignIn, useAuth } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApiAuth } from './services/api';
import { useAdminAuth } from './hooks/useAdminAuth';
import { AdminLayout } from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Settings from './pages/Settings';

const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('REACT_APP_CLERK_PUBLISHABLE_KEY is required. Please add it to your .env file.');
}

// Protected admin route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode; permission?: string }> = ({ 
  children, 
  permission 
}) => {
  const { isAdmin, hasPermission, isLoaded } = useAdminAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/no-permission" replace />;
  }

  return <>{children}</>;
};

// App content component that uses hooks
const AppContent: React.FC = () => {
  // Set up API authentication inside Clerk context
  useApiAuth();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            Pakia Admin Dashboard
          </h1>
          <SignIn 
            redirectUrl="/admin"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl',
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          <Route
            path="products"
            element={
              <AdminRoute permission="manage_products">
                <Products />
              </AdminRoute>
            }
          />
          
          <Route
            path="categories"
            element={
              <AdminRoute permission="manage_categories">
                <Categories />
              </AdminRoute>
            }
          />
          
          <Route
            path="brands"
            element={
              <AdminRoute permission="manage_brands">
                <Brands />
              </AdminRoute>
            }
          />
          
          <Route
            path="orders"
            element={
              <AdminRoute permission="manage_orders">
                <Orders />
              </AdminRoute>
            }
          />
          
          <Route
            path="users"
            element={
              <AdminRoute permission="manage_users">
                <Users />
              </AdminRoute>
            }
          />
          
          <Route
            path="settings"
            element={
              <AdminRoute permission="manage_settings">
                <Settings />
              </AdminRoute>
            }
          />
        </Route>

        <Route 
          path="/unauthorized" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                  Unauthorized Access
                </h1>
                <p className="text-gray-600 mb-8">
                  You don't have permission to access the admin dashboard.
                </p>
                <a href="/" className="text-blue-500 hover:underline">
                  Go back to main site
                </a>
              </div>
            </div>
          } 
        />

        <Route 
          path="/no-permission" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-yellow-600 mb-4">
                  Insufficient Permissions
                </h1>
                <p className="text-gray-600 mb-8">
                  You don't have permission to access this feature.
                </p>
                <a href="/admin" className="text-blue-500 hover:underline">
                  Go back to dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

// Main app component
function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
