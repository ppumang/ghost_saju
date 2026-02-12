'use client';

import { useEffect } from 'react';
import { initMixpanel, registerUTMSuperProperties, setDefaultProperties } from '@/lib/mixpanel';

export default function MixpanelInit() {
  useEffect(() => {
    initMixpanel();
    const timer = setTimeout(async () => {
      await registerUTMSuperProperties();
      setDefaultProperties();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
