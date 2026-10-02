import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@natsu/types';
import { useNavigate } from 'react-router-dom';
import { adminApi, getAuthToken, setAuthToken } from '@/api/client';
import { QUERY_KEYS } from '@/lib/constants';

/** Current admin session. Resolves to `null` when unauthenticated. */
export function useAuth() {
  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: QUERY_KEYS.session,
    queryFn: () => adminApi.me(),
    enabled: Boolean(getAuthToken()),
    retry: false,
    staleTime: 60_000,
  });

  const user: AuthUser | null = session.data ?? null;
  const isAuthenticated = Boolean(user);
  const isLoading = session.isLoading && Boolean(getAuthToken());

  const login = useMutation({
    mutationFn: (payload: { email: string; password: string }) => adminApi.login(payload),
    onSuccess: (data) => {
      setAuthToken(data.accessToken);
      queryClient.setQueryData(QUERY_KEYS.session, data.user);
    },
  });

  const logout = useMutation({
    mutationFn: () => adminApi.logout(),
    onSettled: () => {
      setAuthToken(null);
      queryClient.setQueryData(QUERY_KEYS.session, null);
      queryClient.clear();
    },
  });

  return { user, isAuthenticated, isLoading, login, logout, refetch: session.refetch };
}

/** Convenience hook for the logout button in the admin shell. */
export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return async () => {
    try {
      await logout.mutateAsync();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };
}
