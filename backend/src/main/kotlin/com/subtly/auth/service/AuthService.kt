package com.subtly.auth.service

import com.subtly.auth.client.KakaoOAuthClient
import com.subtly.auth.dto.TokenResponse
import com.subtly.auth.entity.Member
import com.subtly.auth.entity.RefreshToken
import com.subtly.auth.jwt.JwtTokenProvider
import com.subtly.auth.repository.MemberRepository
import com.subtly.auth.repository.RefreshTokenRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional(readOnly = true)
class AuthService(
    private val memberRepository: MemberRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val kakaoOAuthClient: KakaoOAuthClient,
) {
    @Transactional
    fun kakaoLogin(code: String, redirectUri: String): TokenResponse {
        val kakaoToken = kakaoOAuthClient.getAccessToken(code, redirectUri)
        val kakaoUser = kakaoOAuthClient.getUserInfo(kakaoToken)

        val member = memberRepository.findByKakaoId(kakaoUser.id)
            .orElseGet {
                memberRepository.save(
                    Member(
                        kakaoId = kakaoUser.id,
                        nickname = kakaoUser.nickname,
                        profileImageUrl = kakaoUser.profileImageUrl,
                    )
                )
            }

        // 기존 회원이면 닉네임/프로필 업데이트
        member.nickname = kakaoUser.nickname
        member.profileImageUrl = kakaoUser.profileImageUrl

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
        val accessToken = jwtTokenProvider.createToken(member.id, member.kakaoId.toString())

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
