import { useState, useEffect, useCallback } from 'react';
import {
  doc, onSnapshot, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useProfile(uid) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setProfile({});
        setLoading(false);
      }, 0);
      return;
    }
    const ref = doc(db, 'users', uid, 'profile', 'data');
    const unsub = onSnapshot(ref,
      (snap) => {
        setProfile(snap.exists() ? snap.data() : {});
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [uid]);

  const saveProfile = useCallback(async (data) => {
    if (!uid) {
      throw new Error('Cannot save profile without user id');
    }
    await setDoc(doc(db, 'users', uid, 'profile', 'data'), {
      ...data, _updatedAt: serverTimestamp()
    }, { merge: true });
  }, [uid]);

  return { profile, loading, saveProfile };
}
