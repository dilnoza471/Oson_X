import { Navigate } from 'react-router-dom';
import useSession from '../../hooks/useSession.js';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-6 shadow-soft">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
