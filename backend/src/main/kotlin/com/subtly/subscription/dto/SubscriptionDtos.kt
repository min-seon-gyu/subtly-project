package com.subtly.subscription.dto

import com.subtly.subscription.entity.BillingCycle
import com.subtly.subscription.entity.Subscription
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import java.time.LocalDate

data class CreateSubscriptionRequest(
    @field:NotBlank
    val name: String,

    @field:Positive
    val price: Int,

    val billingCycle: BillingCycle,

    @field:Min(1) @field:Max(31)
    val billingDate: Int,

    @field:NotBlank
    val category: String,

    @field:NotBlank
    val color: String,

    @field:NotBlank
    val icon: String,

    val memo: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val paymentMethod: String? = null,
    val currency: String = "KRW",
)

data class UpdateSubscriptionRequest(
    val name: String? = null,
    val price: Int? = null,
    val billingCycle: BillingCycle? = null,
    val billingDate: Int? = null,
    val category: String? = null,
    val color: String? = null,
    val icon: String? = null,
    val memo: String? = null,
    val isActive: Boolean? = null,
    val pausedUntil: LocalDate? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val paymentMethod: String? = null,
    val currency: String? = null,
    val clearPausedUntil: Boolean = false,
)

data class SubscriptionResponse(
    val id: Long,
    val name: String,
    val price: Int,
    val billingCycle: BillingCycle,
    val billingDate: Int,
    val category: String,
    val color: String,
    val icon: String,
    val memo: String?,
    val isActive: Boolean,
    val pausedUntil: String?,
    val startDate: String?,
    val endDate: String?,
    val paymentMethod: String?,
    val currency: String,
    val createdAt: String,
    val updatedAt: String,
) {
    companion object {
        fun from(entity: Subscription) = SubscriptionResponse(
            id = entity.id,
            name = entity.name,
            price = entity.price,
            billingCycle = entity.billingCycle,
            billingDate = entity.billingDate,
            category = entity.category,
            color = entity.color,
            icon = entity.icon,
            memo = entity.memo,
            isActive = entity.isActive,
            pausedUntil = entity.pausedUntil?.toString(),
            startDate = entity.startDate?.toString(),
            endDate = entity.endDate?.toString(),
            paymentMethod = entity.paymentMethod,
            currency = entity.currency,
            createdAt = entity.createdAt.toString(),
            updatedAt = entity.updatedAt.toString(),
        )
    }
}

data class SubscriptionSummaryResponse(
    val totalMonthly: Int,
    val totalYearly: Int,
    val activeCount: Long,
    val upcomingPayments: List<UpcomingPaymentResponse>,
)

data class UpcomingPaymentResponse(
    val subscription: SubscriptionResponse,
    val dueDate: String,
    val daysUntil: Int,
)
