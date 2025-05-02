import express from "express";
import {
  clusterQuestion,
  generateQuestionEmbeddings,
  searchQuestion,
} from "../controllers/embeddingController.js";

const router = express.Router({ mergeParams: true });

router.post("/embeddings/generate", generateQuestionEmbeddings);

router.get("/search", searchQuestion);

router.post("/cluster", clusterQuestion);

export default router;
