const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');

const MONGO_URI = 'mongodb://127.0.0.1:27017/assignment7';

const dummyData = [
  {
    studentName: 'Alice Johnson',
    subject: 'Web Development',
    rating: 5,
    comment: 'The course was exceptionally well-structured. The hands-on projects were very helpful.'
  },
  {
    studentName: 'Bob Smith',
    subject: 'Data Science',
    rating: 4,
    comment: 'Great content, but the pace was a bit fast for beginners.'
  },
  {
    studentName: 'Charlie Davis',
    subject: 'UI/UX Design',
    rating: 5,
    comment: 'Loved the focus on accessibility and modern design trends.'
  },
  {
    studentName: 'Diana Prince',
    subject: 'Cyber Security',
    rating: 3,
    comment: 'Very informative, but I wish there were more lab exercises.'
  },
  {
    studentName: 'Ethan Hunt',
    subject: 'Cloud Computing',
    rating: 4,
    comment: 'The instructor explained complex AWS concepts very clearly.'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    
    await Feedback.deleteMany({});
    console.log('Cleared existing feedback.');
    
    await Feedback.insertMany(dummyData);
    console.log('Successfully seeded dummy data.');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
