// ========== 登录/切换账号后重载三个学习 store ==========
// persist 在 store 创建时按当时登录用户 hydrate 一次；会话内切换账号时，
// 内存里仍是上一个用户的数据，需要手动重新从「当前用户」对应分片载入。
// 必须在 login() 设置好 CURRENT_USER_KEY 之后、跳转首页之前调用。
import { useProgressStore } from './useProgressStore';
import { usePlanStore } from './usePlanStore';
import { useDailyCheckinStore } from './useDailyCheckinStore';

export async function rehydrateAllStores(): Promise<void> {
  await Promise.all([
    useProgressStore.persist.rehydrate(),
    usePlanStore.persist.rehydrate(),
    useDailyCheckinStore.persist.rehydrate(),
  ]);
}
