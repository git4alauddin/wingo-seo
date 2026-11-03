import { ANALYTICS_SIGNAL, CONSENT_KEY, cleanReferrer, guidePaths, pageNames, readChoice, savedChoice, sanitizeSignal, type Choice } from '../lib/analytics';

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}
const root = document.querySelector<HTMLElement>('[data-consent]');
if (root) initialize(root);

function initialize(root: HTMLElement) {
  const id = root.dataset.measurementId ?? '', origin = root.dataset.origin ?? '';
  const path = window.location.pathname;
  if (window.location.origin !== origin || !pageNames[path] || !/^G-[A-Z0-9]{10}$/.test(id)) return;
  const allow = root.querySelector<HTMLButtonElement>('[data-consent-allow]')!;
  const reject = root.querySelector<HTMLButtonElement>('[data-consent-reject]')!;
  const close = root.querySelector<HTMLButtonElement>('[data-consent-close]')!;
  const status = root.querySelector<HTMLElement>('[data-consent-status]')!;
  const settings = document.querySelector<HTMLButtonElement>('[data-analytics-settings]');
  const privacySignal = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === '1';
  const disableKey = `ga-disable-${id}`;
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  const globals = window as unknown as Record<string, unknown>;
  let choice: Choice | null = privacySignal ? 'denied' : stored();
  let loading = false, ready = false, pageSent = false, tag: HTMLScriptElement | undefined;
  let returnFocus: HTMLElement | null = null;
  const sent = new WeakMap<object, Set<string>>(), started = new WeakMap<object, string>();
  if (settings) settings.hidden = false;
  close.hidden = false; allow.disabled = privacySignal;
  root.hidden = choice !== null;

  function stored() { try { return readChoice(localStorage.getItem(CONSENT_KEY), Date.now()); } catch { return null; } }
  function clearCookies() {
    for (const raw of document.cookie.split(';')) {
      const name = raw.split('=')[0].trim();
      if (name.startsWith('wingolab_ga') || name.startsWith('wingolab__ga')) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
    }
  }
  function describe() {
    status.textContent = privacySignal ? 'Your browser privacy signal keeps analytics off.' : choice === 'granted' ? 'Your choice: analytics allowed. You can reject it at any time.' : choice === 'denied' ? 'Your choice: analytics rejected. Learning tools remain available.' : 'Analytics is off until you choose to allow it.';
  }
  function hide() { root.hidden = true; if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); returnFocus = null; }
  function send(name: string, parameters: Record<string, unknown>) {
    if (!ready || choice !== 'granted' || privacySignal || globals[disableKey] === true) return;
    window.gtag?.('event', name, { send_to: id, page_location: origin + path, page_title: pageNames[path], page_referrer: cleanReferrer(document.referrer, origin), ...parameters });
  }
  function boot() {
    if (ready || loading || choice !== 'granted' || privacySignal) return;
    loading = true; globals[disableKey] = false;
    window.dataLayer = [];
    window.gtag = function () { window.dataLayer!.push(arguments); };
    window.gtag('consent', 'default', denied);
    window.gtag('set', { ads_data_redaction: true, url_passthrough: false });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: false, page_location: origin + path, page_title: pageNames[path], page_referrer: cleanReferrer(document.referrer, origin),
      allow_google_signals: false, allow_ad_personalization_signals: false, ads_data_redaction: true, url_passthrough: false,
      cookie_domain: 'none', cookie_prefix: 'wingolab', cookie_expires: 30 * 24 * 60 * 60, cookie_update: false, cookie_flags: 'SameSite=Lax;Secure',
    });
    window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    tag = document.createElement('script'); tag.async = true; tag.referrerPolicy = 'no-referrer';
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    tag.onload = () => {
      loading = false;
      if (choice !== 'granted' || globals[disableKey] === true) return;
      ready = true;
      if (!pageSent) {
        pageSent = true; send('page_view', { page_path: path });
        if (guidePaths.includes(path)) send('guide_open', { guide_slug: path.slice(1, -1) });
      }
    };
    tag.onerror = () => {
      loading = false; ready = false; globals[disableKey] = true; window.dataLayer = []; tag?.remove();
      root.hidden = false; status.textContent = 'Analytics could not load. Your learning tools still work. You can retry Allow or choose Reject.';
    };
    document.head.append(tag);
  }
  function choose(next: Choice) {
    try { localStorage.setItem(CONSENT_KEY, savedChoice(next, Date.now())); } catch { /* Choice still applies to this document. */ }
    choice = next; describe(); hide();
    if (next === 'granted') boot();
    else {
      globals[disableKey] = true; clearCookies();
      if (loading || ready) { tag?.remove(); window.location.reload(); }
    }
  }
  allow.addEventListener('click', () => { if (!privacySignal) choose('granted'); });
  reject.addEventListener('click', () => choose('denied'));
  close.addEventListener('click', hide);
  settings?.addEventListener('click', () => { returnFocus = settings; describe(); root.hidden = false; (privacySignal ? reject : allow).focus({ preventScroll: true }); });
  document.addEventListener(ANALYTICS_SIGNAL, event => {
    if (!ready || choice !== 'granted' || privacySignal) return;
    const data = sanitizeSignal((event as CustomEvent<unknown>).detail); if (!data) return;
    const signature = JSON.stringify(data.parameters);
    if (data.token) {
      const names = sent.get(data.token) ?? new Set<string>(); if (names.has(data.name)) return;
      if (data.name === 'simulator_complete' && started.get(data.token) !== signature) return;
      names.add(data.name); sent.set(data.token, names);
      if (data.name === 'simulator_start') started.set(data.token, signature);
    }
    send(data.name, data.parameters);
  });
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a') : null;
    if (!anchor || event.defaultPrevented) return;
    if (anchor.matches('[data-track-course]') && anchor.href === 'https://course.kalam.trade/') send('course_interest_click', { destination: 'course_homepage' });
    if (anchor.matches('[data-track-contact]') && anchor.protocol === 'mailto:') send('contact_click', { channel: 'email' });
  });
  function reconcile() {
    if (privacySignal) return;
    const next = stored();
    if (next !== 'granted' && (ready || loading)) { choice = next; globals[disableKey] = true; clearCookies(); window.location.reload(); return; }
    choice = next; describe(); root.hidden = choice !== null; if (choice === 'granted') boot();
  }
  window.addEventListener('storage', event => { if (event.key === CONSENT_KEY || event.key === null) reconcile(); });
  window.addEventListener('pageshow', event => { if (event.persisted) reconcile(); });
  describe(); if (privacySignal) clearCookies(); else if (choice === 'granted') boot();
}
