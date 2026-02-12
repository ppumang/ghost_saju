'use client';

import { useEffect } from 'react';
import { initMixpanel, registerUTMSuperProperties, setDefaultProperties } from '@/lib/mixpanel';
import { initMetaPixel, trackPageView } from '@/lib/meta-pixel';

export default function MixpanelInit() {
  useEffect(() => {
    initMixpanel();
    initMetaPixel();
    trackPageView();
    const timer = setTimeout(async () => {
      await registerUTMSuperProperties();
      setDefaultProperties();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
