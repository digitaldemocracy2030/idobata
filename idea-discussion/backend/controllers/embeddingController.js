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
    const query = { themeId };
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
    console.error(
      `Error generating embeddings for question ${questionId}:`,
      error
    );
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

    const resultsWithDetails = searchResult.results
      .map((result) => {
        const item = items.find((i) => i._id.toString() === result.id);
        if (!item) return null;

        return {
          id: result.id,
          text: item.statement,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          similarity: result.similarity,
        };
      })
      .filter(Boolean);

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

    const resultsWithDetails = searchResult.results
      .map((result) => {
        const item = items.find((i) => i._id.toString() === result.id);
        if (!item) return null;

        return {
          id: result.id,
          text: item.statement,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          similarity: result.similarity,
        };
      })
      .filter(Boolean);

    return res.status(200).json(resultsWithDetails);
  } catch (error) {
    console.error(`Error searching question ${questionId}:`, error);
    return res.status(500).json({
      message: "Error searching",
      error: error.message,
    });
  }
};

// Helper function to recursively fetch text for leaf nodes in the tree
async function enrichTreeWithText(node, itemType, itemMap) {
  if (node.is_leaf) {
    const text = itemMap.get(node.item_id) || "（テキスト情報取得エラー）";
    // Return a structure compatible with what the frontend might expect for a leaf
    return {
      id: node.item_id,
      text: text,
      is_leaf: true,
      // Keep other leaf properties if needed, like 'count'
      count: node.count,
    };
  }

  // Recursively process children
  // Ensure children exist before mapping
  const enrichedChildren = node.children
    ? await Promise.all(
        node.children.map((child) =>
          enrichTreeWithText(child, itemType, itemMap)
        )
      )
    : [];

  // Return the structure for an internal node
  return {
    is_leaf: false,
    children: enrichedChildren,
    // Keep other internal node properties if needed, like 'count'
    count: node.count,
    // Add distance here if it was included from Python and needed
    // distance: node.distance
  };
}

/**
 * Cluster problems or solutions related to a theme
 */
