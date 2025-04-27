import DigestDraft from '../models/DigestDraft.js';
import mongoose from 'mongoose';
import SharpQuestion from '../models/SharpQuestion.js';

export const getDigestDrafts = async (req, res) => {
    try {
        const { questionId } = req.query; // Optional query parameter for filtering

        const query = {};
        if (questionId) {
            query.questionId = questionId;
        }

        const drafts = await DigestDraft.find(query)
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .populate('questionId', 'questionText') // Populate question text
            .populate('policyDraftId', 'title'); // Populate policy draft title

        res.status(200).json(drafts);
    } catch (error) {
        console.error('Error fetching digest drafts:', error);
        res.status(500).json({ message: 'Failed to fetch digest drafts', error: error.message });
    }
};

export const getDigestDraftsByTheme = async (req, res) => {
    const { themeId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(themeId)) {
        return res.status(400).json({ message: 'Invalid theme ID format' });
    }

    try {
        const questions = await SharpQuestion.find({ themeId });
        const questionIds = questions.map(q => q._id);
        
        const drafts = await DigestDraft.find({ questionId: { $in: questionIds } })
            .sort({ createdAt: -1 })
            .populate('questionId', 'questionText')
            .populate('policyDraftId', 'title');
        
        res.status(200).json(drafts);
    } catch (error) {
        console.error(`Error fetching digest drafts for theme ${themeId}:`, error);
        res.status(500).json({ message: 'Failed to fetch digest drafts for theme', error: error.message });
    }
};
