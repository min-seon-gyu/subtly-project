package com.subtly.subscription.service

import com.subtly.auth.entity.Member
import com.subtly.auth.repository.MemberRepository
import com.subtly.config.NotFoundException
import com.subtly.subscription.dto.CreateSubscriptionRequest
import com.subtly.subscription.dto.UpdateSubscriptionRequest
import com.subtly.subscription.entity.BillingCycle
import com.subtly.subscription.repository.SubscriptionRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class SubscriptionServiceTest {

    @Autowired
    lateinit var subscriptionService: SubscriptionService

    @Autowired
    lateinit var subscriptionRepository: SubscriptionRepository

    @Autowired
    lateinit var memberRepository: MemberRepository

    private var memberId: Long = 0

    @BeforeEach
    fun setUp() {
        subscriptionRepository.deleteAll()
        memberRepository.deleteAll()
        val member = memberRepository.save(
            Member(
                kakaoId = 12345L,
                nickname = "테스터",
            )
        )
        memberId = member.id
    }

    private fun createRequest(
        name: String = "Netflix",
        price: Int = 17000,
        billingCycle: BillingCycle = BillingCycle.MONTHLY,
        billingDate: Int = 15,
    ) = CreateSubscriptionRequest(
        name = name,
        price = price,
        billingCycle = billingCycle,
        billingDate = billingDate,
        category = "video",
        color = "#E50914",
        icon = "🎬",
    )

    @Test
    fun `구독 생성`() {
        val response = subscriptionService.createSubscription(memberId, createRequest())

        assertThat(response.name).isEqualTo("Netflix")
        assertThat(response.price).isEqualTo(17000)
        assertThat(response.isActive).isTrue()
    }

    @Test
    fun `구독 목록 조회`() {
        subscriptionService.createSubscription(memberId, createRequest(name = "Netflix"))
        subscriptionService.createSubscription(memberId, createRequest(name = "Spotify", price = 10900))

        val list = subscriptionService.getSubscriptions(memberId)

        assertThat(list).hasSize(2)
    }

    @Test
    fun `다른 사용자 구독은 조회되지 않음`() {
        subscriptionService.createSubscription(memberId, createRequest())

        val otherMember = memberRepository.save(
            Member(kakaoId = 99999L, nickname = "다른사람")
        )
        val list = subscriptionService.getSubscriptions(otherMember.id)

        assertThat(list).isEmpty()
    }

    @Test
    fun `구독 수정`() {
        val created = subscriptionService.createSubscription(memberId, createRequest())

        val updated = subscriptionService.updateSubscription(
            memberId, created.id,
            UpdateSubscriptionRequest(name = "Netflix Premium", price = 19000)
        )

        assertThat(updated.name).isEqualTo("Netflix Premium")
        assertThat(updated.price).isEqualTo(19000)
    }

    @Test
    fun `구독 일시정지`() {
        val created = subscriptionService.createSubscription(memberId, createRequest())

        val updated = subscriptionService.updateSubscription(
            memberId, created.id,
            UpdateSubscriptionRequest(isActive = false)
        )

        assertThat(updated.isActive).isFalse()
    }

    @Test
    fun `구독 삭제`() {
        val created = subscriptionService.createSubscription(memberId, createRequest())

        subscriptionService.deleteSubscription(memberId, created.id)

        assertThat(subscriptionService.getSubscriptions(memberId)).isEmpty()
    }

    @Test
    fun `다른 사용자 구독 수정 실패`() {
        val created = subscriptionService.createSubscription(memberId, createRequest())
        val otherMember = memberRepository.save(
            Member(kakaoId = 99999L, nickname = "다른사람")
        )

        assertThatThrownBy {
            subscriptionService.updateSubscription(
                otherMember.id, created.id,
                UpdateSubscriptionRequest(name = "해킹")
            )
        }.isInstanceOf(NotFoundException::class.java)
    }

    @Test
    fun `다른 사용자 구독 삭제 실패`() {
        val created = subscriptionService.createSubscription(memberId, createRequest())
        val otherMember = memberRepository.save(
            Member(kakaoId = 99999L, nickname = "다른사람")
        )

        assertThatThrownBy {
            subscriptionService.deleteSubscription(otherMember.id, created.id)
        }.isInstanceOf(NotFoundException::class.java)
    }

    @Test
    fun `월별 요약 계산`() {
        subscriptionService.createSubscription(memberId, createRequest(name = "Netflix", price = 17000))
        subscriptionService.createSubscription(memberId, createRequest(name = "Spotify", price = 10900))
        subscriptionService.createSubscription(
            memberId,
            createRequest(name = "iCloud", price = 12000, billingCycle = BillingCycle.YEARLY, billingDate = 1)
        )

        val summary = subscriptionService.getSummary(memberId)

        assertThat(summary.activeCount).isEqualTo(3)
        // 17000 + 10900 + (12000/12=1000) = 28900
        assertThat(summary.totalMonthly).isEqualTo(28900)
        assertThat(summary.totalYearly).isEqualTo(28900 * 12)
        assertThat(summary.upcomingPayments).hasSizeLessThanOrEqualTo(5)
    }

    @Test
    fun `비활성 구독은 요약에서 제외`() {
        val created = subscriptionService.createSubscription(memberId, createRequest(price = 17000))
        subscriptionService.updateSubscription(memberId, created.id, UpdateSubscriptionRequest(isActive = false))

        val summary = subscriptionService.getSummary(memberId)

        assertThat(summary.totalMonthly).isEqualTo(0)
        assertThat(summary.activeCount).isEqualTo(0)
    }
}
