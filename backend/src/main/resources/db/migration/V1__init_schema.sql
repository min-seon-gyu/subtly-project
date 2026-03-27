CREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    kakao_id BIGINT NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(512),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE INDEX idx_member_kakao_id (kakao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    member_id BIGINT NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    UNIQUE INDEX idx_refresh_token (token),
    INDEX idx_refresh_token_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    billing_date INT NOT NULL,
    category VARCHAR(255) NOT NULL,
    color VARCHAR(20) NOT NULL,
    icon VARCHAR(20) NOT NULL,
    memo VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    member_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_subscription_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
