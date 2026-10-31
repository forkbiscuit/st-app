import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useEffect } from 'react';
import { ACTIVITY_BY_ID, isActivityId } from '../data/activities';
import type { ActivityId, Mode, Reminder } from '../data/types';

// Everything that behaves differently in the iOS app (Capacitor) lives here.
// On the web each call falls back to the browser, or does nothing.

export const isNative = Capacitor.isNativePlatform();

/** One-time setup at launch: native-only CSS hooks and no pinch zoom. */
export function setupNative() {
  if (!isNative) return;
  const root = document.documentElement;
  root.classList.add('is-native');
  // An app shouldn't pinch-zoom like a web page.
  document
    .querySelector('meta[name=viewport]')
    ?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
}

const quietly = (p: Promise<unknown>) => p.catch(() => undefined);

function vibrate(pattern: number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

/** Half-way switch on a two-sided move. */
export function hapticSwitch() {
  if (isNative) quietly(Haptics.impact({ style: ImpactStyle.Heavy }));
  else vibrate([120]);
}

/** A timed move finished. */
export function hapticDone() {
  if (isNative) quietly(Haptics.notification({ type: NotificationType.Success }));
  else vibrate([60, 60, 60]);
}

/**
 * Keeps the screen on while `active` (the player), so it doesn't lock
 * mid-stretch. Native uses the app's idle timer; the web uses a wake lock,
 * taken again when the tab comes back into view.
 */
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let done = false;
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if (isNative) await KeepAwake.keepAwake();
        else if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          lock = await navigator.wakeLock.request('screen');
          if (done) quietly(lock.release());
        }
      } catch {
        /* not allowed or not supported: the screen may sleep */
      }
    };
    const onVisible = () => {
      if (!isNative && !done && document.visibilityState === 'visible') acquire();
    };
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      done = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (isNative) quietly(KeepAwake.allowSleep());
      else if (lock) quietly(lock.release());
    };
  }, [active]);
}

const REMINDER_ID = 1;

/**
 * Mirrors the app's reminder as a real notification (native only). Called
 * whenever the reminder changes; asks for permission the first time one is set.
 */
export async function syncReminder(reminder: Reminder | null) {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    if (!reminder || reminder.at <= Date.now()) return;
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted' && permission.display !== 'denied') {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display !== 'granted') return;
    const { session } = ACTIVITY_BY_ID[reminder.activity];
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: reminder.mode === 'cool' ? 'Time to cool down' : 'Time to warm up',
          body: reminder.mode === 'cool' ? `Cool down after your ${session}.` : `Warm up before your ${session}.`,
          schedule: { at: new Date(reminder.at) },
          extra: { mode: reminder.mode, activity: reminder.activity },
        },
      ],
    });
  } catch {
    /* notifications unavailable: the reminder still shows on the home screen */
  }
}

/** Calls `open` when someone taps a reminder notification. Returns an unsubscribe. */
export function onReminderOpened(open: (mode: Mode, activity: ActivityId) => void): () => void {
  if (!isNative) return () => undefined;
  const handle = LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
    const { mode, activity } = (notification.extra ?? {}) as { mode?: unknown; activity?: unknown };
    if ((mode === 'warm' || mode === 'cool') && isActivityId(activity)) open(mode, activity);
  });
  return () => {
    handle.then((h) => h.remove()).catch(() => undefined);
  };
}
