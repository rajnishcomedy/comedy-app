import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useJokes(uid) {
  const [jokes, setJokes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setJokes([]);
        setError(null);
        setLoading(false);
      }, 0);
      return;
    }
    const ref = collection(db, 'users', uid, 'jokes');
    const unsub = onSnapshot(ref,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by created date desc
        data.sort((a, b) => (b.created || '').localeCompare(a.created || ''));
        setJokes(data);
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [uid]);

  const addJoke = async (joke) => {
    if (!uid) {
      throw new Error('Cannot add joke without user id');
    }
    const { id: _, ...data } = joke;
    await addDoc(collection(db, 'users', uid, 'jokes'), {
      ...data, 
      duration: data.duration || 0,
      tags: data.tags || [],
      punchlines: data.punchlines || [{ text: data.punch || '', note: 'Original', active: true }],
      _updatedAt: serverTimestamp()
    });
  };

  const updateJoke = async (id, data) => {
    if (!uid) {
      throw new Error('Cannot update joke without user id');
    }
    await updateDoc(doc(db, 'users', uid, 'jokes', id), {
      ...data, _updatedAt: serverTimestamp()
    });
  };

  const deleteJoke = async (id) => {
    if (!uid) {
      throw new Error('Cannot delete joke without user id');
    }
    await deleteDoc(doc(db, 'users', uid, 'jokes', id));
  };

  return { jokes, loading, error, addJoke, updateJoke, deleteJoke };
}
