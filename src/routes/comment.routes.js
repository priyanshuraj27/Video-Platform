import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const commentRouter = Router();

commentRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file as user needs to login to comment

commentRouter.route("/:videoId").get(getVideoComments).post(addComment);
commentRouter.route("/comment/:commentId").delete(deleteComment).patch(updateComment);

export default commentRouter