import { io } from "../server.js";

/**
 * Emit a new extraction event to all clients subscribed to a theme or thread
 * @param {string} themeId - The theme ID
 * @param {string} threadId - The thread ID (optional)
 * @param {string} type - The type of extraction ("problem" or "solution")
 * @param {Object} data - The extraction data
 */
export function emitNewExtraction(themeId, threadId, type, data) {
  console.log(
    `[SocketService] Emitting new-extraction event for theme:${themeId}`
  );

  const event = {
    type,
    data,
  };

  io.to(`theme:${themeId}`).emit("new-extraction", event);

  if (threadId) {
    console.log(
      `[SocketService] Emitting new-extraction event for thread:${threadId}`
    );
    io.to(`thread:${threadId}`).emit("new-extraction", event);
  }
}

/**
 * Emit an extraction update event to all clients subscribed to a theme or thread
 * @param {string} themeId - The theme ID
 * @param {string} threadId - The thread ID (optional)
 * @param {string} type - The type of extraction ("problem" or "solution")
 * @param {Object} data - The extraction data
 */
export function emitExtractionUpdate(themeId, threadId, type, data) {
  console.log(
    `[SocketService] Emitting extraction-update event for theme:${themeId}`
  );

  const event = {
    type,
    data,
  };

  io.to(`theme:${themeId}`).emit("extraction-update", event);

  if (threadId) {
    console.log(
      `[SocketService] Emitting extraction-update event for thread:${threadId}`
    );
    io.to(`thread:${threadId}`).emit("extraction-update", event);
  }
}
