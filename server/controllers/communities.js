const Community = require('../models/Community');

// @desc    Get all communities
// @route   GET /api/communities
// @access  Public
exports.getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().sort({ name: 1 });
    res.json(communities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single community
// @route   GET /api/communities/:id
// @access  Public
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a community
// @route   POST /api/communities
// @access  Private/Admin
exports.createCommunity = async (req, res) => {
  try {
    const newCommunity = new Community(req.body);
    const community = await newCommunity.save();
    res.status(201).json(community);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a community
// @route   PUT /api/communities/:id
// @access  Private/Admin
exports.updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Community not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a community
// @route   DELETE /api/communities/:id
// @access  Private/Admin
exports.deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    await community.remove();
    res.json({ message: 'Community removed' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};