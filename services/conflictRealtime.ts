import { db } from '@/config/firebase';
import { ConflictZone } from '@/types/conflict';
import { collection, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';

export type ConflictRealtimeEventType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'severity_changed'
  | 'location_changed'
  | 'verification_changed'
  | 'intel_updated'
  | 'metrics_updated'
  | 'tags_changed';

export interface ConflictRealtimeEvent {
  id: string;
  type: ConflictRealtimeEventType;
  before?: Partial<ConflictZone>;
  after?: ConflictZone;
  changedFields: string[];
  occurredAt: string;
}

const conflictsRef = collection(db, 'conflictZones');

export function subscribeToConflictZones(
  since: Date,
  onEvent: (event: ConflictRealtimeEvent) => void
) {
  const q = query(
    conflictsRef,
    where('updatedAt', '>', since),
    orderBy('updatedAt', 'asc'),
    limit(200)
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const after = change.doc.data() as any as ConflictZone;
      const id = change.doc.id;

      if (change.type === 'added') {
        onEvent({
          id,
          type: 'created',
          after,
          changedFields: Object.keys(after || {}),
          occurredAt: (after as any)?.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        });
        return;
      }

      if (change.type === 'removed') {
        onEvent({ id, type: 'deleted', changedFields: [], occurredAt: new Date().toISOString() });
        return;
      }

      // modified
      const before = undefined; // Firestore doesn't provide old snapshot here; compute diff by keys if needed from cache
      const changedFields: string[] = []; // Placeholder for future diffing
      let type: ConflictRealtimeEventType = 'updated';

      if (after) {
        // Heuristic event typing based on field presence; consumers can refine
        if ((after as any).status !== undefined) type = 'status_changed';
        if ((after as any).severity !== undefined) type = 'severity_changed';
        if ((after as any).latitude !== undefined || (after as any).longitude !== undefined) type = 'location_changed';
        if ((after as any).verified !== undefined) type = 'verification_changed';
        if ((after as any).sources !== undefined) type = 'intel_updated';
        if ((after as any).casualties !== undefined) type = 'metrics_updated';
        if ((after as any).tags !== undefined) type = 'tags_changed';
      }

      onEvent({
        id,
        type,
        before,
        after,
        changedFields,
        occurredAt: (after as any)?.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      });
    });
  });
}


