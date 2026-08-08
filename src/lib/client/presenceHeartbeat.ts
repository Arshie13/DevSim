const INTERVAL_MS = 60_000;

export function startPresenceHeartbeat() {
  const send = () =>
    fetch('/api/user/heartbeat', { method: 'POST', cache: 'no-store' }).catch(() => {});

  send();
  const iv = setInterval(() => {
    if (document.visibilityState === 'visible') send();
  }, INTERVAL_MS);

  const onVisible = () => send();
  const onHidden = () => {
    navigator.sendBeacon('/api/user/heartbeat');
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') onVisible();
    else onHidden();
  });

  window.addEventListener('pagehide', onHidden);

  return () => {
    clearInterval(iv);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('pagehide', onHidden);
  };
}
