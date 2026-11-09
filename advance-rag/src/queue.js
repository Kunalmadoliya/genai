import {Queue} from "bullmq";
import { config , INDEXING_QUEUE , Querty_QUEUE } from "./config.js";

export const connection = {
    host : config.REDIS_HOST,
    port : config.REDIS_PORT,
    maxRetriesPerRequest : null,
}

export const indexingQueue = new Queue(INDEXING_QUEUE, { connection });
export const queryQueue = new Queue(Querty_QUEUE, { connection });

export async function enqueueIndexingJob(payload) {
  await indexingQueue.add("indexing", payload , {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2 seconds
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

export async function enqueueQueryJob(payload) {
  await queryQueue.add("query", payload , {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 100, // 2 seconds
    },
    removeOnComplete: {age : 3600, count: 1000}, // Remove completed jobs after 1 hour or keep the last 100
    removeOnFail: {age : 3600, count: 1000}, // Remove failed jobs after 1 hour or keep the last 500
  });
}