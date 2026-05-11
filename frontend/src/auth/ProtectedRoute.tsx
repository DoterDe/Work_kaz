import { useAuth } from '../auth/AuthContext';

export const ProtectedRoute = ({ children }: any) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div className="text-center mt-20">🔒 Авторизуйтесь</div>;
  }

  return children;
};
