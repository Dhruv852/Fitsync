import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fitnessAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';

const WORKOUT_TYPES = ['Running', 'Cycling', 'Swimming', 'Strength Training', 'Yoga', 'HIIT', 'Walking'];
const TYPE_ICONS = { Running:'🏃', Cycling:'🚴', Swimming:'🏊', 'Strength Training':'🏋️', Yoga:'🧘', HIIT:'⚡', Walking:'🚶' };

const todayStr = () => new Date().toISOString().split('T')[0];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    type: 'Running', duration: '', calories: '', notes: '', date: todayStr(),
  });

  useEffect(() => { loadWorkouts(); }, []);

  const loadWorkouts = async () => {
    try {
      const res = await fitnessAPI.getWorkouts();
      setWorkouts(res.data.data);
    } catch { toast.error('Failed to load workouts'); }
    finally  { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fitnessAPI.addWorkout(form);
      toast.success('Workout logged! 💪');
      setForm({ type: 'Running', duration: '', calories: '', notes: '', date: todayStr() });
      loadWorkouts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add workout'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await fitnessAPI.deleteWorkout(id);
      toast.success('Workout removed');
      loadWorkouts();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingSpinner />;

  // Group workouts by date
  const grouped = workouts.reduce((acc, w) => {
    (acc[w.date] = acc[w.date] || []).push(w);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="page-title">Workout Tracker</h1>
        <p className="page-subtitle">Log exercises and view your full history</p>
      </div>

      {/* Add form */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm">+</span>
          Log a Workout
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type + Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Type</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {WORKOUT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Date</label>
              <input
                className="input-field"
                type="date"
                value={form.date}
                max={todayStr()}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration + Calories row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Duration (min)</label>
              <input
                className="input-field"
                type="number"
                placeholder="30"
                min="1"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Calories <span className="text-gray-400 normal-case">(optional)</span></label>
              <input
                className="input-field"
                type="number"
                placeholder="Auto-calculated"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="input-label">Notes <span className="text-gray-400 normal-case">(optional)</span></label>
            <input
              className="input-field"
              placeholder="e.g. Morning run, felt great"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : '💾 Save Workout'}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h2 className="font-semibold text-gray-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider">
          History · {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
        </h2>

        {sortedDates.length === 0 ? (
          <div className="card text-center py-16 space-y-3">
            <span className="text-5xl">🏋️</span>
            <p className="text-gray-500 dark:text-slate-400">No workouts yet. Log your first session above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => (
              <div key={date} className="card !p-0 overflow-hidden">
                {/* Date header */}
                <div className="px-5 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {formatDate(date)}
                  </p>
                </div>

                {/* Workout rows */}
                <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {grouped[date].map((w) => (
                    <li key={w.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center text-lg shrink-0">
                        {TYPE_ICONS[w.type] || '🏃'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{w.type}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-slate-400">⏱ {w.duration} min</span>
                          <span className="text-xs text-orange-500">🔥 {w.calories} cal</span>
                          {w.notes && <span className="text-xs text-gray-400 truncate max-w-[200px]">{w.notes}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="btn-danger shrink-0"
                        aria-label="Delete workout"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today)     return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
