/**
 * WorkBuddy 云服务配置
 *
 * 这里放的是**面向前端的安全配置**（publishableKey 只标识应用、不带任何权限），
 * 可以安全打进前端产物。真正的环境 id 与各厂商 API Key 都在服务端，前端永远拿不到。
 *
 * 数据来源：workbuddy_cloud_service 工具激活时返回的 publicConfig。
 *
 * 部署说明：应用仅通过 GitHub Pages 提供（https://xjhod.github.io/KETZXT/），
 * 无需部署到 CLOUD_ENDPOINT 对应的专用域名。CLOUD_ENDPOINT 仅作数据面地址，
 * 2026-11-03 已实测两个 Origin 调用云服务均正常。
 */

/** 应用 ID（与 workbuddy_sites_deploy 的 appId 同一个） */
export const APP_ID = 'wbapp_j3Hgo6D41WQ58UC9E2EvFR';

/** 云服务数据面基址 */
export const CLOUD_ENDPOINT = 'https://ketzxt.app.workbuddy.host';

/** OAuth Relay（web 端 WorkBuddy 账号登录需要） */
export const CLOUD_OAUTH_RELAY = 'https://www.workbuddy.cn/v2/as/genie-baas/oauth';

/** 应用级公开密钥 */
export const CLOUD_PUBLISHABLE_KEY =
  'wbpk_j3Hgo6D41WQ58UC9E2EvFR_RjzAaByqoNiPOprHVzdVxIql0YaQLO3s';
