import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { OnboardingProvider } from '../context/OnboardingContext';
// import './globals.css';

function Onboarding({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <OnboardingProvider>
      <Component {...pageProps} />
    </OnboardingProvider>
  );
}

export default Onboarding;