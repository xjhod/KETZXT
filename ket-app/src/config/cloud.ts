/**
 * WorkBuddy 云服务配置
 *
 * ⚠️ 这里放的是**面向前端的安全配置**（publishableKey 只标识应用、不带任何权限，
 * 服务端会做 Origin 精确匹配），可以安全打进前端产物。
 * 真正的环境 id 与各厂商 API Key 都在服务端，前端永远拿不到。
 *
 * 数据来源：workbuddy_cloud_service 工具激活时返回的 publicConfig。
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

/**
 * 云服务数据面域名常量（保留给需要拼接口地址的场景）。
 *
 * ⚠️ 旧结论「服务端做 Origin 精确匹配，GitHub Pages 调用会 403、必须部署在本域名」
 * 已被 2026-11-03 用真实 SDK 逐模块实测推翻：
 * `ketzxt.app.workbuddy.host` 与 `xjhod.github.io` 两个 Origin
 * 在模型列表 / LLM 对话 / 认证 / 数据库上**全部正常**。
 * 因此部署到本域名不是功能前提，GitHub Pages 站点同样可用云服务。
 *
 * 注意：本常量仅表示数据面域名，不要拿它做「当前 Origin 是否受支持」的门禁判断。
 */
export const CLOUD_ORIGIN = 'https://ketzxt.app.workbuddy.host';
