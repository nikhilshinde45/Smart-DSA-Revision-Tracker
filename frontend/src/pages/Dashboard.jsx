import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import useProblemStore from '../store/problemStore';
import useAuthStore from '../store/authStore';
import useAnimatedCounter from '../hooks/useAnimatedCounter';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { toast } from '../components/ui/Toast';
import {
  getDifficultyBadgeClass,
  formatRelativeDate,
  getRevisionLabel,
} from '../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const animatedValue = useAnimatedCounter(value, 1200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold">{animatedValue}</p>
      <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
        {label}
      </p>
    </motion.div>
  );
};

const RevisionCard = ({ problem, onRevise, onReschedule }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRevise = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onRevise(problem);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="glass-card p-4 relative overflow-hidden"
    >
      {/* Success animation overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <CheckCircle2 size={48} className="text-green-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={getDifficultyBadgeClass(problem.difficulty)}>
              {problem.difficulty}
            </span>
            <span className="text-xs text-light-muted dark:text-dark-muted px-2 py-0.5 bg-primary-50 dark:bg-primary-950 rounded-full">
              {getRevisionLabel(problem.revisionIndex)}
            </span>
          </div>
          <h4 className="font-semibold truncate">{problem.name}</h4>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            {problem.topic}
          </p>
        </div>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors flex-shrink-0"
          >
            <ExternalLink size={14} className="text-light-muted" />
          </a>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRevise}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all active:scale-95"
        >
          <CheckCircle2 size={15} />
          Revised
        </button>
        <button
          onClick={() => onReschedule(problem)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all active:scale-95"
        >
          <RotateCcw size={15} />
          Not Sure
        </button>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const {
    todayRevisions,
    analytics,
    fetchTodayRevisions,
    fetchAnalytics,
    markRevision,
    isLoading,
  } = useProblemStore();

  const [rescheduleModal, setRescheduleModal] = useState(null);

  useEffect(() => {
    fetchTodayRevisions();
    fetchAnalytics();
  }, []);

  const handleRevise = async (problem) => {
    await markRevision(problem._id, problem.revisionIndex, 'revised');
    toast.success(`"${problem.name}" marked as revised!`);
    fetchAnalytics();
  };

  const handleReschedule = async () => {
    if (rescheduleModal) {
      await markRevision(
        rescheduleModal._id,
        rescheduleModal.revisionIndex,
        'reschedule'
      );
      toast.info(`"${rescheduleModal.name}" rescheduled to tomorrow`);
      setRescheduleModal(null);
      fetchAnalytics();
    }
  };

  if (isLoading && !analytics) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Welcome back,{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </motion.h2>
        <p className="text-light-muted dark:text-dark-muted text-sm mt-1">
          Here's your DSA progress overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Problems Solved"
          value={analytics?.totalSolved || 0}
          color="bg-primary-500/10 text-primary-500"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Due Today"
          value={analytics?.dueToday || 0}
          color="bg-amber-500/10 text-amber-500"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={analytics?.completionRate || 0}
          color="bg-green-500/10 text-green-500"
          delay={0.2}
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={analytics?.streak?.current || 0}
          color="bg-orange-500/10 text-orange-500"
          delay={0.3}
        />
      </div>

      {/* Today's Revisions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold">Today's Revisions</h3>
          {todayRevisions.length > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-bold gradient-bg text-white rounded-full animate-pulse-glow">
              {todayRevisions.length}
            </span>
          )}
        </div>

        {todayRevisions.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="font-semibold text-lg">All caught up! 🎉</p>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
              No revisions due today. Keep solving new problems!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {todayRevisions.map((problem) => (
                <RevisionCard
                  key={`${problem._id}-${problem.revisionIndex}`}
                  problem={problem}
                  onRevise={handleRevise}
                  onReschedule={setRescheduleModal}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Difficulty Breakdown */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold mb-4">Difficulty Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(analytics.difficultyBreakdown).map(
              ([diff, count]) => (
                <div key={diff} className="glass-card p-4 text-center">
                  <span className={getDifficultyBadgeClass(diff)}>{diff}</span>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </div>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {analytics?.recentActivity?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="glass-card divide-y divide-light-border dark:divide-dark-border overflow-hidden">
            {analytics.recentActivity.map((problem, i) => (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between p-4 hover:bg-light-elevated/50 dark:hover:bg-dark-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={getDifficultyBadgeClass(problem.difficulty)}>
                    {problem.difficulty}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{problem.name}</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted">
                      {problem.topic}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-light-muted dark:text-dark-muted">
                  {formatRelativeDate(problem.dateSolved)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleModal}
        onClose={() => setRescheduleModal(null)}
        title="Reschedule Revision"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
          <p className="font-semibold mb-1">Not confident yet?</p>
          <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
            "{rescheduleModal?.name}" will be rescheduled to tomorrow for
            another revision attempt.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setRescheduleModal(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              className="btn-primary flex-1"
            >
              Reschedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
