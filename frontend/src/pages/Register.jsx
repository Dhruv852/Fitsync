import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const FIELDS = [
  { name: 'name',     label: 'Full Name',   type: 'text',     placeholder: 'John Doe',        required: true  },
  { name: 'email',    label: 'Email',       type: 'email',    placeholder: 'you@example.com', required: true  },
  { name: 'password', label: 'Password',    type: 'password', placeholder: '8+ characters',   required: true  },
  { name: 'height',   label: 'Height (cm)', type: 'number',   placeholder: '175',             required: false },
  { name: 'weight',   label: 'Weight (kg)', type: 'number',   placeholder: '70',              required: false },
];

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', height: '', weight: '' });
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleChange  = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Let\'s get moving 🏃');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0b1120]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden bg-mesh">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-accent-600/10 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 shadow-glow flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FitSync</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Start your<br />
            <span className="text-gradient">fitness journey.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Join thousands tracking their health. Set goals, log workouts, and watch your progress grow.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { value: '14+',  label: 'Workout Types' },
              { value: '100%', label: 'Free Forever'  },
              { value: '24h',  label: 'Streak Tracking'},
              { value: '∞',    label: 'Goal History'  },
            ].map(({ value, label }) => (
              <div key={label} className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 relative z-10">© 2026 FitSync. Track smarter, live better.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 dark:bg-[#0f172a] overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">FitSync</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Email in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FIELDS.slice(0, 2).map(({ name, label, type, placeholder, required }) => (
                <div key={name}>
                  <label className="input-label" htmlFor={`reg-${name}`}>{label}</label>
                  <input
                    id={`reg-${name}`}
                    type={type}
                    name={name}
                    className="input-field"
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                  />
                </div>
              ))}
            </div>

            {/* Password */}
            {FIELDS.slice(2, 3).map(({ name, label, type, placeholder, required }) => (
              <div key={name}>
                <label className="input-label" htmlFor={`reg-${name}`}>{label}</label>
                <input
                  id={`reg-${name}`}
                  type={type}
                  name={name}
                  className="input-field"
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  required={required}
                />
              </div>
            ))}

            {/* Height + Weight */}
            <div className="grid grid-cols-2 gap-4">
              {FIELDS.slice(3).map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="input-label" htmlFor={`reg-${name}`}>{label} <span className="text-gray-400 normal-case">(optional)</span></label>
                  <input
                    id={`reg-${name}`}
                    type={type}
                    name={name}
                    className="input-field"
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary w-full !mt-6" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
