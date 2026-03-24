package com.subtly.auth.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "refresh_tokens")
class RefreshToken(
    @Column(nullable = false, unique = true)
    val token: String,

    @Column(nullable = false)
    val memberId: Long,

    @Column(nullable = false)
    val expiresAt: LocalDateTime,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
) {
    fun isExpired(): Boolean = LocalDateTime.now().isAfter(expiresAt)
}
