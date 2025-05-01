import Problem from "../models/Problem.js";
import QuestionLink from "../models/QuestionLink.js";
import SharpQuestion from "../models/SharpQuestion.js";
import Solution from "../models/Solution.js";
import Theme from "../models/Theme.js";
import {
  clusterVectors,
  generateEmbeddings,
  generateTransientEmbedding,
  searchVectors,
} from "../services/embedding/embeddingService.js";

/**
 * Generate embeddings for problems or solutions linked to a theme
 */
const generateThemeEmbeddings = async (req, res) => {
  const { themeId } = req.params;
  const { itemType } = req.body || {};

  try {
    const query = { themeId, embeddingGenerated: { $ne: true } };
    if (itemType) {
      if (itemType !== "problem" && itemType !== "solution") {
        return res.status(400).json({
          message: "Invalid itemType. Must be 'problem' or 'solution'",
        });
      }
    }

    let items = [];
    if (!itemType || itemType === "problem") {
      const problems = await Problem.find(query).lean();
      items = items.concat(
        problems.map((p) => ({
          id: p._id.toString(),
          text: p.statement,
          topicId: p.themeId.toString(),
          questionId: null,
          itemType: "problem",
        }))
      );
    }

    if (!itemType || itemType === "solution") {
      const solutions = await Solution.find(query).lean();
      items = items.concat(
        solutions.map((s) => ({
          id: s._id.toString(),
          text: s.statement,
          topicId: s.themeId.toString(),
          questionId: null,
          itemType: "solution",
        }))
      );
    }

    if (items.length === 0) {
      return res.status(200).json({
        status: "no items to process",
      });
    }

    const result = await generateEmbeddings(items);

    const problemIds = items
      .filter((item) => item.itemType === "problem")
      .map((item) => item.id);
    const solutionIds = items
      .filter((item) => item.itemType === "solution")
      .map((item) => item.id);

    if (problemIds.length > 0) {
      await Problem.updateMany(
        { _id: { $in: problemIds } },
        { embeddingGenerated: true }
      );
    }

    if (solutionIds.length > 0) {
      await Solution.updateMany(
        { _id: { $in: solutionIds } },
        { embeddingGenerated: true }
      );
    }

    return res.status(200).json({
      status: "success",
      processedCount: items.length,
    });
  } catch (error) {
    console.error(`Error generating embeddings for theme ${themeId}:`, error);
    return res.status(500).json({
      message: "Error generating embeddings",
      error: error.message,
    });
  }
};

/**
 * Generate embeddings for problems or solutions linked to a question
 */
const generateQuestionEmbeddings = async (req, res) => {
  const { questionId } = req.params;
  const { itemType } = req.body || {};

  try {
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const themeId = question.themeId;

    let items = [];

    if (!itemType || itemType === "problem") {
      const problemLinks = await QuestionLink.find({
        questionId,
        linkedItemType: "problem",
      });
      const problemIds = problemLinks.map((link) => link.linkedItemId);
      const problems = await Problem.find({
        _id: { $in: problemIds },
        embeddingGenerated: { $ne: true },
      }).lean();

      items = items.concat(
        problems.map((p) => ({
          id: p._id.toString(),
          text: p.statement,
          topicId: themeId.toString(),
          questionId: questionId,
          itemType: "problem",
        }))
      );
    }

    if (!itemType || itemType === "solution") {
      const solutionLinks = await QuestionLink.find({
        questionId,
        linkedItemType: "solution",
      });
      const solutionIds = solutionLinks.map((link) => link.linkedItemId);
      const solutions = await Solution.find({
        _id: { $in: solutionIds },
        embeddingGenerated: { $ne: true },
      }).lean();

      items = items.concat(
        solutions.map((s) => ({
          id: s._id.toString(),
          text: s.statement,
          topicId: themeId.toString(),
          questionId: questionId,
          itemType: "solution",
        }))
      );
    }

    if (items.length === 0) {
      return res.status(200).json({
        status: "no items to process",
      });
    }

    const result = await generateEmbeddings(items);

    const problemIds = items
      .filter((item) => item.itemType === "problem")
      .map((item) => item.id);
    const solutionIds = items
      .filter((item) => item.itemType === "solution")
      .map((item) => item.id);

    if (problemIds.length > 0) {
      await Problem.updateMany(
        { _id: { $in: problemIds } },
        { embeddingGenerated: true }
      );
    }

    if (solutionIds.length > 0) {
      await Solution.updateMany(
        { _id: { $in: solutionIds } },
        { embeddingGenerated: true }
      );
    }

    return res.status(200).json({
      status: "success",
      processedCount: items.length,
    });
  } catch (error) {
    console.error(`Error generating embeddings for question ${questionId}:`, error);
    return res.status(500).json({
      message: "Error generating embeddings",
      error: error.message,
    });
  }
};

/**
 * Search for problems or solutions related to a theme using vector similarity
 */
