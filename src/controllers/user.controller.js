import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {

    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken()

    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken

    await user.save({
        validateBeforeSave: false
    })

    return {
        accessToken,
        refreshToken
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const {
        fullName,
        email,
        username,
        password
    } = req.body

    if (!fullName || !email || !username || !password) {
        throw new ApiError(
            400,
            "All fields are required"
        )
    }

    const existedUser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (existedUser) {
        throw new ApiError(
            409,
            "User already exists"
        )
    }

    const avatarLocalPath =
        req.file?.path

    let avatarUrl = ""

    if (avatarLocalPath) {

        const avatar =
            await uploadOnCloudinary(
                avatarLocalPath
            )

        if (!avatar) {
            throw new ApiError(
                400,
                "Avatar upload failed"
            )
        }

        avatarUrl = avatar.url
    }

    const user = await User.create({

        fullName,

        email,

        username:
            username.toLowerCase(),

        password,

        avatar: avatarUrl
    })

    const createdUser =
        await User.findById(user._id)
        .select("-password -refreshToken")

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdUser,
                "User registered successfully"
            )
        )
})


const loginUser = asyncHandler(async (req, res) => {

    const {
        email,
        username,
        password
    } = req.body

    if (!email && !username) {
        throw new ApiError(
            400,
            "Email or username is required"
        )
    }

    const user = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (!user) {
        throw new ApiError(
            404,
            "User does not exist"
        )
    }

    const isPasswordValid =
        await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(
            401,
            "Invalid credentials"
        )
    }

    const {
        accessToken,
        refreshToken
    } = await generateAccessAndRefreshTokens(
        user._id
    )

    const loggedInUser =
        await User.findById(user._id)
        .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie(
            "accessToken",
            accessToken,
            options
        )
        .cookie(
            "refreshToken",
            refreshToken,
            options
        )
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                },
                "User logged in successfully"
            )
        )
})


const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,

        {
            $unset: {
                refreshToken: 1
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie(
            "accessToken",
            options
        )
        .clearCookie(
            "refreshToken",
            options
        )
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out"
            )
        )
})


const refreshAccessToken = asyncHandler(
    async (req, res) => {

        const incomingRefreshToken =
            req.cookies.refreshToken ||
            req.body.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(
                401,
                "Refresh token required"
            )
        }

        const decodedToken =
            jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )

        const user =
            await User.findById(
                decodedToken._id
            )

        if (
            !user ||
            user.refreshToken !==
            incomingRefreshToken
        ) {
            throw new ApiError(
                401,
                "Invalid refresh token"
            )
        }

        const {
            accessToken,
            refreshToken
        } = await generateAccessAndRefreshTokens(
            user._id
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie(
                "accessToken",
                accessToken,
                options
            )
            .cookie(
                "refreshToken",
                refreshToken,
                options
            )
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken
                    },
                    "Access token refreshed"
                )
            )
    }
)


const getCurrentUser = asyncHandler(
    async (req, res) => {

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    req.user,
                    "User fetched successfully"
                )
            )
    }
)


const updateAccountDetails =
    asyncHandler(async (req, res) => {

        const {
            fullName,
            email
        } = req.body

        const user =
            await User.findByIdAndUpdate(
                req.user._id,

                {
                    $set: {
                        fullName,
                        email
                    }
                },

                {
                    new: true
                }
            ).select("-password -refreshToken")

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Account updated successfully"
                )
            )
    })


const updateUserAvatar =
    asyncHandler(async (req, res) => {

        const avatarLocalPath =
            req.file?.path

        if (!avatarLocalPath) {
            throw new ApiError(
                400,
                "Avatar file is required"
            )
        }

        const avatar =
            await uploadOnCloudinary(
                avatarLocalPath
            )

        if (!avatar) {
            throw new ApiError(
                400,
                "Avatar upload failed"
            )
        }

        const user =
            await User.findByIdAndUpdate(

                req.user._id,

                {
                    $set: {
                        avatar: avatar.url
                    }
                },

                {
                    new: true
                }

            ).select("-password -refreshToken")

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "Avatar updated successfully"
                )
            )
    })


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
}