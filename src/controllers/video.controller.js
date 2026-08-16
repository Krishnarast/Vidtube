import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"




const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(
            400,
            "Title and description are required"
        )
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(
            400,
            "Video file is required"
        )
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(
            400,
            "Thumbnail is required"
        )
    }

    const videoFile = await uploadOnCloudinary(
        videoLocalPath
    )

    const thumbnail = await uploadOnCloudinary(
        thumbnailLocalPath
    )

    if (!videoFile) {
        throw new ApiError(
            500,
            "Video upload failed"
        )
    }

    if (!thumbnail) {
        throw new ApiError(
            500,
            "Thumbnail upload failed"
        )
    }

    const video = await Video.create({

        videoFile: videoFile.url,

        thumbnail: thumbnail.url,

        title,

        description,

        duration: videoFile.duration || 0,

        owner: req.user._id

    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "Video published successfully"
            )
        )
})


const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)
        .populate(
            "owner",
            "username fullName avatar"
        )

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    video.views = video.views + 1

    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
        )
})


const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    if (
        video.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not allowed to update this video"
        )
    }

    video.title = title || video.title

    video.description =
        description || video.description

    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video updated successfully"
            )
        )
})


const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    if (
        video.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not allowed to delete this video"
        )
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
}