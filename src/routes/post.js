
const express = require('express');
const { insertSingleDocument, findDocuments, replaceDocument} = require('../db/dbInteraction');
const { postCreationValidator, postQueryValidator, postInteractionValidator } = require("../schema/schema");
const { secondsElapsedSince, sortByInterest } = require("../utilities/shared");
const { authenticateToken } = require("../auth/auth");
const postRouter = express.Router();

postRouter.post("/create", authenticateToken, postCreationValidator, async (req, res) => {
  try {
    const newEntry = {
      title: req.body.title,
      topic: req.body.topic,
      owner: req.body.owner,
      message: req.body.message,
      timestamp: new Date().toISOString(),
      expirationTime: req.body.expirationTime || 86400,
      status: "Live",
      interactions: [],
      likes: 0,
      dislikes: 0
    };

    const dbDoc = (await findDocuments("posts", {title: req.body.title}))[0];
    if (dbDoc) {
      return res.status(409).send({ error: `Post with title "${req.body.title}" already exists` });
    }

    await insertSingleDocument("posts", newEntry);
    return res.status(200).send({ message: `Post created by ${req.body.owner}` });
  } catch (error) {
    return res.status(500).send({ error: "Server error, please try again later" });
  }
});

postRouter.post("/action", authenticateToken, postInteractionValidator, async (req, res) => {
  try {
    const { title, like, dislike, comment } = req.body;
    const { email } = req.user;
    const query = { title };
    const postDoc = (await findDocuments("posts", query))[0];
    if (!postDoc) {
      return res.status(404).send({ error: `No post found with title ${title}` });
    }
    if (postDoc.status === "Expired") {
      return res.status(404).send({ error: "Post expired, cannot interact" });
    }
    if (email === postDoc.owner && (like || dislike)) {
      return res.status(404).send({ error: "Owner cannot like/dislike own post" });
    }
    const elapsed = secondsElapsedSince(postDoc.timestamp);
    if (elapsed > postDoc.expirationTime) {
      postDoc.status = "Expired";
      await replaceDocument("posts", query, postDoc);
      return res.status(404).send({ error: "Post expired, update not allowed" });
    }
    const userAction = {
      email,
      ...(like !== undefined && { like }),
      ...(dislike !== undefined && { dislike }),
      ...(comment !== undefined && { comment }),
      timestamp: new Date().toISOString()
    };
    postDoc.interactions.push(userAction);
    postDoc.expirationTime = postDoc.expirationTime - elapsed < 0 ? 0 : postDoc.expirationTime - elapsed;
    postDoc.likes = like ? postDoc.likes + 1 : postDoc.likes;
    postDoc.dislikes = dislike ? postDoc.dislikes + 1 : postDoc.dislikes;
    await replaceDocument("posts", query, postDoc);
    return res.status(200).send({ message: `Post interacted by ${email}` });
  } catch (err) {
    console.error("Interaction error:", err);
    return res.status(500).send({ error: "Server error, please try again later" });
  }
});

postRouter.get("/fetch", authenticateToken, postQueryValidator, async (req, res) => {
  // search by topic, status, or get most popular post
  const { topic, status, highestInterest } = req.query;
  let resultPosts = [];
  const query = {
    ...(topic && { topic }),
    ...(status && { status })
  };
  const foundPosts = await findDocuments("posts", query);
  if (highestInterest) {
    foundPosts.sort(sortByInterest);
    resultPosts = foundPosts[0] ? [foundPosts[0]] : [];
  } else {
    resultPosts = foundPosts;
  }
  res.status(200).send({ posts: resultPosts });
});

module.exports = postRouter;
