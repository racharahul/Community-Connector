const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Community = require('../models/Community');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample community data
const communities = [
  {
    name: 'Prestige Lakeside Habitat',
    address: {
      street: 'Varthur Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066'
    },
    type: 'gated community',
    buildings: ['A Block', 'B Block', 'C Block', 'D Block'],
    description: 'Luxury gated community with modern amenities',
    amenities: ['Swimming Pool', 'Gym', 'Tennis Court', 'Club House'],
    totalUnits: 1200,
    isActive: true
  },
  {
    name: 'Brigade Meadows',
    address: {
      street: 'Kanakapura Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560062'
    },
    type: 'gated community',
    buildings: ['Plumeria', 'Lavender', 'Jasmine', 'Rose'],
    description: 'Spacious apartments with green surroundings',
    amenities: ['Swimming Pool', 'Gym', 'Jogging Track', 'Children\'s Play Area'],
    totalUnits: 800,
    isActive: true
  },
  {
    name: 'Sobha Dream Acres',
    address: {
      street: 'Panathur Road, Balagere',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560087'
    },
    type: 'apartment',
    buildings: ['Tower 1', 'Tower 2', 'Tower 3', 'Tower 4', 'Tower 5'],
    description: 'Modern apartments with smart home features',
    amenities: ['Swimming Pool', 'Gym', 'Badminton Court', 'Amphitheatre'],
    totalUnits: 1500,
    isActive: true
  },
  {
    name: 'Adarsh Palm Retreat',
    address: {
      street: 'Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103'
    },
    type: 'gated community',
    buildings: ['Palm Boulevard', 'Palm Meadows', 'Palm Avenue', 'Palm Court'],
    description: 'Premium villas and apartments with lush greenery',
    amenities: ['Swimming Pool', 'Gym', 'Squash Court', 'Yoga Deck'],
    totalUnits: 600,
    isActive: true
  },
  {
    name: 'Purva Fountain Square',
    address: {
      street: 'Marathahalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560037'
    },
    type: 'apartment',
    buildings: ['A Tower', 'B Tower', 'C Tower'],
    description: 'Contemporary apartments with urban lifestyle',
    amenities: ['Swimming Pool', 'Gym', 'Basketball Court', 'Library'],
    totalUnits: 450,
    isActive: true
  }
];

// Seed function
const seedDB = async () => {
  try {
    // Clear existing communities
    await Community.deleteMany({});
    console.log('Deleted existing communities');
    
    // Insert new communities
    const createdCommunities = await Community.insertMany(communities);
    console.log(`Added ${createdCommunities.length} communities`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDB();