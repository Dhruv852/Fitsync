import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fitnessAPI } from '../api/services';

const BMI_RANGES = [
  { max: 18.5, label: 'Underweight', color: 'text-blue-500',  bar: 'bg-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/40',   tip: 'Consider consulting a nutritionist to reach a healthy weight.' },
  { max: 25,   label: 'Normal',      color: 'text-emerald-500',bar:'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', tip: 'Great job! Maintain your routine and healthy diet.' },
  { max: 30,   label: 'Overweight',  color: 'text-amber-500', bar: 'bg-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/40',  tip: 'Try adding more cardio and monitoring caloric intake.' },
  { max: 999,  label: 'Obese',       color: 'text-red-500',   bar: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-950/40',      tip: 'Consulting a healthcare professional is recommended.' },
];

function getMeta(bmi) {
  return BMI_RANGES.find((r) => bmi < r.max) || BMI_RANGES[3];
}

/** Maps BMI 10-40 to a 0-100% position on the gauge */
function bmiToPercent(bmi) {
  return Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);
}

export default function BMI() {
  const { user, refreshProfile } = useAuth();
  const [weight, setWeight]     = useState(user?.weight || '');
  const [height, setHeight]     = useState(user?.height || '');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fitnessAPI.calculateBMI({ weight, height });
      setResult(res.data.data);
      await fitnessAPI.logWeight({ weight });
      await refreshProfile();
      toast.success('BMI calculated & weight logged ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? getMeta(result.bmi) : null;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">BMI Calculator</h1>
        <p className="page-subtitle">Calculate your Body Mass Index and log weight</p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={calculate} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label" htmlFor="bmi-weight">Weight (kg)</label>
              <input
                id="bmi-weight"
                type="number"
                step="0.1"
                min="1"
                className="input-field"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label" htmlFor="bmi-height">Height (cm)</label>
              <input
                id="bmi-height"
                type="number"
                min="50"
                className="input-field"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Calculating…
              </span>
            ) : '⚖️ Calculate BMI'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && meta && (
        <div className={`card animate-slide-up border-l-4 ${meta.bar.replace('bg-', 'border-')}`}>
          {/* Big BMI number */}
          <div className="text-center py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Your BMI</p>
            <p className={`text-7xl font-black ${meta.color} leading-none`}>{result.bmi}</p>
            <p className={`text-xl font-bold mt-3 ${meta.color}`}>{result.category}</p>
          </div>

          {/* Gauge bar */}
          <div className="mt-4 mb-6 px-2">
            <div className="relative h-3 rounded-full overflow-hidden" style={{
              background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 30%, #f59e0b 55%, #ef4444 80%, #991b1b 100%)'
            }}>
              {/* Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-md transition-all duration-700"
                style={{ left: `calc(${bmiToPercent(result.bmi)}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5">
              <span>Under</span>
              <span>Normal</span>
              <span>Over</span>
              <span>Obese</span>
            </div>
          </div>

          {/* Stats */}
          <div className={`p-4 rounded-xl ${meta.bg} space-y-2`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Weight</p>
                <p className="font-bold text-gray-900 dark:text-white">{result.weightKg} kg</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Height</p>
                <p className="font-bold text-gray-900 dark:text-white">{result.heightCm} cm</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-black/5 dark:border-white/10">
              💡 {meta.tip}
            </p>
          </div>
        </div>
      )}

      {/* Reference table */}
      <div className="card !p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">BMI Reference</p>
        <div className="space-y-2">
          {[
            { range: '< 18.5',    label: 'Underweight', color: 'bg-blue-500'   },
            { range: '18.5 – 24.9', label: 'Normal',   color: 'bg-emerald-500' },
            { range: '25 – 29.9', label: 'Overweight',  color: 'bg-amber-500'  },
            { range: '≥ 30',      label: 'Obese',       color: 'bg-red-500'    },
          ].map(({ range, label, color }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
              <span className="text-gray-500 dark:text-slate-400 w-24 text-xs">{range}</span>
              <span className="font-medium text-gray-800 dark:text-slate-200">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
