package com.subtly.auth.repository

import com.subtly.auth.entity.Member
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface MemberRepository : JpaRepository<Member, Long> {
    fun findByKakaoId(kakaoId: Long): Optional<Member>
}
