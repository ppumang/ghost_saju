// Meta Pixel (Facebook Pixel) integration for ad tracking

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const isProd = process.env.NODE_ENV === 'production';

export const initMetaPixel = (): void => {
  if (!isProd) return;

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId || typeof window === 'undefined') return;
  if (window.fbq) return;

  (function (
    f: Window,
    b: Document,
    e: string,
    v: string,
    n?: any,
    t?: HTMLScriptElement,
    s?: HTMLScriptElement
  ) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
    s.parentNode?.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq('init', pixelId);
};

export const trackPageView = (): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackViewContent = (
  contentName?: string,
): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      ...(contentName && { content_name: contentName }),
    });
  }
};

export const trackInitiateCheckout = (
  value: number = 9900,
  currency: string = 'KRW',
): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value,
      currency,
    });
  }
};

export const trackAddToCart = (
  value: number = 9900,
  currency: string = 'KRW',
): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      value,
      currency,
      content_name: '귀신사주 전체 풀이',
      content_type: 'product',
    });
  }
};

export const trackPurchase = (
  value: number = 9900,
  currency: string = 'KRW',
): void => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_name: '귀신사주 전체 풀이',
      content_type: 'product',
    });
  }
};
