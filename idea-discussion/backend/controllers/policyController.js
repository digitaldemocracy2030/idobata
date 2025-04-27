import PolicyDraft from '../models/PolicyDraft.js';
import mongoose from 'mongoose';
import SharpQuestion from '../models/SharpQuestion.js';

// Controller to get policy drafts (非推奨 - 削除予定)
export const getPolicyDrafts = async (req, res) => {
    try {
        const { questionId } = req.query; // Optional query parameter for filtering

        const query = {};
        if (questionId) {
            query.questionId = questionId;
        }

        const drafts = await PolicyDraft.find(query)
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .populate('questionId', 'questionText'); // Optionally populate question text

        res.status(200).json(drafts);
    } catch (error) {
        console.error('Error fetching policy drafts:', error);
        res.status(500).json({ message: 'Failed to fetch policy drafts', error: error.message });
    }
};

export const getPolicyDraftsByTheme = async (req, res) => {
    const { themeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(themeId)) {
        return res.status(400).json({ message: 'Invalid theme ID format' });
    }

    try {
        const questions = await SharpQuestion.find({ themeId });
        const questionIds = questions.map(q => q._id);
        
        const drafts = await PolicyDraft.find({ questionId: { $in: questionIds } })
            .sort({ createdAt: -1 })
            .populate('questionId', 'questionText');
        
        res.status(200).json(drafts);
    } catch (error) {
        console.error(`Error fetching policy drafts for theme ${themeId}:`, error);
        res.status(500).json({ message: 'Failed to fetch policy drafts for theme', error: error.message });
    }
};
