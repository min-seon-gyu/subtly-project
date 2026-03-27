package com.subtly.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

@Component
class RateLimitFilter : OncePerRequestFilter() {

    private val requestCounts = ConcurrentHashMap<String, RateLimitEntry>()

    companion object {
        private const val MAX_REQUESTS = 30
        private const val WINDOW_MS = 60_000L // 1분
        private const val AUTH_MAX_REQUESTS = 10 // 인증 API는 더 엄격
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val clientIp = request.remoteAddr
        val path = request.requestURI
        val key = "$clientIp:$path"

        val limit = if (path.startsWith("/api/auth/")) AUTH_MAX_REQUESTS else MAX_REQUESTS

        val now = System.currentTimeMillis()
        val entry = requestCounts.compute(key) { _, existing ->
            if (existing == null || now - existing.windowStart > WINDOW_MS) {
                RateLimitEntry(windowStart = now, count = AtomicInteger(1))
            } else {
                existing.count.incrementAndGet()
                existing
            }
        }!!

        if (entry.count.get() > limit) {
            response.status = HttpStatus.TOO_MANY_REQUESTS.value()
            response.contentType = "application/json"
            response.writer.write("""{"message":"요청이 너무 많습니다. 잠시 후 다시 시도해주세요."}""")
            return
        }

        filterChain.doFilter(request, response)
    }

    private data class RateLimitEntry(
        val windowStart: Long,
        val count: AtomicInteger,
    )
}
