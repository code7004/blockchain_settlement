/**
 * -----------------------------------------------------------------------------
 * AES-256-GCM Encryption Module
 * -----------------------------------------------------------------------------
 *
 * 역할:
 * - Wallet privateKey를 평문으로 저장하지 않기 위한 암호화 모듈
 * - DB에는 encryptedPrivateKey만 저장
 * - masterKey는 반드시 환경변수(WALLET_MASTER_KEY_BASE64)에서 로드
 *
 * 보안 원칙:
 * - privateKey 평문 저장 금지 (Security_Principles.md)
 * - DB 유출 시 즉시 자금 탈취 방지 목적
 * - AES-256-GCM 사용 (암호화 + 무결성 검증)
 *
 * 주의:
 * - masterKey는 절대 코드에 하드코딩하지 않는다.
 * - 로그에 privateKey 출력 금지
 * - 복호화는 반드시 필요한 순간에만 수행
 *
 * Phase1 범위:
 * - 환경변수 기반 master key 사용
 * - KMS/Vault는 Phase2에서 적용 예정
 * -----------------------------------------------------------------------------
 */

import * as crypto from 'crypto';

/**
 * AES-256-GCM 암호화 페이로드 구조
 */
type Aes256GcmPayload = {
  v: 1; // 버전 (향후 key rotation 대비)
  alg: 'aes-256-gcm'; // 알고리즘 식별자
  iv: string; // 초기화 벡터 (base64)
  tag: string; // GCM 인증 태그 (base64)
  data: string; // 암호화된 데이터 (base64)
};

const IV_LENGTH = 12; // GCM 권장 IV 길이 (96bit)
const KEY_LENGTH = 32; // AES-256 → 32 bytes

/**
 * 환경변수에서 master key 로드
 *
 * @throws Error - 키가 없거나 길이가 맞지 않을 경우
 */
function getMasterKey(masterKey: string): Buffer {
  if (!masterKey) {
    throw new Error('Missing maskter key');
  }

  const key = Buffer.from(masterKey, 'base64');

  if (key.length !== KEY_LENGTH) {
    throw new Error(`Invalid master key length. Expected ${KEY_LENGTH} bytes, got ${key.length}`);
  }

  return key;
}

/**
 * privateKey를 AES-256-GCM으로 암호화한다.
 *
 * @param plainText - 평문 privateKey
 * @returns base64 인코딩된 암호화 문자열
 *
 * 동작 흐름:
 * 1. 랜덤 IV 생성
 * 2. AES-256-GCM 암호화
 * 3. 인증 태그 포함
 * 4. JSON payload → base64 인코딩
 */
export function encryptPrivateKey(plainText: string, b64: string): string {
  const key = getMasterKey(b64);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

  const tag = cipher.getAuthTag();

  const payload: Aes256GcmPayload = {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
}

/**
 * encryptedPrivateKey를 복호화한다.
 *
 * @param cipherTextB64 - base64 인코딩된 암호화 데이터
 * @returns 복호화된 plain privateKey
 *
 * @throws Error - 위변조 또는 키 불일치 시
 *
 * 보안 주의:
 * - 복호화는 최소한으로 수행해야 한다.
 * - 복호화된 키는 메모리 내에서만 사용한다.
 */
export function decryptPrivateKey(cipherTextB64: string, b64: string): string {
  const key = getMasterKey(b64);

  const json = Buffer.from(cipherTextB64, 'base64').toString('utf8');
  const payload = JSON.parse(json) as Aes256GcmPayload;

  if (payload.v !== 1 || payload.alg !== 'aes-256-gcm') {
    throw new Error('Unsupported cipher payload');
  }

  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const data = Buffer.from(payload.data, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

  return decrypted.toString('utf8');
}
