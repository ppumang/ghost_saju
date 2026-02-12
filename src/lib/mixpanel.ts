import mixpanel from 'mixpanel-browser';

let isInitialized = false;
let isReady = false;
let mixpanelReadyPromise: Promise<void> | null = null;
let mixpanelReadyResolve: (() => void) | null = null;

const isProd = process.env.NODE_ENV === 'production';

export const initMixpanel = () => {
  if (isInitialized || !isProd) return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (token && typeof window !== 'undefined') {
    isInitialized = true;
    mixpanelReadyPromise = new Promise((resolve) => {
      mixpanelReadyResolve = resolve;
    });

    mixpanel.init(token, {
      debug: process.env.NODE_ENV === 'development',
      persistence: 'localStorage',
      loaded: () => {
        isReady = true;
        if (mixpanelReadyResolve) {
          mixpanelReadyResolve();
          mixpanelReadyResolve = null;
        }
      },
    });

    setTimeout(() => {
      isReady = true;
      if (mixpanelReadyResolve) {
        mixpanelReadyResolve();
        mixpanelReadyResolve = null;
      }
    }, 3000);
  }
};

const getUTMParams = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  for (const key of keys) {
    const value = params.get(key);
    if (value) result[key] = value;
  }
  return result;
};

export const hasUTMParams = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return !!(
    params.get('utm_source') ||
    params.get('utm_medium') ||
    params.get('utm_campaign') ||
    params.get('gclid')
  );
};

export const registerUTMSuperProperties = async () => {
  if (typeof window === 'undefined') return;

  try {
    initMixpanel();

    if (mixpanelReadyPromise) {
      await Promise.race([
        mixpanelReadyPromise,
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    }

    if (!isReady) return;

    const utmParams = getUTMParams();
    if (Object.keys(utmParams).length > 0) {
      mixpanel.register(utmParams);
    }
  } catch {
    // silent
  }
};

export const setDefaultProperties = () => {
  if (typeof window === 'undefined' || !isReady) return;

  try {
    const utmParams = getUTMParams();
    const properties: Record<string, unknown> = {
      env: window.location.hostname.includes('ghostsaju') ? 'prod' : 'dev',
      locale: navigator.language || 'ko-KR',
      referrer: document.referrer || null,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      ...utmParams,
    };

    mixpanel.register(properties);
  } catch {
    // silent
  }
};

export const track = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  try {
    initMixpanel();

    const doTrack = () => {
      if (isReady) {
        mixpanel.track(eventName, {
          ...properties,
          not_ad: !hasUTMParams(),
        });
      }
    };

    if (isReady) {
      doTrack();
    } else if (mixpanelReadyPromise) {
      mixpanelReadyPromise.then(doTrack);
    }
  } catch {
    // silent
  }
};
