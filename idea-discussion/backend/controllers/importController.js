import mongoose from 'mongoose';
import ImportedItem from '../models/ImportedItem.js';
import { processExtraction } from '../workers/extractionWorker.js';

/**
 * @description Handle theme-specific generic data import
 * @route POST /api/themes/:themeId/import/generic
 * @access Private (or Public, depending on requirements)
 */
export const importGenericDataByTheme = async (req, res, next) => {
  const { themeId } = req.params;
  const { sourceType, content, metadata } = req.body;

  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid theme ID format' });
  }

  // Basic validation
  if (!sourceType || !content) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: sourceType and content',
    });
  }

  try {
    // Create the item in the database with themeId
    const newItem = await ImportedItem.create({
      sourceType,
      content,
      metadata: metadata || {},
      status: 'pending',
      themeId, // Add themeId to the imported item
    });

    // Trigger asynchronous extraction
    setTimeout(() => {
      const jobData = {
        sourceType: newItem.sourceType,
        sourceOriginId: newItem._id.toString(),
        content: newItem.content,
        metadata: newItem.metadata,
        themeId: newItem.themeId.toString(), // Include themeId in job data
      };

      processExtraction({ data: jobData }).catch((err) => {
        console.error(
          `[Async Extraction Call] Error for imported item ${newItem._id}:`,
          err
        );
      });
      console.log(
        `[ImportController] Triggered async extraction for item ${newItem._id} in theme ${themeId}`
      );
    }, 0);

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error(`Error importing generic data for theme ${themeId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Server error during import',
      error: error.message,
    });
  }
};
