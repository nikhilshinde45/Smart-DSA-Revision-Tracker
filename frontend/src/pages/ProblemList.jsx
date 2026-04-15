import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  SortAsc,
  X,
} from 'lucide-react';
import useProblemStore from '../store/problemStore';
import useDebounce from '../hooks/useDebounce';
import { ListSkeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { toast } from '../components/ui/Toast';
import { DIFFICULTIES, TOPICS } from '../utils/constants';
import {
  getDifficultyBadgeClass,
  formatDate,
  getRevisionLabel,
} from '../utils/helpers';

const ProblemList = () => {
  const { problems, fetchProblems, deleteProblem, toggleBookmark, isLoading } =
    useProblemStore();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [sort, setSort] = useState('-createdAt');
  const [deleteModal, setDeleteModal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (difficulty !== 'All') params.difficulty = difficulty;
    if (topic !== 'All') params.topic = topic;
    params.sort = sort;
    fetchProblems(params);
  }, [debouncedSearch, difficulty, topic, sort]);

  const handleDelete = async () => {
    if (deleteModal) {
      await deleteProblem(deleteModal._id);
      toast.success(`"${deleteModal.name}" deleted`);
      setDeleteModal(null);
    }
  };

  const handleBookmark = async (problem) => {
    await toggleBookmark(problem._id);
    toast.info(
      problem.bookmarked ? 'Bookmark removed' : 'Problem bookmarked'
    );
  };

  // Get unique topics from problems for filter
  const uniqueTopics = useMemo(() => {
    const topics = [...new Set(problems.map((p) => p.topic))];
    return topics.sort();
  }, [problems]);

  const activeFilters = (difficulty !== 'All' ? 1 : 0) + (topic !== 'All' ? 1 : 0);

  if (isLoading && problems.length === 0) return <ListSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold">All Problems</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            {problems.length} problem{problems.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted"
            />
            <input
              id="problem-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="input-field pl-11"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light-text transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 relative ${
              showFilters ? 'border-primary-400 dark:border-primary-500' : ''
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white gradient-bg rounded-full">
                {activeFilters}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field w-auto min-w-[140px] cursor-pointer"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>

        {/* Filter dropdowns */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-3 overflow-hidden"
            >
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field w-auto min-w-[130px] cursor-pointer"
              >
                <option value="All">All Difficulty</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field w-auto min-w-[150px] cursor-pointer"
              >
                <option value="All">All Topics</option>
                {(uniqueTopics.length > 0 ? uniqueTopics : TOPICS).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setDifficulty('All');
                    setTopic('All');
                  }}
                  className="btn-ghost text-sm text-red-400"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Problem Grid */}
      {problems.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-primary-400" />
          </div>
          <p className="font-semibold text-lg">No problems found</p>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            {search || difficulty !== 'All' || topic !== 'All'
              ? 'Try adjusting your filters'
              : 'Start by adding your first problem!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {problems.map((problem, i) => (
              <motion.div
                key={problem._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                className="glass-card-hover p-5 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={getDifficultyBadgeClass(problem.difficulty)}>
                    {problem.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleBookmark(problem)}
                      className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                    >
                      {problem.bookmarked ? (
                        <BookmarkCheck
                          size={16}
                          className="text-primary-500 fill-primary-500"
                        />
                      ) : (
                        <Bookmark
                          size={16}
                          className="text-light-muted dark:text-dark-muted"
                        />
                      )}
                    </button>
                    {problem.link && (
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                      >
                        <ExternalLink
                          size={16}
                          className="text-light-muted dark:text-dark-muted"
                        />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h4 className="font-semibold text-[15px] mb-1 line-clamp-2">
                  {problem.name}
                </h4>
                <p className="text-xs text-light-muted dark:text-dark-muted mb-3">
                  {problem.topic}
                </p>

                {/* Revision Status */}
                <div className="flex gap-1.5 mb-4 mt-auto">
                  {problem.revisionStatus.map((status, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 py-1 rounded-md text-center text-[10px] font-semibold
                        ${
                          status === 'revised'
                            ? 'bg-green-500/15 text-green-500'
                            : status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                    >
                      {getRevisionLabel(idx)}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-dark-border">
                  <span className="text-xs text-light-muted dark:text-dark-muted">
                    {formatDate(problem.dateSolved)}
                  </span>
                  <button
                    onClick={() => setDeleteModal(problem)}
                    className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Problem"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-500" />
          </div>
          <p className="font-semibold mb-1">Are you sure?</p>
          <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
            "{deleteModal?.name}" will be permanently removed along with its
            revision history.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="btn-danger flex-1">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProblemList;
