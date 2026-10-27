import { ACTIVITY_BY_ID } from '../data/activities';
import type { Mode } from '../data/types';
import { BookmarksButton } from '../components/BookmarksButton';
import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import type { Action, AppState } from '../state/appState';

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long' });

/** Wireframe 1: choose warm up or cool down. */
export function Home({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const start = (mode: Mode) => dispatch({ type: 'START_MODE', mode });
  const { reminder } = state;

  return (
    <div className="screen-body home">
      <header className="topbar home-head">
        <Logo />
        <div className="topbar-right">
          <BookmarksButton count={state.saved.length} onClick={() => dispatch({ type: 'OPEN_BOOKMARKS' })} />
        </div>
      </header>

      {reminder && (
        <section className="reminder" data-mode={reminder.mode} aria-label="Upcoming reminder">
          <Icon name="notifications_active" filled />
          <div>
            <p className="reminder-title">
              {reminder.mode === 'cool'
                ? `Cool down after your ${ACTIVITY_BY_ID[reminder.activity].session}`
                : `Warm up before your ${ACTIVITY_BY_ID[reminder.activity].session}`}
            </p>
            <p className="reminder-meta">
              {isToday(reminder.at) ? 'Today' : dayFmt.format(reminder.at)} at {timeFmt.format(reminder.at)}.
              Notifications are simulated in this prototype.
            </p>
          </div>
          <button type="button" className="text-btn" onClick={() => dispatch({ type: 'CANCEL_REMINDER' })}>
            Cancel
          </button>
        </section>
      )}

      <h1 className="display home-title">I want to…</h1>

      <div className="mode-tiles">
        <button type="button" className="mode-tile" data-mode="warm" onClick={() => start('warm')}>
          <span className="mode-tile-arrow" aria-hidden="true">
            <Icon name="arrow_upward" />
          </span>
          <span className="mode-tile-label">Warm up</span>
          <span className="mode-tile-sub">Get loose before you go</span>
        </button>
        <button type="button" className="mode-tile" data-mode="cool" onClick={() => start('cool')}>
          <span className="mode-tile-arrow" aria-hidden="true">
            <Icon name="arrow_downward" />
          </span>
          <span className="mode-tile-label">Cool down</span>
          <span className="mode-tile-sub">Ease off when you’re done</span>
        </button>
      </div>
    </div>
  );
}

function isToday(ts: number) {
  return new Date(ts).toDateString() === new Date().toDateString();
}
