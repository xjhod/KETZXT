/**
 * 密码哈希工具 —— 取代明文存储。
 *
 * 背景：原实现把密码明文写进 localStorage，且「忘记密码」功能直接把明文密码显示出来。
 * 这在本机自用场景风险不高，但一旦接入云端同步，明文密码就会被上传到服务端，
 * 因此改为：**本地和云端都只存 PBKDF2 派生哈希**。
 *
 * 方案：
 *   - 算法 PBKDF2-HMAC-SHA256，10 万次迭代（Web Crypto 原生支持，无第三方依赖）
 *   - 每个用户一个独立随机盐（salt）
 *   - 校验用「恒定时间比较」，避免计时侧信道
 *
 * 注意：PBKDF2 是有意做慢的。10 万次迭代在手机上也只要几十到一百多毫秒，
 * 登录/注册这种低频操作完全可以接受。
 */

/** 迭代次数。调高会显著增加暴力破解成本，但每次校验也变慢。 */
const ITERATIONS = 100_000;

/** 派生密钥长度（比特）。256 位足够。 */
const KEY_BITS = 256;

/** 生成随机盐（base64） */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

/**
 * 用密码 + 盐派生哈希（base64）。
 * @param password 明文密码（只在用户输入的瞬间存在于内存）
 * @param salt base64 盐
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BITS
  );
  return bytesToBase64(new Uint8Array(bits));
}

/**
 * 恒定时间字符串比较。
 * 长度不同也要走完整个循环，避免通过响应时间推断前缀。
 */
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

// ========== base64 <-> bytes ==========

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000; // 避免 apply 参数过多爆栈
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunk) as unknown as number[]
    );
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