const searchTheme = async (req, res) => {
  const { themeId } = req.params;
  const { queryText, itemType, k = 10 } = req.query;

  if (!queryText) {
    return res.status(400).json({
      message: "queryText is required",
    });
  }

  if (!itemType || (itemType !== "problem" && itemType !== "solution")) {
    return res.status(400).json({
      message: "itemType must be 'problem' or 'solution'",
    });
  }

  try {
    const queryEmbedding = await generateTransientEmbedding(queryText);

    const searchResult = await searchVectors(
      queryEmbedding,
      {
        topicId: themeId,
        questionId: null,
        itemType,
      },
      Number.parseInt(k)
    );

    const ids = searchResult.results.map((item) => item.id);
    let items = [];

    if (itemType === "problem") {
      items = await Problem.find({ _id: { $in: ids } }).lean();
    } else {
      items = await Solution.find({ _id: { $in: ids } }).lean();
    }

    const resultsWithDetails = searchResult.results.map((result) => {
      const item = items.find((i) => i._id.toString() === result.id);
      if (!item) return null;

      return {
        id: result.id,
        text: item.statement,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        similarity: result.similarity,
      };
    }).filter(Boolean);

    return res.status(200).json(resultsWithDetails);
  } catch (error) {
    console.error(`Error searching theme ${themeId}:`, error);
    return res.status(500).json({
      message: "Error searching",
      error: error.message,
    });
  }
};

/**
 * Search for problems or solutions related to a question using vector similarity
 */
const searchQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { queryText, itemType, k = 10 } = req.query;

  if (!queryText) {
    return res.status(400).json({
      message: "queryText is required",
    });
  }

  if (!itemType || (itemType !== "problem" && itemType !== "solution")) {
    return res.status(400).json({
      message: "itemType must be 'problem' or 'solution'",
    });
  }

  try {
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const themeId = question.themeId;

    const queryEmbedding = await generateTransientEmbedding(queryText);

    const searchResult = await searchVectors(
      queryEmbedding,
      {
        topicId: themeId.toString(),
        questionId: questionId,
        itemType,
      },
      Number.parseInt(k)
    );

    const ids = searchResult.results.map((item) => item.id);
    let items = [];

    if (itemType === "problem") {
      items = await Problem.find({ _id: { $in: ids } }).lean();
    } else {
      items = await Solution.find({ _id: { $in: ids } }).lean();
    }

    const resultsWithDetails = searchResult.results.map((result) => {
      const item = items.find((i) => i._id.toString() === result.id);
      if (!item) return null;

      return {
        id: result.id,
        text: item.statement,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        similarity: result.similarity,
      };
    }).filter(Boolean);

    return res.status(200).json(resultsWithDetails);
  } catch (error) {
    console.error(`Error searching question ${questionId}:`, error);
    return res.status(500).json({
      message: "Error searching",
      error: error.message,
    });
  }
};

/**
 * Cluster problems or solutions related to a theme
 */
const clusterTheme = async (req, res) => {
  const { themeId } = req.params;
  const { itemType, method = "kmeans", params = { n_clusters: 5 } } = req.body;

  if (!itemType || (itemType !== "problem" && itemType !== "solution")) {
    return res.status(400).json({
      message: "itemType must be 'problem' or 'solution'",
    });
  }

  try {
    const clusterResult = await clusterVectors(
      {
        topicId: themeId,
        questionId: null,
        itemType,
      },
      method,
      params
    );

    if (!clusterResult.clusters || clusterResult.clusters.length === 0) {
      return res.status(200).json({
        message: "No items to cluster",
        clusters: [],
      });
    }

    const theme = await Theme.findById(themeId);
    if (!theme) {
      return res.status(404).json({
        message: "Theme not found",
      });
    }

    if (!theme.clusteringResults) {
      theme.clusteringResults = {};
    }

    const clusterKey = `${itemType}_${method}_${params.n_clusters || "custom"}`;
    theme.clusteringResults[clusterKey] = clusterResult.clusters;

    await theme.save();

    return res.status(200).json(clusterResult);
  } catch (error) {
    console.error(`Error clustering theme ${themeId}:`, error);
    return res.status(500).json({
      message: "Error clustering",
      error: error.message,
    });
  }
};

/**
 * Cluster problems or solutions related to a question
 */
const clusterQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { itemType, method = "kmeans", params = { n_clusters: 5 } } = req.body;

  if (!itemType || (itemType !== "problem" && itemType !== "solution")) {
    return res.status(400).json({
      message: "itemType must be 'problem' or 'solution'",
    });
  }

  try {
    const question = await SharpQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const themeId = question.themeId;

    const clusterResult = await clusterVectors(
      {
        topicId: themeId.toString(),
        questionId: questionId,
        itemType,
      },
      method,
      params
    );

    if (!clusterResult.clusters || clusterResult.clusters.length === 0) {
      return res.status(200).json({
        message: "No items to cluster",
        clusters: [],
      });
    }

    if (!question.clusteringResults) {
      question.clusteringResults = {};
    }

    const clusterKey = `${itemType}_${method}_${params.n_clusters || "custom"}`;
    question.clusteringResults[clusterKey] = clusterResult.clusters;

    await question.save();

    return res.status(200).json(clusterResult);
  } catch (error) {
    console.error(`Error clustering question ${questionId}:`, error);
    return res.status(500).json({
      message: "Error clustering",
      error: error.message,
    });
  }
};

export {
  generateThemeEmbeddings,
  generateQuestionEmbeddings,
  searchTheme,
  searchQuestion,
  clusterTheme,
  clusterQuestion,
};
