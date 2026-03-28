import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, setDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import {
  ref as storageRef, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { uid as generateUid } from '../utils';

const LOCAL_IDEAS_KEY = 'cws_ideas';

const loadLocalIdeas = () => {
  try {
    const stored = window.localStorage.getItem(LOCAL_IDEAS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load local ideas:', err);
    return [];
  }
};

const saveLocalIdeas = (ideas) => {
  try {
    window.localStorage.setItem(LOCAL_IDEAS_KEY, JSON.stringify(ideas));
  } catch (err) {
    console.warn('Failed to save local ideas:', err);
  }
};

export function useIdeas(uid) {
  const [ideas, setIdeas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setIdeas([]);
        setError(null);
        setLoading(false);
      }, 0);
      return;
    }
    const ref = collection(db, 'users', uid, 'ideas');
    const unsub = onSnapshot(ref,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setIdeas(data);
        saveLocalIdeas(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        if (err?.code === 'permission-denied') {
          const local = loadLocalIdeas();
          setIdeas(local);
        }
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  const addIdea = async (idea) => {
    if (!uid) {
      throw new Error('Cannot add idea without user id');
    }
    const { id, _blob, ...data } = idea;
    const stableId = id || generateUid();
    let audioURL = null;
    let audioPath = null;

    // Upload voice blob to Firebase Storage if present
    if (_blob && _blob.size > 0) {
      const path = `users/${uid}/ideas/${stableId}.webm`;
      const sRef = storageRef(storage, path);
      try {
        const uploadTask = async () => {
          await uploadBytes(sRef, _blob, { contentType: 'audio/webm' });
          return await getDownloadURL(sRef);
        };
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 10000)
        );
        
        audioURL = await Promise.race([uploadTask(), timeoutPromise]);
        audioPath = path;
      } catch (uploadErr) {
        console.warn('Voice note upload failed or timed out, saving idea without audio.', uploadErr);
        audioURL = null;
        audioPath = null;
      }
    }

    const docRef = doc(db, 'users', uid, 'ideas', stableId);
    try {
      await setDoc(docRef, {
        ...data,
        audioURL,
        audioPath,
        _updatedAt: serverTimestamp(),
      });
      const updated = [{ id: stableId, ...data, audioURL, audioPath }, ...ideas];
      setIdeas(updated);
      saveLocalIdeas(updated);
      return docRef;
    } catch (err) {
      if (err?.code === 'permission-denied') {
        const local = [{ id: stableId, ...data, audioURL, audioPath }, ...ideas];
        setIdeas(local);
        saveLocalIdeas(local);
        return { id: stableId, ...data, audioURL, audioPath };
      }
      throw err;
    }
  };

  const updateIdea = async (id, data) => {
    try {
      await updateDoc(doc(db, 'users', uid, 'ideas', id), {
        ...data, _updatedAt: serverTimestamp(),
      });
      const next = ideas.map(i => (i.id === id ? { ...i, ...data } : i));
      setIdeas(next);
      saveLocalIdeas(next);
    } catch (err) {
      if (err?.code === 'permission-denied') {
        const next = ideas.map(i => (i.id === id ? { ...i, ...data } : i));
        setIdeas(next);
        saveLocalIdeas(next);
        return;
      }
      throw err;
    }
  };

  const deleteIdea = async (id, audioPath) => {
    // Delete voice file from Storage if it exists
    if (audioPath) {
      try {
        await deleteObject(storageRef(storage, audioPath));
      } catch (e) {
        console.warn('Storage delete (non-fatal):', e);
      }
    }

    try {
      await deleteDoc(doc(db, 'users', uid, 'ideas', id));
      const next = ideas.filter(i => i.id !== id);
      setIdeas(next);
      saveLocalIdeas(next);
    } catch (err) {
      if (err?.code === 'permission-denied') {
        const next = ideas.filter(i => i.id !== id);
        setIdeas(next);
        saveLocalIdeas(next);
        return;
      }
      throw err;
    }
  };

  return { ideas, loading, error, addIdea, updateIdea, deleteIdea };
}
