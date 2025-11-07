import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let errorMessage = error.message;
      if (errorMessage.toLowerCase().includes('failed to fetch')) {
        errorMessage = 'Network Error: Could not reach the server. Please check your internet connection and verify the Supabase URL in `supabaseClient.ts`.';
      }
      setMessage(`Error: ${errorMessage}`);
    } else if (isSignUp) {
      setMessage('Success! Please check your email for a confirmation link to complete sign-up.');
      setIsSuccess(true);
    }
    // On successful sign-in, the onAuthStateChange listener in App.tsx will handle navigation.
    setLoading(false);
  };

  const messageClasses = isSuccess
    ? "bg-green-500/10 text-green-300 border-green-500/20"
    : "bg-red-500/10 text-red-300 border-red-500/20";

  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl shadow-black/40 p-8 border border-zinc-700/50">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {isSignUp ? 'Create an Account' : 'Admin Portal'}
        </h1>
        <p className="text-center text-gray-400 mb-8">
          {isSignUp ? 'Enter your details to sign up' : 'Please sign in to continue'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email Address
            </label>
            <input
              id="email"
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm text-white"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              id="password"
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-accent-purple focus:border-accent-purple sm:text-sm text-white"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-accent-purple disabled:opacity-50"
            >
              {loading ? <span>Processing...</span> : <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>}
            </button>
          </div>
        </form>
        {message && (
            <div className={`mt-4 w-full rounded-lg p-3 text-sm border ${messageClasses}`}>
              <p>{message}</p>
            </div>
        )}
        <p className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
              setIsSuccess(false);
            }}
            className="font-medium text-accent-purple hover:text-purple-400 focus:outline-none"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};