package com.subtly.subscription.repository

import com.subtly.subscription.entity.Subscription
import org.springframework.data.jpa.repository.JpaRepository

interface SubscriptionRepository : JpaRepository<Subscription, Long> {
    fun findAllByMemberIdOrderByCreatedAtDesc(memberId: Long): List<Subscription>
    fun findByIdAndMemberId(id: Long, memberId: Long): Subscription?
    fun countByMemberIdAndIsActive(memberId: Long, isActive: Boolean): Long
    fun deleteAllByMemberId(memberId: Long)
}
