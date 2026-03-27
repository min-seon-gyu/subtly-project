package com.subtly.auth.client

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient

data class KakaoTokenResponse(
    val access_token: String,
)

data class KakaoUserInfo(
    val id: Long,
    val nickname: String,
    val profileImageUrl: String?,
)

@Component
class KakaoOAuthClient(
    @Value("\${kakao.client-id}") private val clientId: String,
    @Value("\${kakao.client-secret}") private val clientSecret: String,
) {
    private val webClient = WebClient.create()

    fun getAccessToken(code: String, redirectUri: String): String {
        val response = webClient.post()
            .uri("https://kauth.kakao.com/oauth/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(
                BodyInserters.fromFormData("grant_type", "authorization_code")
                    .with("client_id", clientId)
                    .with("redirect_uri", redirectUri)
                    .with("code", code)
                    .apply {
                        if (clientSecret.isNotBlank()) {
                            with("client_secret", clientSecret)
                        }
                    }
            )
            .retrieve()
            .bodyToMono(Map::class.java)
            .block() ?: throw IllegalArgumentException("카카오 인증에 실패했습니다")

        return response["access_token"] as? String
            ?: throw IllegalArgumentException("카카오 인증에 실패했습니다")
    }

    fun getUserInfo(accessToken: String): KakaoUserInfo {
        val response = webClient.get()
            .uri("https://kapi.kakao.com/v2/user/me")
            .header("Authorization", "Bearer $accessToken")
            .retrieve()
            .bodyToMono(Map::class.java)
            .block() ?: throw IllegalArgumentException("카카오 사용자 정보를 가져올 수 없습니다")

        val id = when (val rawId = response["id"]) {
            is Long -> rawId
            is Int -> rawId.toLong()
            else -> throw IllegalArgumentException("카카오 사용자 정보를 가져올 수 없습니다")
        }

        val properties = response["properties"] as? Map<*, *>
        val nickname = properties?.get("nickname") as? String ?: "카카오 사용자"
        val profileImage = properties?.get("profile_image") as? String

        return KakaoUserInfo(
            id = id,
            nickname = nickname,
            profileImageUrl = profileImage,
        )
    }
}
