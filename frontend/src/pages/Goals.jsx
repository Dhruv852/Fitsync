import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { goalAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';

const TYPE_META = {
  general:  { icon: '⭐', color: 'from-violet-500 to-purple-500',  bg: 'bg-violet-100 dark:bg-violet-900/40',  text: 'text-violet-600 dark:text-violet-400' },
  weight:   { icon: '⚖️', color: 'from-blue-500 to-indigo-500',   bg: 'bg-blue-100 dark:bg-blue-900/40',     text: 'text-blue-600 dark:text-blue-400'   },
  distance: { icon: '🏃', color: 'from-green-500 to-emerald-500', bg: 'bg-green-100 dark:bg-green-900/40',   text: 'text-green-600 dark:text-green-400' },
  calories: { icon: '🔥', color: 'from-orange-500 to-rose-500',   bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400'},
};

export default function Goals() {
  const [goals, setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'general', target: '', current: '0', unit: '', deadline: '',
  });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await goalAPI.getGoals();
      setGoals(res.data.data);
    } catch { toast.error('Failed to load goals'); }
    finally  { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalAPI.createGoal(form);
      toast.success('Goal created! 🎯');
      setForm({ title: '', type: 'general', target: '', current: '0', unit: '', deadline: '' });
      loadGoals();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create goal'); }
    finally { setSaving(false); }
  };

  const updateProgress = async (id, current) => {
    try {
      await goalAPI.updateGoal(id, { current: Number(current) });
      toast.success('Progress updated');
      loadGoals();
    } catch { toast.error('Update failed'); }
  };

  const deleteGoal = async (id) => {
    try {
      await goalAPI.deleteGoal(id);
      toast.success('Goal removed');
      loadGoals();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  const active    = goals.filter((g) => g.status !== 'completed');
  const completed = goals.filter((g) => g.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="page-title">Fitness Goals</h1>
        <p className="page-subtitle">Set targets and track your progress</p>
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm">🎯</span>
          New Goal
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Goal Title</label>
            <input
              className="input-field"
              placeholder="e.g. Run 100km this month"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="general">⭐ General</option>
                <option value="weight">⚖️ Weight</option>
                <option value="distance">🏃 Distance</option>
                <option value="calories">🔥 Calories</option>
              </select>
            </div>
            <div>
              <label className="input-label">Deadline <span className="text-gray-400 normal-case">(optional)</span></label>
              <input
                className="input-field"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Target Value</label>
              <input
                className="input-field"
                type="number"
                placeholder="100"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Unit <span className="text-gray-400 normal-case">(optional)</span></label>
              <input
                className="input-field"
                placeholder="km, kg, kcal…"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Creating…' : '🎯 Create Goal'}
          </button>
        </form>
      </div>

      {/* Active goals */}
      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
            Active · {active.length}
          </h2>
          <div className="space-y-3">
            {active.map((g) => <GoalCard key={g.id} g={g} onUpdate={updateProgress} onDelete={deleteGoal} />)}
          </div>
        </section>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
            Completed · {completed.length}
          </h2>
          <div className="space-y-3">
            {completed.map((g) => <GoalCard key={g.id} g={g} onUpdate={updateProgress} onDelete={deleteGoal} />)}
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <div className="card text-center py-16 space-y-3">
          <span className="text-5xl">🎯</span>
          <p className="text-gray-500 dark:text-slate-400">No goals yet. Create your first one above!</p>
        </div>
      )}
    </div>
  );
}

function GoalCard({ g, onUpdate, onDelete }) {
  const [inputVal, setInputVal] = useState(String(g.current));
  const meta = TYPE_META[g.type] || TYPE_META.general;
  const pct  = Math.min(g.progressPercent, 100);
  const done = g.status === 'completed';

  const daysLeft = g.deadline
    ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000)
    : null;

  return (
    <article className={`card !p-0 overflow-hidden border-l-4 ${done ? 'border-emerald-500' : 'border-brand-500'}`}>
      <div className="p-5 space-y-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center text-xl shrink-0`}>
              {meta.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white leading-tight">{g.title}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {g.current} / {g.target} {g.unit}
                {daysLeft !== null && (
                  <span className={`ml-2 ${daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : 'text-gray-400'}`}>
                    · {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`badge ${done
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
            }`}>
              {done ? '✓ Done' : `${pct}%`}
            </span>
            <button onClick={() => onDelete(g.id)} className="btn-danger !py-1 !px-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="progress-bar h-2.5">
            <div
              className={`progress-fill h-2.5 bg-gradient-to-r ${meta.color}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Update input */}
        {!done && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="input-label">Update progress</label>
              <input
                type="number"
                className="input-field !py-2"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onBlur={() => onUpdate(g.id, inputVal)}
                placeholder="Current value"
              />
            </div>
            <button
              onClick={() => onUpdate(g.id, inputVal)}
              className="btn-secondary !py-2 mt-5"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
