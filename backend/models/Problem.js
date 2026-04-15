import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a problem name'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      required: [true, 'Please select a difficulty'],
      enum: ['Easy', 'Medium', 'Hard'],
    },
    topic: {
      type: String,
      required: [true, 'Please add a topic'],
      trim: true,
    },
    dateSolved: {
      type: Date,
      default: Date.now,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    revisionDates: {
      type: [Date],
      default: [],
    },
    revisionStatus: {
      type: [String],
      enum: ['pending', 'revised', 'skipped'],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate revision dates before saving (only on creation)
problemSchema.pre('save', function (next) {
  if (this.isNew) {
    const solved = new Date(this.dateSolved);

    // Spaced repetition: Day 1, Day 3, Day 7
    const day1 = new Date(solved);
    day1.setDate(day1.getDate() + 1);

    const day3 = new Date(solved);
    day3.setDate(day3.getDate() + 3);

    const day7 = new Date(solved);
    day7.setDate(day7.getDate() + 7);

    this.revisionDates = [day1, day3, day7];
    this.revisionStatus = ['pending', 'pending', 'pending'];
  }
  next();
});

// Compound index for efficient revision queries
problemSchema.index({ userId: 1, revisionDates: 1 });
problemSchema.index({ userId: 1, createdAt: -1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
