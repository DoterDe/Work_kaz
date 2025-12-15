import React, { useState } from 'react';
import api from '../api/axios';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setMessage('Вход успешен!');
      onNavigate('dashboard');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Ошибка входа');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {message && <p className="mb-2 text-sm text-red-500">{message}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleLogin}
        className="w-full py-2 bg-primary text-white rounded hover:bg-primary/80"
      >
        Login
      </button>
    </div>
  );
};
