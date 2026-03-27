package com.subtly.auth.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "members",
    indexes = [Index(name = "idx_member_kakao_id", columnList = "kakaoId", unique = true)]
)
class Member(
    @Column(nullable = false, unique = true)
    val kakaoId: Long,

    @Column(nullable = false)
    var nickname: String,

    var profileImageUrl: String? = null,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val createdAt: LocalDateTime = LocalDateTime.now(),
)
