package com.subtly.auth.controller

import com.subtly.auth.dto.LoginRequest
import com.subtly.auth.dto.RefreshRequest
import com.subtly.auth.dto.SignupRequest
import com.subtly.auth.dto.TokenResponse
import com.subtly.auth.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    fun signup(@Valid @RequestBody request: SignupRequest): TokenResponse {
        return authService.signup(request)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): TokenResponse {
        return authService.login(request)
    }

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshRequest): TokenResponse {
        return authService.refresh(request.refreshToken)
    }
}
