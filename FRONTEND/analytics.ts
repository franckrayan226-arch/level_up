const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : '/api';

const SID_KEY = 'lu_sid';

function getSessionId(): string {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = (
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    ).slice(0, 32);
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

let visiteEnCours: { id: string; debut: number; envoye: boolean } | null = null;

function envoyerDuree(): void {
  const v = visiteEnCours;
  if (!v || v.envoye) return;
  v.envoye = true;
  const duree = Math.round((Date.now() - v.debut) / 1000);
  try {
    fetch(`${API_BASE}/analytics/duree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v.id, duree }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackVisite(page: string, produitId?: string): void {
  envoyerDuree();
  fetch(`${API_BASE}/analytics/visite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, produitId, sid: getSessionId() }),
  })
    .then(r => r.json())
    .then((d: { id?: string }) => {
      if (d.id) visiteEnCours = { id: d.id, debut: Date.now(), envoye: false };
    })
    .catch(() => {});
}

window.addEventListener('pagehide', envoyerDuree);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') envoyerDuree();
});
