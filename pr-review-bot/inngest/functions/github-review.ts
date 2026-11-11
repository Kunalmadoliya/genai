import {inngest} from "../client";

export const githubReview = inngest.createFunction(
    { id: "github-review", name: "GitHub Review", triggers: [{ event: "github/pull_request_review" }] },
    async ({ event, step }) => {}
);
