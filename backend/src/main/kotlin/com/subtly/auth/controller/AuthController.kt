package com.subtly.auth.controller

import com.subtly.auth.dto.KakaoLoginRequest
import com.subtly.auth.dto.RefreshRequest
import com.subtly.auth.dto.TokenResponse
import com.subtly.auth.service.AuthService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/kakao")
    fun kakaoLogin(@Valid @RequestBody request: KakaoLoginRequest): TokenResponse {
        return authService.kakaoLogin(request.code, request.redirectUri)
    }

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshRequest): TokenResponse {
        return authService.refresh(request.refreshToken)
    }
}
