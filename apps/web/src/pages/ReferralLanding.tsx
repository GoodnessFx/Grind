/**
 * ReferralLanding — /ref/:handle — stores the referrer handle then
 * sends the visitor to signup. Signup.tsx resolves it to user.referred_by.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const ReferralLanding: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (handle) {
      try { sessionStorage.setItem('grind_ref', handle.replace(/^@/, '').trim()); } catch { /* ignore */ }
    }
    navigate('/signup', { replace: true });
  }, [handle, navigate]);

  return null;
};
