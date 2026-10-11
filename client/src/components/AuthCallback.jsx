import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { supabase } from '../supabase';

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const finishSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const providerError = params.get('error_description') || params.get('error');
      if (providerError) {
        setError(providerError);
        return;
      }
      if (!supabase) {
        setError('Google sign-in is not configured.');
        return;
      }

      try {
        // getSession waits for the PKCE code in the URL to be exchanged.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !data.session) {
          setError(sessionError?.message || 'Google sign-in did not complete. Please try again.');
          return;
        }

        const response = await api.post('/auth/google', {
          access_token: data.session.access_token,
        });

        localStorage.setItem('userId', response.data.user_id);
        localStorage.setItem('username', response.data.username);
        await supabase.auth.signOut({ scope: 'local' });
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
      }
    };

    finishSignIn();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1929] px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Sign-in failed</h1>
            <p className="text-sm text-red-600 mb-6" role="alert">{error}</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to login
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-gray-700" role="status">Signing you in with Google...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
