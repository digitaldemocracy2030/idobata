import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error(
    'Error: MONGODB_URI is not defined. Please check .env file or docker-compose.yml file.'
  );
  process.exit(1);
}

import ChatThread from '../models/ChatThread.js';
import ImportedItem from '../models/ImportedItem.js';
import Problem from '../models/Problem.js';
import SharpQuestion from '../models/SharpQuestion.js';
import Solution from '../models/Solution.js';
import Theme from '../models/Theme.js';

async function migrateToThemes() {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    console.log('Creating default theme...');
    const defaultTheme = new Theme({
      title: 'デフォルトテーマ',
      description: '既存データ用のデフォルトテーマ',
      slug: 'default',
      isActive: true,
    });

    const savedTheme = await defaultTheme.save();
    console.log(`Default theme created with ID: ${savedTheme._id}`);

    console.log('Updating SharpQuestions...');
    const sharpQuestionResult = await SharpQuestion.updateMany(
      { themeId: { $exists: false } },
      { $set: { themeId: savedTheme._id } }
    );
    console.log(`Updated ${sharpQuestionResult.modifiedCount} SharpQuestions`);

    console.log('Updating Problems...');
    const problemResult = await Problem.updateMany(
      { themeId: { $exists: false } },
      { $set: { themeId: savedTheme._id } }
    );
    console.log(`Updated ${problemResult.modifiedCount} Problems`);

    console.log('Updating Solutions...');
    const solutionResult = await Solution.updateMany(
      { themeId: { $exists: false } },
      { $set: { themeId: savedTheme._id } }
    );
    console.log(`Updated ${solutionResult.modifiedCount} Solutions`);

    console.log('Updating ChatThreads...');
    const chatThreadResult = await ChatThread.updateMany(
      { themeId: { $exists: false } },
      { $set: { themeId: savedTheme._id } }
    );
    console.log(`Updated ${chatThreadResult.modifiedCount} ChatThreads`);

    console.log('Updating ImportedItems...');
    const importedItemResult = await ImportedItem.updateMany(
      { themeId: { $exists: false } },
      { $set: { themeId: savedTheme._id } }
    );
    console.log(`Updated ${importedItemResult.modifiedCount} ImportedItems`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

migrateToThemes();
