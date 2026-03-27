package com.subtly.auth.dto

import jakarta.validation.constraints.NotBlank

data class KakaoLoginRequest(
    @field:NotBlank
    val code: String,

    @field:NotBlank
    val redirectUri: String,
)

data class TokenResponse(
    val accessToken: String,
    val refreshToken: String,
    val nickname: String,
)

data class RefreshRequest(
    @field:NotBlank
    val refreshToken: String,
)
