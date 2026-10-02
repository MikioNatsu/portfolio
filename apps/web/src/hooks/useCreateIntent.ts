import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Runs `onCreate` when the page was opened with `state: { create: true }`
 * (e.g. "New skill" in the command palette), then clears that state so a
 * refresh or back-navigation doesn't reopen the form.
 */
export function useCreateIntent(onCreate: () => void): void {
  const location = useLocation();
  const navigate = useNavigate();
  const callback = useRef(onCreate);
  callback.current = onCreate;
  const requested = Boolean((location.state as { create?: boolean } | null)?.create);

  useEffect(() => {
    if (!requested) return;
    callback.current();
    navigate(location.pathname, { replace: true, state: null });
  }, [requested, location.pathname, navigate]);
}
