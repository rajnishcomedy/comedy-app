import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useTasks(uid) {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTimeout(() => {
        setTasks([]);
        setLoading(false);
      }, 0);
      return;
    }
    const ref = collection(db, 'users', uid, 'tasks');
    const unsub = onSnapshot(ref,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        setTasks(data);
        setLoading(false);
      },
      (err) => { console.error('Tasks snapshot error:', err); setLoading(false); }
    );
    return unsub;
  }, [uid]);

  const addTask = async (task) => {
    if (!uid) {
      throw new Error('Cannot add task without user id');
    }
    const { id: _, ...data } = task;
    await addDoc(collection(db, 'users', uid, 'tasks'), {
      ...data, _updatedAt: serverTimestamp()
    });
  };

  const updateTask = async (id, data) => {
    if (!uid) {
      throw new Error('Cannot update task without user id');
    }
    await updateDoc(doc(db, 'users', uid, 'tasks', id), {
      ...data, _updatedAt: serverTimestamp()
    });
  };

  const deleteTask = async (id) => {
    if (!uid) {
      throw new Error('Cannot delete task without user id');
    }
    await deleteDoc(doc(db, 'users', uid, 'tasks', id));
  };

  return { tasks, loading, addTask, updateTask, deleteTask };
}
