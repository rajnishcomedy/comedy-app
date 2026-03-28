import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, updateDoc,
  deleteDoc, doc, serverTimestamp, setDoc
} from 'firebase/firestore';
import {
  ref as storageRef, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { uid as generateUid } from '../utils';

export function useShows(uid) {
  const [shows, setShows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setShows([]);
        setError(null);
        setLoading(false);
      }, 0);
      return;
    }
    const ref = collection(db, 'users', uid, 'shows');
    const unsub = onSnapshot(ref,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setShows(data);
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [uid]);

  const addShow = async (show) => {
    if (!uid) {
      throw new Error('Cannot add show without user id');
    }
    const { id, _blob, ...data } = show;
    const stableId = id || generateUid();
    let audioURL = null;
    let audioPath = null;

    if (_blob) {
      const path = `users/${uid}/shows/${stableId}.webm`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, _blob, { contentType: 'audio/webm' });
      audioURL = await getDownloadURL(sRef);
      audioPath = path;
    }

    const docRef = doc(db, 'users', uid, 'shows', stableId);
    await setDoc(docRef, {
      ...data,
      audioURL,
      audioPath,
      results: data.results || {}, // Mapping { jokeId -> rating }
      _updatedAt: serverTimestamp(),
    });
    return stableId;
  };

  const updateShow = async (id, data) => {
    if (!uid) {
      throw new Error('Cannot update show without user id');
    }
    const { _blob, ...cleanData } = data;
    let updatePayload = { ...cleanData, _updatedAt: serverTimestamp() };

    if (_blob) {
      const path = `users/${uid}/shows/${id}.webm`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, _blob, { contentType: 'audio/webm' });
      updatePayload.audioURL = await getDownloadURL(sRef);
      updatePayload.audioPath = path;
    }

    await updateDoc(doc(db, 'users', uid, 'shows', id), updatePayload);
  };

  const deleteShow = async (id, audioPath) => {
    if (!uid) {
      throw new Error('Cannot delete show without user id');
    }
    
    if (audioPath) {
      try {
        await deleteObject(storageRef(storage, audioPath));
      } catch (e) {
        console.warn('Show storage delete error:', e);
      }
    }

    await deleteDoc(doc(db, 'users', uid, 'shows', id));
  };

  return { shows, loading, error, addShow, updateShow, deleteShow };
}

