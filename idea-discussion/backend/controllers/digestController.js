import DigestDraft from '../models/DigestDraft.js';

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
