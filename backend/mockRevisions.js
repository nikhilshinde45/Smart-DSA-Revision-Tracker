import mongoose from 'mongoose';
import Problem from './models/Problem.js';
import User from './models/User.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const run = async (mongoUri) => {
    try {
        console.log('Connecting to remote database...');
        await mongoose.connect(mongoUri);
        console.log('Connected!');
        
        const user = await User.findOne({ email: 'nikhilshinde2257@gmail.com' });
        
        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }
        
        const problems = await Problem.find({ userId: user._id }).sort({ dateSolved: -1 }).limit(5);
        
        if (problems.length === 0) {
            console.log('No problems found for this user.');
            process.exit(0);
        }

        console.log(`Found ${problems.length} problems. Modifying dates...`);
        
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Make the 1st problem due TODAY (so you can see it right now)
        if (problems[0]) {
            problems[0].revisionDates[0] = today;
            problems[0].markModified('revisionDates');
            await problems[0].save();
            console.log(`- Problem 1 "${problems[0].name}" set to be due TODAY.`);
        }
        
        // Make the 2nd and 3rd problems due TOMORROW (so they show up for the teacher)
        if (problems[1]) {
            problems[1].revisionDates[0] = tomorrow;
            problems[1].markModified('revisionDates');
            await problems[1].save();
            console.log(`- Problem 2 "${problems[1].name}" set to be due TOMORROW.`);
        }
        if (problems[2]) {
            problems[2].revisionDates[0] = tomorrow;
            problems[2].markModified('revisionDates');
            await problems[2].save();
            console.log(`- Problem 3 "${problems[2].name}" set to be due TOMORROW.`);
        }
        
        console.log('\n=============================================');
        console.log('SUCCESS! You now have 1 problem due today, and 2 due tomorrow!');
        console.log('=============================================\n');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
};

rl.question('Please paste your MongoDB Atlas URI:\n> ', (uri) => {
    if (!uri || uri.trim() === '') {
        console.log('No URI provided. Exiting.');
        process.exit(1);
    }
    run(uri.trim());
});
