import Problem from '../models/Problem.js';

// @desc    Add new problem
// @route   POST /api/problems
// @access  Private
export const addProblem = async (req, res) => {
  try {
    const { name, link, difficulty, topic, dateSolved } = req.body;

    if (!name || !difficulty || !topic) {
      return res
        .status(400)
        .json({ message: 'Please provide name, difficulty, and topic' });
    }

    const problem = await Problem.create({
      userId: req.user._id,
      name,
      link: link || '',
      difficulty,
      topic,
      dateSolved: dateSolved || new Date(),
    });

    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all problems for user
// @route   GET /api/problems
// @access  Private
export const getProblems = async (req, res) => {
  try {
    const {
      search,
      difficulty,
      topic,
      bookmarked,
      sort = '-createdAt',
    } = req.query;

    const query = { userId: req.user._id };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Topic filter
    if (topic && topic !== 'All') {
      query.topic = topic;
    }

    // Bookmarked filter
    if (bookmarked === 'true') {
      query.bookmarked = true;
    }

    // Sort handling
    let sortOption = {};
    switch (sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case '-name':
        sortOption = { name: -1 };
        break;
      case 'difficulty':
        sortOption = { difficulty: 1 };
        break;
      case 'dateSolved':
        sortOption = { dateSolved: -1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: 1 };
        break;
      case '-createdAt':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const problems = await Problem.find(query).sort(sortOption);

    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
export const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ message: 'Problem removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle bookmark
// @route   PUT /api/problems/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    problem.bookmarked = !problem.bookmarked;
    await problem.save();

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
