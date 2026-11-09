import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {enqueueIndexingJob, enqueueQueryJob} from "./queue.js";

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(_dirname, "uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({storage: storage, limits: {fileSize: 25 * 1024 * 1024}}); // Limit file size to 25MB

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the file upload service!");
});

app.post("/index", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  try {
    const job = await enqueueIndexingJob({
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
    res.status(200).json({
      message: "File uploaded and indexing job enqueued successfully.",
      jobId: job.id,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Error during file indexing:", error);
    return res.status(500).send("Error during file indexing.");
  }
});

app.post("/query", async (req, res) => {
  const {query} = req.body?.query || {};
  if (!query) {
    return res.status(400).send("No query provided.");
  }

  try {
    const job = await enqueueQueryJob({query: query.trim()});
    res.status(200).json({
      message: "Query job enqueued successfully.",
      jobId: job.id,
      query: query,
      poll: `/query/${job.id}`,
    });
  } catch (error) {
    console.error("Error during query processing:", error);
    return res.status(500).send("Error during query processing.");
  }
});

app.get("/query/:jobId", async (req, res) => {
  const {jobId} = req.params;
  try {
    const job = await queryQueue.getJob(jobId);
    if (!job) {
      return res.status(404).send("Job not found.");
    }
    const state = await job.getState();

    if(state === "completed") {
        return res.json({ 
          jobId: job.id,
          state: state,
          result: job.returnvalue
        })
    }

    if(state === "failed") {}

    return res.json({
      jobId: job.id,
      state: state,
    });
  } catch (error) {
    console.error("Error during query processing:", error);
    return res.status(500).send("Error during query processing.");
  }
});


app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(400).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
});