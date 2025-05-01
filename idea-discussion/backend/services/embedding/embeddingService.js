import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://python-service:8000";

/**
 * Generate embeddings for a list of items
 * @param {Array} items - List of items with id, text, topicId, questionId, and itemType
 * @returns {Promise} - Response from the Python service
 */
async function generateEmbeddings(items) {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/embeddings/generate`, {
      items,
    });
    return response.data;
  } catch (error) {
    console.error("Error calling Python embedding service:", error);
    throw error;
  }
}

/**
 * Generate a transient embedding for a text query
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array>} - Embedding vector
 */
async function generateTransientEmbedding(text) {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/embeddings/transient`, {
      text,
    });
    return response.data.embedding;
  } catch (error) {
    console.error("Error generating transient embedding:", error);
    throw error;
  }
}

/**
 * Search for vectors similar to the query vector
 * @param {Array} queryVector - Query embedding vector
 * @param {Object} filter - Filter criteria (topicId, questionId, itemType)
 * @param {number} k - Number of results to return
 * @returns {Promise} - Search results from the Python service
 */
async function searchVectors(queryVector, filter, k = 10) {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/vectors/search`, {
      queryVector,
      filter,
      k,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching vectors:", error);
    throw error;
  }
}

/**
 * Cluster vectors based on the filter criteria
 * @param {Object} filter - Filter criteria (topicId, questionId, itemType)
 * @param {string} method - Clustering method ('kmeans' or 'hierarchical')
 * @param {Object} params - Clustering parameters
 * @returns {Promise} - Clustering results from the Python service
 */
async function clusterVectors(filter, method = "kmeans", params = { n_clusters: 3 }) {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/vectors/cluster`, {
      filter,
      method,
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error clustering vectors:", error);
    throw error;
  }
}

export {
  generateEmbeddings,
  generateTransientEmbedding,
  searchVectors,
  clusterVectors,
};
