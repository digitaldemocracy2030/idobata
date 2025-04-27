import ImportedItem from '../models/ImportedItem.js';
import mongoose from 'mongoose';
import { processExtraction } from '../workers/extractionWorker.js';

/**
 * @description Handle generic data import (e.g., tweets) (非推奨 - 削除予定)
 * @route POST /api/import/generic
 * @access Private (or Public, depending on requirements)
 */
export const importGenericData = async (req, res, next) => {
  const { sourceType, content, metadata } = req.body;

  // Basic validation
  if (!sourceType || !content) {
    return res.status(400).json({ success: false, message: 'Missing required fields: sourceType and content' });
  }

  // No validation for sourceType - allowing any string value

  try {
    // Create the item in the database
    const newItem = await ImportedItem.create({
      sourceType,
      content,
      metadata: metadata || {}, // Ensure metadata is at least an empty object
      status: 'pending',
    });

    // Add a job to the extraction queue
    // This part depends on the specific job queue implementation
    // Example using a hypothetical 'extractionQueue.add'
    // Trigger asynchronous extraction using setTimeout, similar to chatController
    setTimeout(() => {
      // Construct the job data object expected by processExtraction
      const jobData = {
        sourceType: newItem.sourceType,
        sourceOriginId: newItem._id.toString(), // Pass ID as string
        content: newItem.content,
        metadata: newItem.metadata,
      };
      // Call processExtraction with a mock job structure { data: jobData }
      // The worker expects job.data
      processExtraction({ data: jobData }).catch(err => {
        console.error(`[Async Extraction Call] Error for imported item ${newItem._id}:`, err);
      });
      console.log(`[ImportController] Triggered async extraction for item ${newItem._id}`);
    }, 0);

    res.status(201).json({ success: true, data: newItem });

  } catch (error) {
    console.error('Error importing generic data:', error);
    res.status(500).json({ success: false, message: 'Server error during import' });
  }
};

/**
 * @description Handle theme-specific generic data import
 * @route POST /api/themes/:themeId/import/generic
 * @access Private (or Public, depending on requirements)
 */
export const importGenericDataByTheme = async (req, res, next) => {
  const { themeId } = req.params;
  const { sourceType, content, metadata } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(themeId)) {
    return res.status(400).json({ success: false, message: 'Invalid theme ID format' });
  }

  // Basic validation
  if (!sourceType || !content) {
    return res.status(400).json({ success: false, message: 'Missing required fields: sourceType and content' });
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
      
      processExtraction({ data: jobData }).catch(err => {
        console.error(`[Async Extraction Call] Error for imported item ${newItem._id}:`, err);
      });
      console.log(`[ImportController] Triggered async extraction for item ${newItem._id} in theme ${themeId}`);
    }, 0);

    res.status(201).json({ success: true, data: newItem });

  } catch (error) {
    console.error(`Error importing generic data for theme ${themeId}:`, error);
    res.status(500).json({ success: false, message: 'Server error during import', error: error.message });
  }
};
