import express from "express";
import {
  upload,
  uploadVideo,
  getAllVideos,
  getPublishedVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";

const videoRouter = express.Router();

videoRouter.post("/upload", upload.single("video"), uploadVideo);
videoRouter.get("/admin", getAllVideos);
videoRouter.get("/", getPublishedVideos);
videoRouter.get("/:id", getVideoById);
videoRouter.post("/", createVideo);
videoRouter.patch("/:id", updateVideo);
videoRouter.delete("/:id", deleteVideo);

export default videoRouter;
