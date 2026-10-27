import { Icon } from './Icon';

/** Top-bar entry to the Bookmarks screen (wireframes 1–3). Shows a count when there are bookmarks. */
export function BookmarksButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      className="icon-btn bookmarks-btn"
      aria-label={count ? `Bookmarks, ${count} saved` : 'Bookmarks'}
      title="Bookmarks"
      onClick={onClick}
    >
      <Icon name="bookmarks" filled={count > 0} />
      {count > 0 && (
        <span className="badge" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}
