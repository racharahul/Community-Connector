const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a test user
const createTestUser = async () => {
  try {
    // First get a community ID
    const Community = require('../models/Community');
    const community = await Community.findOne();
    
    if (!community) {
      console.error('No communities found. Please run seedCommunities.js first.');
      process.exit(1);
    }
    
    // Create the user
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      community: community._id,
      building: community.buildings[0],
      unit: 'A101',
      phone: '1234567890'
    };
    
    console.log('Creating test user with data:', userData);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('Test user already exists. Skipping creation.');
      process.exit(0);
    }
    
    const user = await User.create(userData);
    console.log('Test user created successfully:', user);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

// Run the function
createTestUser();