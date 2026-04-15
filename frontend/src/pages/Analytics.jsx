import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Award } from 'lucide-react';
import useProblemStore from '../store/problemStore';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { DIFFICULTY_COLORS, CHART_COLORS } from '../utils/constants';
import useAnimatedCounter from '../hooks/useAnimatedCounter';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl px-4 py-2.5 shadow-xl">
        <p className="text-xs text-light-muted dark:text-dark-muted mb-1">
          {label}
        </p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { analytics, fetchAnalytics, isLoading } = useProblemStore();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const animatedTotal = useAnimatedCounter(analytics?.totalSolved || 0, 1000);
  const animatedRate = useAnimatedCounter(analytics?.completionRate || 0, 1000);
  const animatedStreak = useAnimatedCounter(analytics?.streak?.current || 0, 1000);

  if (isLoading && !analytics) return <DashboardSkeleton />;

  if (!analytics) {
    return (
      <div className="glass-card p-12 text-center max-w-lg mx-auto">
        <p className="text-lg font-semibold">No data yet</p>
        <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
          Start adding problems to see your analytics
        </p>
      </div>
    );
  }

  // Prepare chart data
  const difficultyData = Object.entries(analytics.difficultyBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: DIFFICULTY_COLORS[name]?.solid || '#6366f1',
    }));

  const topicData = analytics.topicDistribution.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Your DSA progress at a glance
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 text-center"
        >
          <Award size={24} className="text-primary-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{animatedTotal}</p>
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Total Solved
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 text-center"
        >
          <TrendingUp size={24} className="text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{animatedRate}%</p>
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Revision Rate
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 text-center"
        >
          <Award size={24} className="text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{animatedStreak}</p>
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Best Streak: {analytics.streak?.longest || 0}
          </p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart — Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-500" />
            <h3 className="font-semibold">Daily Progress (Last 30 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.dailyProgress}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid, #e2e8f0)"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) =>
                  new Date(d).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Problems"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart — Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-primary-500" />
            <h3 className="font-semibold">Difficulty Distribution</h3>
          </div>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={300}
                  animationDuration={800}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-light-muted dark:text-dark-muted text-sm">
              No data available
            </div>
          )}
        </motion.div>

        {/* Bar Chart — Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary-500" />
            <h3 className="font-semibold">Topic Distribution</h3>
          </div>
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topicData} margin={{ bottom: 60 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--chart-grid, #e2e8f0)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Problems"
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                >
                  {topicData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-light-muted dark:text-dark-muted text-sm">
              No data available
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
