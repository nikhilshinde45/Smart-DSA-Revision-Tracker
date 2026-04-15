import Problem from '../models/Problem.js';
import User from '../models/User.js';

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all problems for user
    const problems = await Problem.find({ userId });
    const user = await User.findById(userId);

    // Total problems solved
    const totalSolved = problems.length;

    // Today's revisions count
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const dueToday = problems.filter((p) =>
      p.revisionDates.some(
        (date, i) =>
          new Date(date) >= startOfDay &&
          new Date(date) <= endOfDay &&
          p.revisionStatus[i] === 'pending'
      )
    ).length;

    // Difficulty breakdown
    const difficultyBreakdown = {
      Easy: problems.filter((p) => p.difficulty === 'Easy').length,
      Medium: problems.filter((p) => p.difficulty === 'Medium').length,
      Hard: problems.filter((p) => p.difficulty === 'Hard').length,
    };

    // Topic distribution
    const topicMap = {};
    problems.forEach((p) => {
      topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
    });
    const topicDistribution = Object.entries(topicMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Weekly progress (last 4 weeks)
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = problems.filter((p) => {
        const solved = new Date(p.dateSolved);
        return solved >= weekStart && solved <= weekEnd;
      }).length;

      weeklyProgress.push({
        week: `Week ${4 - i}`,
        startDate: weekStart.toISOString().split('T')[0],
        count,
      });
    }

    // Daily progress (last 30 days)
    const dailyProgress = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const count = problems.filter((p) => {
        const solved = new Date(p.dateSolved);
        return solved >= day && solved <= dayEnd;
      }).length;

      dailyProgress.push({
        date: day.toISOString().split('T')[0],
        count,
      });
    }

    // Revision completion rate
    let totalRevisions = 0;
    let completedRevisions = 0;
    problems.forEach((p) => {
      p.revisionStatus.forEach((status) => {
        totalRevisions++;
        if (status === 'revised') completedRevisions++;
      });
    });
    const completionRate =
      totalRevisions > 0
        ? Math.round((completedRevisions / totalRevisions) * 100)
        : 0;

    // Recent activity (last 5 problems)
    const recentActivity = problems
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        difficulty: p.difficulty,
        topic: p.topic,
        dateSolved: p.dateSolved,
      }));

    res.json({
      totalSolved,
      dueToday,
      difficultyBreakdown,
      topicDistribution,
      weeklyProgress,
      dailyProgress,
      completionRate,
      recentActivity,
      streak: user.streak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
