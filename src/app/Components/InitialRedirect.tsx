"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedEmotionAid from './modifying';

const STORAGE_KEY = 'emotionAidUser';

const InitialRedirect: React.FC = () => {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // no profile -> send to auth page
        router.replace('/auth');
        setAllowed(false);
        return;
      }
      // profile exists -> show main app
      setAllowed(true);
    } catch (err) {
      void err;
      // if localStorage not available, allow access
      setAllowed(true);
    }
  }, [router]);

  if (allowed === null) return null; // wait for check
  if (!allowed) return null; // navigate happening

  return <EnhancedEmotionAid />;
};

export default InitialRedirect;
