package com.subtly.auth.service

import com.subtly.auth.client.KakaoOAuthClient
import com.subtly.auth.client.KakaoUserInfo
import com.subtly.auth.repository.MemberRepository
import com.subtly.auth.repository.RefreshTokenRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    lateinit var authService: AuthService

    @Autowired
    lateinit var memberRepository: MemberRepository

    @Autowired
    lateinit var refreshTokenRepository: RefreshTokenRepository

    @MockitoBean
    lateinit var kakaoOAuthClient: KakaoOAuthClient

    @BeforeEach
    fun setUp() {
        refreshTokenRepository.deleteAll()
        memberRepository.deleteAll()
    }

    @Test
    fun `카카오 로그인 성공 - 신규 회원 자동 가입`() {
        given(kakaoOAuthClient.getAccessToken("test-code", "subtly://auth"))
            .willReturn("kakao-access-token")
        given(kakaoOAuthClient.getUserInfo("kakao-access-token"))
            .willReturn(KakaoUserInfo(id = 12345L, nickname = "카카오유저", profileImageUrl = null))

        val response = authService.kakaoLogin("test-code", "subtly://auth")

        assertThat(response.accessToken).isNotBlank()
        assertThat(response.refreshToken).isNotBlank()
        assertThat(response.nickname).isEqualTo("카카오유저")
        assertThat(memberRepository.findByKakaoId(12345L)).isPresent
    }

    @Test
    fun `카카오 로그인 성공 - 기존 회원 로그인`() {
        given(kakaoOAuthClient.getAccessToken("test-code", "subtly://auth"))
            .willReturn("kakao-access-token")
        given(kakaoOAuthClient.getUserInfo("kakao-access-token"))
            .willReturn(KakaoUserInfo(id = 12345L, nickname = "카카오유저", profileImageUrl = null))

        // 첫 번째 로그인 (가입)
        authService.kakaoLogin("test-code", "subtly://auth")

        // 두 번째 로그인 (기존 회원)
        val response = authService.kakaoLogin("test-code", "subtly://auth")

        assertThat(response.accessToken).isNotBlank()
        assertThat(response.nickname).isEqualTo("카카오유저")
        assertThat(memberRepository.count()).isEqualTo(1)
    }

    @Test
    fun `카카오 토큰 교환 실패 시 예외`() {
        given(kakaoOAuthClient.getAccessToken("bad-code", "subtly://auth"))
            .willThrow(IllegalArgumentException("카카오 인증에 실패했습니다"))

        assertThatThrownBy {
            authService.kakaoLogin("bad-code", "subtly://auth")
        }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessageContaining("카카오 인증에 실패했습니다")
    }
}
