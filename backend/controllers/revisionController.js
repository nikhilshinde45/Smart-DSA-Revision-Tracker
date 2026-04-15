import Problem from '../models/Problem.js';

// @desc    Get today's revisions
// @route   GET /api/revisions/today
// @access  Private
export const getTodayRevisions = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Find problems that have a revision date matching today
    const problems = await Problem.find({
      userId: req.user._id,
      revisionDates: {
        $elemMatch: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    });

    // Filter to only include those with pending status for today's revision
    const todayRevisions = problems
      .map((problem) => {
        const todayIndex = problem.revisionDates.findIndex((date) => {
          const d = new Date(date);
          return d >= startOfDay && d <= endOfDay;
        });

        if (todayIndex !== -1 && problem.revisionStatus[todayIndex] === 'pending') {
          return {
            ...problem.toObject(),
            revisionIndex: todayIndex,
            revisionDay: todayIndex === 0 ? 1 : todayIndex === 1 ? 3 : 7,
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json(todayRevisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark revision as done or reschedule
// @route   PUT /api/revisions/:id
// @access  Private
export const updateRevision = async (req, res) => {
  try {
    const { revisionIndex, action } = req.body;
    // action: 'revised' or 'reschedule'

    const problem = await Problem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (revisionIndex === undefined || revisionIndex < 0 || revisionIndex >= problem.revisionDates.length) {
      return res.status(400).json({ message: 'Invalid revision index' });
    }

    if (action === 'revised') {
      // Mark as revised
      problem.revisionStatus[revisionIndex] = 'revised';
    } else if (action === 'reschedule') {
      // Reschedule to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      problem.revisionDates[revisionIndex] = tomorrow;
      // Status remains pending
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "revised" or "reschedule"' });
    }

    problem.markModified('revisionDates');
    problem.markModified('revisionStatus');
    await problem.save();

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
