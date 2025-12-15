import React from 'react';

export const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Home Page</h1>
    <p>Welcome to Qazaq Video Learn</p>
  </div>
);

export const Dashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <p>Protected page. Only logged in users can see this.</p>
  </div>
);
