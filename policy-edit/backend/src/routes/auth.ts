import express from "express";
import { Request as ExpressRequest } from "express";
import { auth } from "../auth/auth.js";

const router = express.Router();

router.all("/*", async (req: ExpressRequest, res) => {
  try {
    const request = new Request(req.url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const response = await auth.handler(request);

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
