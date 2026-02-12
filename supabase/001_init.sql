-- =============================================
-- 귀신사주 Supabase 테이블 생성
-- Supabase SQL Editor에서 실행
-- =============================================

-- gen_random_uuid()는 Postgres 13+에서 기본 내장

-- =============================================
-- saju_readings: 사주 풀이 결과
-- =============================================
create table if not exists saju_readings (
  id            uuid primary key default gen_random_uuid(),

  -- 생년월일 입력
  gender        text not null,                    -- 'male' | 'female'
  birth_year    integer not null,
  birth_month   integer not null,
  birth_day     integer not null,
  birth_hour    text not null,                    -- '자시', '축시', ... 또는 '모름'
  calendar_type text not null default 'solar',    -- 'solar' | 'lunar'
  is_leap_month boolean not null default false,

  -- 사주 엔진 결과
  saju_data     jsonb not null,                   -- SajuDataV2 전체 JSON
  engine_version text not null default '2.0.0',

  -- 귀신 분류
  ghost_classification jsonb,                     -- GhostClassification JSON (nullable)

  -- AI 풀이 결과
  reading_text  jsonb,                            -- FortuneSection[] JSON (결제 후 생성, nullable)
  model_used    text,                             -- 'claude-sonnet-4-5-20250929' 등

  -- 이메일 (결제 시 수집)
  email         text,                             -- 결제 시 입력한 이메일 (nullable)

  -- 메타
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_saju_readings_created_at on saju_readings (created_at desc);
create index if not exists idx_saju_readings_email on saju_readings (email) where email is not null;

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on saju_readings
  for each row
  execute function update_updated_at_column();

-- =============================================
-- reviews: 사용자 리뷰
-- =============================================
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  reading_id  uuid references saju_readings(id) on delete set null,
  review_text text not null,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_reviews_visible on reviews (is_visible, created_at desc)
  where is_visible = true;

-- =============================================
-- purchases: 결제 기록 (토스페이먼츠)
-- =============================================
create table if not exists purchases (
  id                uuid primary key default gen_random_uuid(),
  toss_order_id     text not null unique,        -- 토스 주문번호
  toss_payment_key  text,                        -- 결제 승인 후 토스 결제키
  product_id        text not null,               -- 'saju_reading'
  price             integer not null,            -- 9900 (원)
  status            text not null default 'PENDING',  -- PENDING → SUCCESS / FAILED
  reading_id        uuid references saju_readings(id) on delete set null,
  email             text,                        -- 결제자 이메일
  payload           jsonb,                       -- { sajuData, ghostClassification }
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_purchases_order_id on purchases (toss_order_id);
create index if not exists idx_purchases_status on purchases (status);

create trigger set_purchases_updated_at
  before update on purchases
  for each row
  execute function update_updated_at_column();

-- =============================================
-- RLS (Row Level Security) 정책
-- service_role은 RLS 우회하므로 서버 API만 쓰면 문제 없음.
-- anon key로 접근 시 보안을 위해 기본 차단.
-- =============================================

alter table saju_readings enable row level security;
alter table reviews enable row level security;
alter table purchases enable row level security;

-- service_role은 자동으로 RLS를 bypass하므로 별도 정책 불필요.
-- anon key로의 직접 접근은 차단됨 (정책 없음 = 거부).

-- 리뷰 읽기만 anon에게 허용 (공개 리뷰 표시용)
create policy "Public can read visible reviews"
  on reviews for select
  using (is_visible = true);
