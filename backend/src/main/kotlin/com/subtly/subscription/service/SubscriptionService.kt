package com.subtly.subscription.service

import com.subtly.config.NotFoundException
import com.subtly.subscription.dto.*
import com.subtly.subscription.entity.BillingCycle
import com.subtly.subscription.entity.Subscription
import com.subtly.subscription.repository.SubscriptionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
@Transactional(readOnly = true)
class SubscriptionService(
    private val subscriptionRepository: SubscriptionRepository,
) {
    fun getSubscriptions(memberId: Long): List<SubscriptionResponse> {
        return subscriptionRepository.findAllByMemberIdOrderByCreatedAtDesc(memberId)
            .map(SubscriptionResponse::from)
    }

    @Transactional
    fun createSubscription(memberId: Long, request: CreateSubscriptionRequest): SubscriptionResponse {
        val subscription = subscriptionRepository.save(
            Subscription(
                name = request.name,
                price = request.price,
                billingCycle = request.billingCycle,
                billingDate = request.billingDate,
                category = request.category,
                color = request.color,
                icon = request.icon,
                memo = request.memo,
                startDate = request.startDate,
                endDate = request.endDate,
                paymentMethod = request.paymentMethod,
                currency = request.currency,
                memberId = memberId,
            )
        )
        return SubscriptionResponse.from(subscription)
    }

    @Transactional
    fun updateSubscription(memberId: Long, id: Long, request: UpdateSubscriptionRequest): SubscriptionResponse {
        val subscription = subscriptionRepository.findByIdAndMemberId(id, memberId)
            ?: throw NotFoundException("구독 정보를 찾을 수 없습니다")

        subscription.update(
            name = request.name,
            price = request.price,
            billingCycle = request.billingCycle,
            billingDate = request.billingDate,
            category = request.category,
            color = request.color,
            icon = request.icon,
            memo = request.memo,
            isActive = request.isActive,
            setPausedUntil = request.pausedUntil != null || request.clearPausedUntil,
            pausedUntil = request.pausedUntil,
            setStartDate = request.startDate != null,
            startDate = request.startDate,
            setEndDate = request.endDate != null,
            endDate = request.endDate,
            setPaymentMethod = request.paymentMethod != null,
            paymentMethod = request.paymentMethod,
            currency = request.currency,
        )
        return SubscriptionResponse.from(subscription)
    }

    @Transactional
    fun deleteSubscription(memberId: Long, id: Long) {
        val subscription = subscriptionRepository.findByIdAndMemberId(id, memberId)
            ?: throw NotFoundException("구독 정보를 찾을 수 없습니다")
        subscriptionRepository.delete(subscription)
    }

    fun getSummary(memberId: Long): SubscriptionSummaryResponse {
        val subscriptions = subscriptionRepository.findAllByMemberIdOrderByCreatedAtDesc(memberId)
        val active = subscriptions.filter { it.isActive }

        val totalMonthly = active.sumOf { toMonthlyPrice(it) }
        val activeCount = subscriptionRepository.countByMemberIdAndIsActive(memberId, true)

        val today = LocalDate.now()
        val upcomingPayments = active.map { sub ->
            var dueDate = today.withDayOfMonth(sub.billingDate.coerceAtMost(today.lengthOfMonth()))
            if (dueDate.isBefore(today)) {
                dueDate = dueDate.plusMonths(1)
                dueDate = dueDate.withDayOfMonth(sub.billingDate.coerceAtMost(dueDate.lengthOfMonth()))
            }
            UpcomingPaymentResponse(
                subscription = SubscriptionResponse.from(sub),
                dueDate = dueDate.toString(),
                daysUntil = ChronoUnit.DAYS.between(today, dueDate).toInt(),
            )
        }.sortedBy { it.daysUntil }.take(5)

        return SubscriptionSummaryResponse(
            totalMonthly = totalMonthly,
            totalYearly = totalMonthly * 12,
            activeCount = activeCount,
            upcomingPayments = upcomingPayments,
        )
    }

    private fun toMonthlyPrice(subscription: Subscription): Int {
        return when (subscription.billingCycle) {
            BillingCycle.MONTHLY -> subscription.price
            BillingCycle.YEARLY -> subscription.price / 12
            BillingCycle.WEEKLY -> subscription.price * 4
        }
    }
}
