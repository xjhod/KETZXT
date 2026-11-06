/**
 * WorkBuddy 云服务配置
 *
 * 这里放的是**面向前端的安全配置**（publishableKey 只标识应用、不带任何权限），
 * 可以安全打进前端产物。真正的环境 id 与各厂商 API Key 都在服务端，前端永远拿不到。
 *
 * 数据来源：workbuddy_cloud_service 工具激活时返回的 publicConfig。
 *
 * 部署说明：应用仅通过 GitHub Pages 提供（https://xjhod.github.io/KETZXT/）。
 * CLOUD_ENDPOINT 是云数据面基址；浏览器从该 Origin 调用时，云端必须在「允许来源」
 * 里登记 https://xjhod.github.io，否则预检(OPTIONS)被边缘层拦截 -> Failed to fetch。
 *
 * 2026-11-06：旧 app(wbapp_j3Hgo6D41WQ58UC9E2EvFR) 凭据被吊销，已新建云应用并刷新凭据。
 * 注意：新端点的「允许来源」仍需把 https://xjhod.github.io 登记进去，云端登录才会通。
 */

/** 应用 ID（与 workbuddy_sites_deploy 的 appId 同一个） */
export const APP_ID = 'wbapp_92CYDpX4u22mx02jLeALpq';

/** 云服务数据面基址 */
export const CLOUD_ENDPOINT = 'https://ketzxt-99302.app.workbuddy.host';

/** OAuth Relay（web 端 WorkBuddy 账号登录需要） */
export const CLOUD_OAUTH_RELAY = 'https://www.workbuddy.cn/v2/as/genie-baas/oauth';

/** 应用级公开密钥 */
export const CLOUD_PUBLISHABLE_KEY =
  'wbpk_92CYDpX4u22mx02jLeALpq_o1YL5h9kH9nAzxEpZqaOWZJGTBXGOm1x';
