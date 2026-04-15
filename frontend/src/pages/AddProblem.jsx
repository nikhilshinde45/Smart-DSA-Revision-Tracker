import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Link as LinkIcon,
  BarChart3,
  Tag,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import useProblemStore from '../store/problemStore';
import { toast } from '../components/ui/Toast';
import { DIFFICULTIES, TOPICS } from '../utils/constants';

const AddProblem = () => {
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    difficulty: '',
    topic: '',
  });
  const [customTopic, setCustomTopic] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addProblem, isLoading } = useProblemStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.difficulty || !formData.topic) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await addProblem(formData);
      setSuccess(true);
      toast.success('Problem added successfully!');
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', link: '', difficulty: '', topic: '' });
      }, 1500);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Add New Problem</h2>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Log a DSA problem you solved today
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Problem Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText size={15} className="text-primary-500" />
                Problem Name <span className="text-red-400">*</span>
              </label>
              <input
                id="problem-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Two Sum, Merge K Sorted Lists"
                className="input-field"
                required
              />
            </div>

            {/* Link */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <LinkIcon size={15} className="text-primary-500" />
                Problem Link
              </label>
              <input
                id="problem-link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://leetcode.com/problems/..."
                className="input-field"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <BarChart3 size={15} className="text-primary-500" />
                Difficulty <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, difficulty: diff }))
                    }
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border
                      ${
                        formData.difficulty === diff
                          ? diff === 'Easy'
                            ? 'bg-green-500/15 text-green-500 border-green-500/40 shadow-lg shadow-green-500/10'
                            : diff === 'Medium'
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/40 shadow-lg shadow-amber-500/10'
                            : 'bg-red-500/15 text-red-500 border-red-500/40 shadow-lg shadow-red-500/10'
                          : 'bg-light-elevated dark:bg-dark-elevated border-light-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Tag size={15} className="text-primary-500" />
                Topic <span className="text-red-400">*</span>
              </label>
              {customTopic ? (
                <div className="flex gap-2">
                  <input
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="Enter custom topic"
                    className="input-field flex-1"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTopic(false);
                      setFormData((prev) => ({ ...prev, topic: '' }));
                    }}
                    className="btn-ghost text-sm"
                  >
                    List
                  </button>
                </div>
              ) : (
                <div>
                  <select
                    id="problem-topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="input-field appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a topic</option>
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCustomTopic(true)}
                    className="text-xs text-primary-500 mt-1.5 hover:text-primary-600 font-medium"
                  >
                    + Add custom topic
                  </button>
                </div>
              )}
            </div>

            {/* Revision info */}
            <div className="bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/50 rounded-xl p-4">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300 flex items-center gap-2">
                <Sparkles size={14} />
                Spaced Repetition Schedule
              </p>
              <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-1">
                Revisions will be automatically scheduled for{' '}
                <strong>Day 1</strong>, <strong>Day 3</strong>, and{' '}
                <strong>Day 7</strong> after today.
              </p>
            </div>

            {/* Submit */}
            <motion.button
              id="add-problem-submit"
              type="submit"
              disabled={isLoading || success}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-300
                ${
                  success
                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                    : 'gradient-bg hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.01] active:scale-[0.99]'
                }
                disabled:opacity-70`}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : success ? (
                <CheckCircle2 size={18} />
              ) : null}
              {isLoading
                ? 'Adding...'
                : success
                ? 'Added Successfully!'
                : 'Add Problem'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddProblem;
