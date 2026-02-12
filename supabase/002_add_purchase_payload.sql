-- purchases 테이블에 사주 데이터 payload 추가
-- 결제 전 sajuData + ghostClassification을 DB에 저장하여
-- localStorage 대신 Supabase를 source of truth로 사용

alter table purchases
  add column if not exists payload jsonb;

comment on column purchases.payload is 'JSON: { sajuData, ghostClassification } - 결제 시점의 사주 데이터';
