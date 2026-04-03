package com.subtly.subscription.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "subscriptions",
    indexes = [Index(name = "idx_subscription_member_id", columnList = "memberId")]
)
class Subscription(
    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var price: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var billingCycle: BillingCycle,

    @Column(nullable = false)
    var billingDate: Int,

    @Column(nullable = false)
    var category: String,

    @Column(nullable = false)
    var color: String,

    @Column(nullable = false)
    var icon: String,

    var memo: String? = null,

    @Column(nullable = false)
    var isActive: Boolean = true,

    var pausedUntil: LocalDate? = null,

    var startDate: LocalDate? = null,

    var endDate: LocalDate? = null,

    var paymentMethod: String? = null,

    @Column(nullable = false)
    var currency: String = "KRW",

    @Column(nullable = false)
    val memberId: Long,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val createdAt: LocalDateTime = LocalDateTime.now(),

    var updatedAt: LocalDateTime = LocalDateTime.now(),
) {
    fun update(
        name: String? = null,
        price: Int? = null,
        billingCycle: BillingCycle? = null,
        billingDate: Int? = null,
        category: String? = null,
        color: String? = null,
        icon: String? = null,
        memo: String? = null,
        isActive: Boolean? = null,
        setPausedUntil: Boolean = false,
        pausedUntil: LocalDate? = null,
        setStartDate: Boolean = false,
        startDate: LocalDate? = null,
        setEndDate: Boolean = false,
        endDate: LocalDate? = null,
        setPaymentMethod: Boolean = false,
        paymentMethod: String? = null,
        currency: String? = null,
    ) {
        name?.let { this.name = it }
        price?.let { this.price = it }
        billingCycle?.let { this.billingCycle = it }
        billingDate?.let { this.billingDate = it }
        category?.let { this.category = it }
        color?.let { this.color = it }
        icon?.let { this.icon = it }
        memo?.let { this.memo = it }
        isActive?.let { this.isActive = it }
        if (setPausedUntil) this.pausedUntil = pausedUntil
        if (setStartDate) this.startDate = startDate
        if (setEndDate) this.endDate = endDate
        if (setPaymentMethod) this.paymentMethod = paymentMethod
        currency?.let { this.currency = it }
        this.updatedAt = LocalDateTime.now()
    }
}

enum class BillingCycle {
    MONTHLY, YEARLY, WEEKLY
}
