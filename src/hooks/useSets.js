import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useSets(uid) {
  const [sets, setSets]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setSets([]);
        setLoading(false);
      }, 0);
      return;
    }
    const ref = collection(db, 'users', uid, 'sets');
    const unsub = onSnapshot(ref,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const when = (v) => {
          if (!v) return 0;
          if (typeof v === 'object' && typeof v.toMillis === 'function') return v.toMillis();
          const d = Date.parse(v);
          return Number.isNaN(d) ? 0 : d;
        };
        data.sort((a, b) => when(b.created) - when(a.created));
        setSets(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [uid]);

  const addSet = async (set) => {
    if (!uid) {
      throw new Error('Cannot add set without user id');
    }
    const { id: _, ...data } = set;
    const docRef = await addDoc(collection(db, 'users', uid, 'sets'), {
      ...data, _updatedAt: serverTimestamp()
    });
    return docRef.id;
  };

  const updateSet = async (id, data) => {
    if (!uid) {
      throw new Error('Cannot update set without user id');
    }
    await updateDoc(doc(db, 'users', uid, 'sets', id), {
      ...data, _updatedAt: serverTimestamp()
    });
  };

  const deleteSet = async (id) => {
    if (!uid) {
      throw new Error('Cannot delete set without user id');
    }
    await deleteDoc(doc(db, 'users', uid, 'sets', id));
  };

  return { sets, loading, addSet, updateSet, deleteSet };
}
