# KET学习软件开发规范与经验教训

> **文档目的**：记录开发过程中的失误和改进方案，避免未来重复犯错。

---

## 🚨 重大失误案例

### 案例1：批量数据编辑导致文件损坏

**时间**：2026-06-04  
**文件**：`src/data/reading.ts`  
**问题**：
- 使用Python/Node.js脚本批量添加数据，多次插入到错误位置
- 引号转义错误，数组结构破坏
- 文件从可读状态变成完全无法构建

**后果**：浪费约2小时修复，最终只能从最小版本重建

**根本原因**：
1. 脚本没有精确识别插入点（`indexOf('];\n\n//')` 匹配到第一个，不是目标位置）
2. 大文件字符串操作容易出错
3. 没有增量验证，错误累积

**改进措施**：
- ✅ 使用AST解析或精确行号定位，不用字符串搜索
- ✅ 每添加一篇数据就运行 `tsc --noEmit` 验证
- ✅ 大批量修改前先创建git commit或备份文件

---

### 案例2：没有先做备份就直接修改

**问题**：直接修改 `reading.ts`（约2000行），没有备份

**后果**：文件损坏后无法恢复，只能手动重建

**改进措施**：
- ✅ 修改任何 `.ts` 数据文件前，必须先 `git commit`
- ✅ 大批量修改前，创建带时间戳的备份：
  ```bash
  cp reading.ts reading.ts.backup.$(date +%Y%m%d_%H%M%S)
  ```

---

### 案例3：Git初始化太晚

**问题**：项目开发很久后才运行 `git init`，之前的修改没有版本记录

**后果**：无法回滚到之前的可用状态

**改进措施**：
- ✅ 任何新项目，第一步就是 `git init`
- ✅ 每完成一个小功能就commit一次
- ✅ 提交消息要清晰描述做了什么

---

### 案例4：Windows下Python脚本编码问题

**问题**：Python脚本输出包含Unicode字符（如✅），Windows控制台GBK编码不支持

**后果**：脚本运行失败或输出乱码

**改进措施**：
- ✅ Python脚本输出使用ASCII字符或英文
- ✅ 文件读写明确指定 `encoding='utf-8'`
- ✅ 避免在Windows控制台输出emoji

---

### 案例5：使用Edit工具手动编辑大文件

**问题**：用Edit工具手动修改 `reading.ts` 中的数据，误删字段（如 `id`, `title`）

**后果**：TypeScript类型检查失败，数据不完整

**改进措施**：
- ✅ 大文件（>500行）不适合手动编辑，用脚本
- ✅ 必须手动编辑时，先 `git diff` 检查修改是否正确
- ✅ 编辑后立即运行 `tsc --noEmit` 验证

---

## ✅ 开发最佳实践

### 1. 代码复用原则

**问题**：重复编写相似的数据生成逻辑，代码冗余

**方案**：使用工厂函数/模板

```typescript
// 创建数据工厂函数
function createArticle(id: string, title: string, overrides = {}) {
  return {
    id,
    title,
    titleZh: `${title}（中文）`,
    difficulty: 'easy',
    topic: '通用',
    ...overrides,
  };
}

// 使用
const article1 = createArticle('p1-001', 'My Family', {
  article: '...',
  questions: [...],
});
```

**行动项**：
- 为每种题型创建数据生成模板函数
- 将常用的数据验证逻辑提取为独立函数
- 创建 `src/data/factories.ts` 集中管理数据生成逻辑

---

### 2. 备份策略

**必须执行**：
```bash
# 修改任何数据文件前
git add -A && git commit -m "backup before modifying XXX.ts"

# 或者创建时间戳备份
cp reading.ts reading.ts.backup.$(date +%Y%m%d_%H%M%S)
```

**原则**：
- Git提交是最可靠的备份
- 大批量修改前必须commit
- 修改后验证通过，再commit

---

### 3. 脚本安全编写规范

**模板**：
```python
import sys

def modify_file_safe(filepath, modification):
    """安全地修改文件"""
    # 1. 读取文件
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 2. 验证标记存在
    if 'UNIQUE_MARKER' not in content:
        raise ValueError("Marker not found!")
    
    # 3. 执行修改
    new_content = do_modification(content)
    
    # 4. 写入临时文件
    temp_path = filepath + '.temp'
    with open(temp_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    # 5. 验证（TypeScript类型检查）
    # ... 运行 tsc --noEmit ...
    
    # 6. 验证通过，替换原文件
    os.replace(temp_path, filepath)
    
    # 7. 验证失败，删除临时文件
    # os.remove(temp_path)
```

**原则**：
- 脚本必须包含错误处理和回滚机制
- 先写入临时文件，验证通过后再替换
- 修改后的文件必须立即运行 `tsc --noEmit` 验证

---

### 4. 增量开发+持续验证

**流程**：
```bash
# 添加数据时的标准流程
for i in {1..10}; do
  echo "Adding article $i..."
  
  # 1. 添加一篇文章
  node add_single_article.js $i
  
  # 2. 立即验证
  npx tsc --noEmit
  if [ $? -ne 0 ]; then
    echo "❌ TypeScript error after adding article $i"
    git restore src/data/reading.ts  # 回滚
    exit 1
  fi
  
  # 3. 验证通过，提交
  git add src/data/reading.ts
  git commit -m "Add article $i to Part 1"
done
```

**原则**：
- 每添加一篇数据就运行一次 `tsc --noEmit`
- 每完成一个小功能就commit一次
- 出现错误立即回滚，不要累积

---

### 5. 跨平台兼容性

**Python脚本规范**：
```python
# ❌ 避免
print(f"✅ 成功生成 {filename}")

# ✅ 推荐
print(f"[OK] Generated: {filename}")
print(f"[ERROR] Failed to ...")
```

**原则**：
- Python脚本输出使用ASCII字符或英文
- 文件读写明确指定 `encoding='utf-8'`
- 避免在Windows控制台输出emoji

---

## 📋 开发检查清单

在开始任何数据文件修改前，检查：

- [ ] 是否已经 `git commit` 当前状态？
- [ ] 是否创建了备份文件？
- [ ] 脚本是否包含错误处理？
- [ ] 是否计划增量验证（每修改一点就检查）？
- [ ] 是否考虑了跨平台兼容性？

---

## 🎯 未来改进方向

1. **自动化验证**：编写pre-commit hook，自动运行 `tsc --noEmit`
2. **数据生成工具**：开发专门的数据生成CLI工具，避免临时脚本
3. **单元测试**：为数据文件编写测试用例，验证数据完整性
4. **代码审查**：重要修改前，先进行代码审查

---

**最后更新**：2026-06-06  
**维护者**：开发团队
