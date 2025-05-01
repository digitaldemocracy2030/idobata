import User from '../models/User.js';

/**
 * Get user information by userId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = new User({ userId });
      await user.save();
    }
    
    return res.status(200).json({
      displayName: user.displayName
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return res.status(500).json({ 
      error: 'Failed to get user information' 
    });
  }
};

/**
 * Update user display name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserDisplayName = async (req, res) => {
  try {
    const { userId } = req.params;
    const { displayName } = req.body;
    
    if (!displayName) {
      return res.status(400).json({ 
        error: 'Display name is required' 
      });
    }
    
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = new User({ userId, displayName });
    } else {
      user.displayName = displayName;
    }
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Display name updated successfully'
    });
  } catch (error) {
    console.error('Error updating display name:', error);
    return res.status(500).json({ 
      error: 'Failed to update display name' 
    });
  }
};
