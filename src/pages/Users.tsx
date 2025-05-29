import React from 'react';
import Layout from '../components/common/Layout';

const Users: React.FC = () => {
  return (
    <Layout title="Users">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Users Management</h2>
        <p className="text-gray-600">User management functionality will be implemented here.</p>
      </div>
    </Layout>
  );
};

export default Users; 