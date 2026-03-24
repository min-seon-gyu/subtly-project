package com.subtly.auth.service

import com.subtly.auth.dto.LoginRequest
import com.subtly.auth.dto.SignupRequest
import com.subtly.auth.dto.TokenResponse
import com.subtly.auth.entity.Member
import com.subtly.auth.entity.RefreshToken
import com.subtly.auth.jwt.JwtTokenProvider
import com.subtly.auth.repository.MemberRepository
import com.subtly.auth.repository.RefreshTokenRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional(readOnly = true)
class AuthService(
    private val memberRepository: MemberRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val refreshTokenRepository: RefreshTokenRepository,
) {
    @Transactional
    fun signup(request: SignupRequest): TokenResponse {
        require(!memberRepository.existsByEmail(request.email)) { "이미 가입된 이메일입니다" }

        val member = memberRepository.save(
            Member(
                email = request.email,
                password = passwordEncoder.encode(request.password),
                nickname = request.nickname,
            )
        )
        return createTokenResponse(member)
    }

    @Transactional
    fun login(request: LoginRequest): TokenResponse {
        val member = memberRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다") }

        require(passwordEncoder.matches(request.password, member.password)) {
            "이메일 또는 비밀번호가 올바르지 않습니다"
        }

        return createTokenResponse(member)
    }

    @Transactional
    fun refresh(refreshTokenValue: String): TokenResponse {
        val refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElseThrow { IllegalArgumentException("유효하지 않은 리프레시 토큰입니다") }

        require(!refreshToken.isExpired()) { "리프레시 토큰이 만료되었습니다" }

        val member = memberRepository.findById(refreshToken.memberId)
            .orElseThrow { IllegalArgumentException("사용자를 찾을 수 없습니다") }

        refreshTokenRepository.delete(refreshToken)
        return createTokenResponse(member)
    }

    private fun createTokenResponse(member: Member): TokenResponse {
        val accessToken = jwtTokenProvider.createToken(member.id, member.email)

        refreshTokenRepository.deleteByMemberId(member.id)
        val refreshToken = refreshTokenRepository.save(
            RefreshToken(
                token = UUID.randomUUID().toString(),
                memberId = member.id,
                expiresAt = LocalDateTime.now().plusDays(30),
            )
        )

        return TokenResponse(
            accessToken = accessToken,
            refreshToken = refreshToken.token,
            nickname = member.nickname,
        )
    }
}
