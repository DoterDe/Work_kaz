import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('dashboard/'); // защищённый эндпоинт
        setData(res.data.message);
      } catch {
        setData('Ошибка авторизации. Пожалуйста, войдите.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    onNavigate('login');
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-card rounded-lg shadow-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <p className="mb-4">{data}</p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};
