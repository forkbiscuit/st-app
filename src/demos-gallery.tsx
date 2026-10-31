// Development page: every move demo. `npm run dev`, then open /demos.html.
// Not part of the app build. ?mode=cool shows the cool palette; ?strip=1 shows
// four frames of each demo (frozen by the review script) instead of live loops.
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { MotionDemo } from './components/MotionDemo';
import { DEMOS, type DemoKind } from './components/motion/demos';
import { EXERCISES } from './data/exercises';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') === 'cool' ? 'cool' : 'warm';
const strip = params.has('strip');
const only = params.get('only')?.split(',');
const kinds = (Object.keys(DEMOS) as DemoKind[]).filter((k) => !only || only.includes(k));
const usedBy = (k: DemoKind) => Object.values(EXERCISES).filter((e) => e.motion === k).map((e) => e.name);

// The app's styles pin the page to the window; this page scrolls normally.
for (const el of [document.documentElement, document.body, document.getElementById('root')!]) {
  el.style.overflow = 'visible';
  el.style.height = 'auto';
}

const stage = (k: DemoKind, phase?: number) => (
  <div
    key={phase ?? 'live'}
    data-phase={phase}
    style={{
      width: 150,
      height: 150,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-1) 15%, transparent), transparent 66%)',
      boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--accent-1) 14%, transparent)',
    }}
  >
    <div style={{ width: 128 }}>
      <MotionDemo kind={k} label={k} />
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <main
    data-mode={mode}
    style={{
      display: 'grid',
      gridTemplateColumns: strip ? 'repeat(2, 620px)' : 'repeat(auto-fill, 170px)',
      gap: 14,
      padding: 16,
      font: '12px/1.3 Archivo Variable, sans-serif',
      color: '#a7a19b',
    }}
  >
    {kinds.map((k) => (
      <section key={k} data-kind={k} style={{ display: 'grid', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4 }}>{strip ? [0, 0.25, 0.5, 0.75].map((ph) => stage(k, ph)) : stage(k)}</div>
        <div>
          <strong style={{ color: '#f5f1ec' }}>{k}</strong> {usedBy(k).join(', ')}
        </div>
      </section>
    ))}
  </main>,
);
