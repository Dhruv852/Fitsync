import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fitnessAPI, authAPI, goalAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';

const STAT_CONFIGS = [
  {
    key: 'workoutsCount',
    label: 'Workouts Today',
    icon: '💪',
    suffix: '',
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/30',
  },
  {
    key: 'totalCalories',
    label: 'Calories Burned',
    icon: '🔥',
    suffix: ' kcal',
    gradient: 'from-orange-500 to-rose-500',
    glow: 'shadow-orange-500/30',
  },
  {
    key: 'waterGlasses',
    label: 'Water Intake',
    icon: '💧',
    suffix: ' glasses',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/30',
  },
  {
    key: 'streak',
    label: 'Day Streak',
    icon: '⚡',
    suffix: ' days',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/30',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary]         = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [waterLoading, setWaterLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sumRes, goalRes] = await Promise.all([
        fitnessAPI.getDailySummary(),
        goalAPI.getWeeklyProgress(),
      ]);
      setSummary(sumRes.data.data);
      setGoalProgress(goalRes.data.data);
      await authAPI.updateStreak();
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addWater = async () => {
    setWaterLoading(true);
    try {
      await fitnessAPI.logWater({ glasses: 1 });
      toast.success('💧 +1 glass logged!');
      loadData();
    } catch {
      toast.error('Could not log water');
    } finally {
      setWaterLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statValues = {
    workoutsCount: summary?.workoutsCount ?? 0,
    totalCalories: summary?.totalCalories ?? 0,
    waterGlasses:  summary?.waterGlasses  ?? 0,
    streak:        user?.streak           ?? 0,
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
            {today}
          </p>
          <h1 className="page-title">
            Good {getGreeting()}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's your fitness overview for today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CONFIGS.map(({ key, label, icon, suffix, gradient, glow }) => (
          <div
            key={key}
            className={`stat-card bg-gradient-to-br ${gradient} shadow-lg ${glow}`}
          >
            {/* Decorative circle */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-4 -right-2 w-14 h-14 rounded-full bg-white/5 pointer-events-none" />

            <span className="text-2xl relative z-10">{icon}</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-3 relative z-10 leading-none">
              {statValues[key].toLocaleString()}{suffix && <span className="text-sm font-medium opacity-80 ml-1">{suffix.trim()}</span>}
            </p>
            <p className="text-xs text-white/70 mt-1 font-medium relative z-10">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions + Goals row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick water log */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white text-base">Quick Actions</h2>

          <button
            onClick={addWater}
            disabled={waterLoading}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-cyan-200 dark:border-cyan-800
              hover:border-cyan-400 dark:hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20
              transition-all duration-200 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-xl
              group-hover:scale-110 transition-transform duration-200">
              💧
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-800 dark:text-white">Log Water</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {waterLoading ? 'Logging…' : `${statValues.waterGlasses} / 8 glasses today`}
              </p>
            </div>
            <div className="ml-auto">
              <div className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold
                group-hover:bg-cyan-400 transition-colors">+</div>
            </div>
          </button>

          {/* Water progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
              <span>Daily hydration goal</span>
              <span>{Math.min(statValues.waterGlasses, 8)}/8</span>
            </div>
            <div className="progress-bar h-2">
              <div
                className="progress-fill h-2"
                style={{ width: `${Math.min((statValues.waterGlasses / 8) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400">
            Latest weight:{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {summary?.latestWeight ? `${summary.latestWeight} kg` : '—'}
            </span>
          </div>
        </div>

        {/* Goals progress */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-white text-base">Goals Overview</h2>

          {goalProgress?.activeGoals > 0 ? (
            <div className="space-y-3">
              {/* Big percent */}
              <div className="flex items-end gap-2">
                <p className="text-4xl font-extrabold text-gradient leading-none">
                  {goalProgress?.averageProgress ?? 0}%
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">avg completion</p>
              </div>
              <div className="progress-bar h-3">
                <div className="progress-fill h-3" style={{ width: `${goalProgress?.averageProgress ?? 0}%` }} />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-gray-600 dark:text-slate-400">{goalProgress?.activeGoals ?? 0} active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-600 dark:text-slate-400">{goalProgress?.completedGoals ?? 0} completed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <span className="text-4xl">🎯</span>
              <p className="text-sm text-gray-500 dark:text-slate-400">No goals yet</p>
              <a href="/goals" className="text-xs text-brand-600 font-semibold hover:underline">Set your first goal →</a>
            </div>
          )}
        </div>
      </div>

      {/* Today's total workouts summary */}
      {summary?.totalWorkouts > 0 && (
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-2xl shrink-0">
            🏋️
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">
              {summary.totalWorkouts} total workout{summary.totalWorkouts !== 1 ? 's' : ''} logged
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Keep the momentum going! Head to Analytics to see your trends.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
