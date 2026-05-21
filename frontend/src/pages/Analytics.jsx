import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { fitnessAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

const RANGES = [
  { label: '7 Days',  days: 7  },
  { label: '30 Days', days: 30 },
  { label: 'All Time', days: null },
];

/** Returns an array of date strings from `daysAgo` days ago to today */
function buildDateRange(days) {
  const today = new Date();
  const result = [];
  const count = days ?? 365 * 5; // "all time" — cap at 5 years of slots
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

/** Formats date string to short label like "May 19" or "Mon" */
function shortLabel(dateStr, totalDays) {
  const d = new Date(dateStr);
  if (totalDays === 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Analytics() {
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(7);

  useEffect(() => {
    Promise.all([
      fitnessAPI.getWorkouts(),
      fitnessAPI.getWeights(),
    ])
      .then(([w, wt]) => {
        setAllWorkouts(w.data.data);
        setWeights(wt.data.data);
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data whenever workouts or rangeDays change
  const { calorieChart, stats, filteredWorkouts } = useMemo(() => {
    if (!allWorkouts.length) {
      return {
        calorieChart: { labels: [], datasets: [] },
        stats: { total: 0, weekTotal: 0, avgPerWorkout: 0 },
        filteredWorkouts: [],
      };
    }

    // Determine the start date
    const today = new Date().toISOString().split('T')[0];
    let startDate;
    if (rangeDays) {
      const d = new Date();
      d.setDate(d.getDate() - (rangeDays - 1));
      startDate = d.toISOString().split('T')[0];
    } else {
      // All time: find the earliest workout date
      const dates = allWorkouts.map((w) => w.date).sort();
      startDate = dates[0] || today;
    }

    // Filter workouts within range
    const filtered = allWorkouts.filter((w) => w.date >= startDate && w.date <= today);

    // Build a map of date -> calories for quick lookup
    const calByDate = {};
    filtered.forEach((w) => {
      calByDate[w.date] = (calByDate[w.date] || 0) + (w.calories || 0);
    });

    // Build contiguous date slots
    const slots = buildDateRange(rangeDays ?? Math.ceil((new Date(today) - new Date(startDate)) / 86400000) + 1);
    // For "all time", only show dates from startDate onward
    const visibleSlots = slots.filter((d) => d >= startDate && d <= today);

    const labels = visibleSlots.map((d) => shortLabel(d, rangeDays));
    const data   = visibleSlots.map((d) => calByDate[d] || 0);

    const totalCal   = filtered.reduce((s, w) => s + (w.calories || 0), 0);
    const avgPerWork = filtered.length ? Math.round(totalCal / filtered.length) : 0;

    // "This week" calories (always last 7 days regardless of range)
    const weekAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split('T')[0]; })();
    const weekCal = allWorkouts
      .filter((w) => w.date >= weekAgo && w.date <= today)
      .reduce((s, w) => s + (w.calories || 0), 0);

    return {
      calorieChart: {
        labels,
        datasets: [
          {
            label: 'Calories Burned',
            data,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointRadius: visibleSlots.length > 60 ? 2 : 4,
          },
        ],
      },
      stats: { total: totalCal, weekTotal: weekCal, avgPerWorkout: avgPerWork },
      filteredWorkouts: filtered,
    };
  }, [allWorkouts, rangeDays]);

  const weightChart = useMemo(() => ({
    labels: [...weights].reverse().map((w) => w.date),
    datasets: [
      {
        label: 'Weight (kg)',
        data: [...weights].reverse().map((w) => w.weight),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  }), [weights]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <p className="text-gray-500">Charts and statistics for your fitness journey</p>
        </div>

        {/* Date range toggle */}
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRangeDays(r.days)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                rangeDays === r.days
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="card text-center">
          <p className="text-sm text-gray-500">
            {rangeDays ? `Last ${rangeDays} Days` : 'All Time'} Calories
          </p>
          <p className="text-3xl font-bold text-orange-500">{stats.total.toLocaleString()}</p>
        </article>
        <article className="card text-center">
          <p className="text-sm text-gray-500">This Week</p>
          <p className="text-3xl font-bold text-brand-600">{stats.weekTotal.toLocaleString()}</p>
        </article>
        <article className="card text-center">
          <p className="text-sm text-gray-500">Avg per Workout</p>
          <p className="text-3xl font-bold text-purple-500">{stats.avgPerWorkout}</p>
        </article>
      </section>

      {/* Calorie chart */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">
          Calories Burned
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''})
          </span>
        </h2>
        {calorieChart.labels.length > 0 ? (
          <Line
            data={calorieChart}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { maxTicksLimit: 10, maxRotation: 30 } },
                y: { beginAtZero: true },
              },
            }}
          />
        ) : (
          <p className="text-gray-500">No workout data in this range. Log a workout to see charts.</p>
        )}
      </section>

      {/* Weight chart */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Weight Progress (All Time)</h2>
        {weights.length > 0 ? (
          <Bar
            data={weightChart}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: false } },
            }}
          />
        ) : (
          <p className="text-gray-500">Log weight via BMI calculator to see progress.</p>
        )}
      </section>
    </div>
  );
}