const clusterTheme = async (req, res) => {
  const { themeId } = req.params;
  // Use 'let' for params so it can be modified
  let { itemType, method = "kmeans", params = { n_clusters: 5 } } = req.body;

  if (!itemType || (itemType !== "problem" && itemType !== "solution")) {
    return res.status(400).json({
      message: "itemType must be 'problem' or 'solution'",
    });
  }

  // Modify params based on method BEFORE calling the service
  if (method === "hierarchical") {
    params = {}; // Hierarchical clustering takes no parameters now
  } else if (method === "kmeans") {
    // Ensure kmeans always has n_clusters, default to 5 if not provided or invalid
    const nClusters = params?.n_clusters;
    params = {
      n_clusters:
        typeof nClusters === "number" &&
        Number.isInteger(nClusters) &&
        nClusters >= 2
          ? nClusters
          : 5, // Default to 5 if invalid or missing
    };
  }
  // Add handling for other methods if they exist in the future

  try {
    console.log(
      `Calling clusterVectors with method: ${method}, params:`,
      params
    ); // Added logging
    const clusterResult = await clusterVectors(
      {
        topicId: themeId,
        questionId: null, // Assuming theme-level clustering
        itemType,
      },
      method,
      params // Use the potentially modified params
    );

    // Check if the result is empty or invalid before proceeding
    // Handle cases where clusters might be null or not the expected type
    if (
      !clusterResult ||
      clusterResult.clusters === null ||
      clusterResult.clusters === undefined ||
      (Array.isArray(clusterResult.clusters) &&
        clusterResult.clusters.length === 0) ||
      (typeof clusterResult.clusters === "object" &&
        !Array.isArray(clusterResult.clusters) &&
        Object.keys(clusterResult.clusters).length === 0)
    ) {
      console.log(
        `No items found or clustered for theme ${themeId}, itemType ${itemType}, method ${method}`
      );
      return res.status(200).json({
        message: "No items found or clustered",
        clusters: Array.isArray(clusterResult?.clusters) ? [] : null, // Return empty array for flat, null for tree if empty
      });
    }

    let responsePayload;
    let idsToFetch = [];

    // Determine if the result is flat (kmeans) or hierarchical
    const isHierarchical =
      typeof clusterResult.clusters === "object" &&
      !Array.isArray(clusterResult.clusters); // Simplified check

    if (isHierarchical) {
      // Function to extract all item IDs from the tree
      function extractIds(node) {
        if (!node) return []; // Handle null/undefined nodes
        if (node.is_leaf) {
          return node.item_id ? [node.item_id] : []; // Ensure item_id exists
        }
        let ids = [];
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            // Use for...of loop
            ids = ids.concat(extractIds(child));
          }
        }
        return ids;
      }
      idsToFetch = extractIds(clusterResult.clusters);
    } else {
      // Flat structure (kmeans or similar)
      // Ensure clusterResult.clusters is an array before mapping
      if (Array.isArray(clusterResult.clusters)) {
        idsToFetch = clusterResult.clusters
          .map((item) => item.id)
          .filter((id) => id != null); // Filter out potential null/undefined ids
      } else {
        // Should not happen if isHierarchical check is correct, but handle defensively
        console.error(
          `Unexpected cluster result format for theme ${themeId}: Expected array but got ${typeof clusterResult.clusters}`
        );
        idsToFetch = [];
      }
    }

    // Filter unique IDs
    idsToFetch = [...new Set(idsToFetch)];

    // Fetch item details for all unique IDs found
    let items = [];
    const itemMap = new Map();
    if (idsToFetch.length > 0) {
      console.log(
        `Fetching details for ${idsToFetch.length} items (type: ${itemType})`
      );
      if (itemType === "problem") {
        items = await Problem.find({ _id: { $in: idsToFetch } }).lean();
      } else {
        items = await Solution.find({ _id: { $in: idsToFetch } }).lean();
      }
      for (const item of items) {
        itemMap.set(item._id.toString(), item.statement);
      }
      console.log(`Fetched details for ${itemMap.size} items.`);
    } else {
      console.log(`No IDs to fetch details for theme ${themeId}`);
    }

    // Prepare the response payload based on the structure
    if (isHierarchical) {
      console.log(`Enriching hierarchical tree for theme ${themeId}`);
      // Enrich the tree with text using the fetched items
      responsePayload = await enrichTreeWithText(
        clusterResult.clusters,
        itemType,
        itemMap
      );
    } else {
      console.log(
        `Mapping text details to flat cluster results for theme ${themeId}`
      );
      // Add text to each flat clustered item (ensure it's an array)
      if (Array.isArray(clusterResult.clusters)) {
        responsePayload = clusterResult.clusters.map((item) => ({
          ...item,
          text: itemMap.get(item.id) || "（テキスト情報取得エラー）",
        }));
      } else {
        // Defensive coding: if it's not hierarchical and not an array, return empty
        console.error(
          `Unexpected cluster result format during payload preparation for theme ${themeId}`
        );
        responsePayload = [];
      }
    }

    // Save the *original* cluster result (without text details) to the theme document
    const theme = await Theme.findById(themeId);
    if (theme) {
      if (!theme.clusteringResults) {
        theme.clusteringResults = {};
      }
      // Use a consistent key naming convention, including parameters
      const paramKey =
        method === "kmeans"
          ? params.n_clusters || "default"
          : params.distance_threshold
            ? `dist_${params.distance_threshold}`
            : params.n_clusters
              ? `n_${params.n_clusters}`
              : "default";
      const clusterKey = `${itemType}_${method}_${paramKey}`;

      console.log(
        `Saving original clustering result to theme ${themeId} under key: ${clusterKey}`
      );
      // Save the original result from clusterVectors (ids/structure only)
      theme.clusteringResults[clusterKey] = clusterResult.clusters; // Save the raw structure
      // Mark modified for nested object change detection if necessary
      theme.markModified("clusteringResults");
      await theme.save();
    } else {
      console.warn(
        `Theme not found for ID: ${themeId} when trying to save clustering results.`
      );
      // Consider if this should be an error response
    }

    // Return the result with text details included (either flat list or enriched tree)
    console.log(
      `Returning ${isHierarchical ? "hierarchical" : "flat"} clustering results for theme ${themeId}`
    );
    return res.status(200).json({ clusters: responsePayload });
  } catch (error) {
    console.error(`Error clustering theme ${themeId}:`, error);
    // Check if the error is from the Python service (e.g., network error, 500)
    // or a database error here.
    return res.status(500).json({
      message: "Error during clustering process",
      error: error.message,
      // Optionally include error details based on environment (dev/prod)
      // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
