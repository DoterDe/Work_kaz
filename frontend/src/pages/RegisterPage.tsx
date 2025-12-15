import React, { useState } from 'react';
import api from '../api/axios';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const res = await api.post('register/', { username, email, password });
      setMessage('Регистрация успешна! Войдите в систему.');
      onNavigate('login');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {message && <p className="mb-2 text-sm text-red-500">{message}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
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
        onClick={handleRegister}
        className="w-full py-2 bg-primary text-white rounded hover:bg-primary/80"
      >
        Register
      </button>
    </div>
  );
};
