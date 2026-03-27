package com.subtly.auth.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.subtly.auth.client.KakaoOAuthClient
import com.subtly.auth.client.KakaoUserInfo
import com.subtly.auth.dto.KakaoLoginRequest
import com.subtly.auth.repository.MemberRepository
import com.subtly.auth.repository.RefreshTokenRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

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
    fun `카카오 로그인 성공 - 200 반환`() {
        given(kakaoOAuthClient.getAccessToken("test-code", "subtly://auth"))
            .willReturn("kakao-access-token")
        given(kakaoOAuthClient.getUserInfo("kakao-access-token"))
            .willReturn(KakaoUserInfo(id = 12345L, nickname = "카카오유저", profileImageUrl = null))

        val request = KakaoLoginRequest(code = "test-code", redirectUri = "subtly://auth")

        mockMvc.post("/api/auth/kakao") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isOk() }
            jsonPath("$.accessToken") { isNotEmpty() }
            jsonPath("$.refreshToken") { isNotEmpty() }
            jsonPath("$.nickname") { value("카카오유저") }
        }
    }

    @Test
    fun `인가코드 누락 - 400 반환`() {
        val request = KakaoLoginRequest(code = "", redirectUri = "subtly://auth")

        mockMvc.post("/api/auth/kakao") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(request)
        }.andExpect {
            status { isBadRequest() }
        }
    }
}
