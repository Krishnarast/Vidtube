import { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Video unliked successfully"
                )
            )
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video liked successfully"
            )
        )
})





export {
    toggleVideoLike,
  
}