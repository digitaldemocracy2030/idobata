import express from "express";
import { auth } from "../auth/auth.js";

const router = express.Router();

router.all("/*", async (req, res) => {
  try {
    const response = await auth.handler(req);
    
    res.status(response.status);
    
    for (const [key, value] of Object.entries(response.headers)) {
      if (value) {
        res.setHeader(key, value);
      }
    }
    
    if (response.body) {
      res.send(response.body);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
});

export default router;
