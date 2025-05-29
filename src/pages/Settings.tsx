import React from 'react';
import Layout from '../components/common/Layout';

const Settings: React.FC = () => {
  return (
    <Layout title="Settings">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600">Application settings will be implemented here.</p>
      </div>
    </Layout>
  );
};

export default Settings; 