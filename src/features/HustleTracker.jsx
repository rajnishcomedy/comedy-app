import { useState } from 'react';
import { uid } from '../utils';
import { Button, Input, Modal, EmptyState } from '../components/UI';
import { Plus, ListTodo, Trash2 } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Completed'];

export default function HustleTracker({ tasks = [], addTask, updateTask, deleteTask, toast }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', desc: '', status: 'To Do' });
  const [editing, setEditing]   = useState(null);

  const openNew = (status = 'To Do') => {
    setForm({ title: '', desc: '', status });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setForm({ title: t.title, desc: t.desc || '', status: t.status });
    setEditing(t.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    try {
      if (editing) {
        await updateTask(editing, form);
        toast?.success('Task updated!');
      } else {
        await addTask({ id: uid(), ...form, order: Date.now() });
        toast?.success('Task added!');
      }
      setShowForm(false);
    } catch (err) {
      console.error('Task save failed:', err);
      toast?.error(err?.message || 'Failed to save task. Please retry.');
    }
  };

  const del = async (id) => {
    try {
      await deleteTask(id);
      setShowForm(false);
      toast?.info('Task deleted');
    } catch (err) {
      console.error('Task delete failed:', err);
      toast?.error(err?.message || 'Failed to delete task.');
    }
  };

  const moveTask = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
    } catch (err) {
      console.error('Task move failed:', err);
      toast?.error(err?.message || 'Failed to move task.');
    }
  };

  return (
    <div style={{ padding: 40, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }} className="fade-in scrollable">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)' }}>Hustle Tracker</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Manage tasks, bookings, and comedy goals.</p>
        </div>
        <Button onClick={() => openNew()} variant="primary" icon={Plus}>Add Task</Button>
      </div>

      {tasks.length === 0 && (
        <EmptyState icon={ListTodo} text="No tasks yet" sub="Add your first task to start hustling." />
      )}

      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0, overflowX: 'auto', paddingBottom: 20 }}>
        {COLUMNS.map(col => (
          <div key={col} style={{
            flex: 1, minWidth: 300,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            display: 'flex', flexDirection: 'column', padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col === 'To Do' ? 'var(--text3)' : col === 'In Progress' ? 'var(--amber)' : 'var(--green)' }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12 }}>
                  {tasks.filter(t => t.status === col).length}
                </span>
              </div>
              <button onClick={() => openNew(col)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }} className="hover-lift">
                <Plus size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }} className="scrollable">
              {tasks.filter(t => t.status === col).map(t => (
                <div key={t.id} className="card hover-lift" style={{ padding: 16, cursor: 'pointer' }} onClick={() => openEdit(t)}>
                  <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>{t.title}</h4>
                  {t.desc && (
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {t.desc}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }} onClick={e => e.stopPropagation()}>
                    <select value={t.status} onChange={(e) => moveTask(t.id, e.target.value)}
                      style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)', cursor: 'pointer' }}
                    >
                      {COLUMNS.map(c => <option key={c} value={c}>→ {c}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Task' : 'New Task'} width={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Task Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="E.g., Email Comedy Store booker" />
          <Input label="Description (optional)" value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} multiline rows={4} placeholder="Add details or context..." />
          <div>
            <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%' }}>
              {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>{editing && <Button onClick={() => del(editing)} variant="danger" icon={Trash2}>Delete</Button>}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
              <Button onClick={save} variant="primary">Save Task</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
