---
name: ab-field-cleaner
description: 清理AB实验字段：当某个AB字段推全后，删除相关条件判断代码并生成变更报告
---

# AB字段清理工具

当AB实验字段推全（即该字段值固定为true）后，此技能帮助识别并清理代码中相关的条件判断逻辑，删除不再需要的代码分支，并生成变更总结文档。

## 适用场景

- AB实验字段已推全，需要清理代码中的条件判断
- 代码中存在大量if/else、三目运算符等基于AB字段的条件逻辑
- 需要生成清理后的代码变更报告

## 支持的语言和模式

### 编程语言
- JavaScript/TypeScript（包括React、Vue等前端框架）

### 识别模式
1. **if条件语句**
   ```javascript
   if (featureFlag) {
       // true分支代码
   } else {
       // false分支代码（需要删除）
   }
   ```

2. **三目运算符**
   ```javascript
   const value = featureFlag ? value1 : value2;
   // 当featureFlag为true时，简化为：const value = value1;
   ```

3. **配置对象属性**
   ```javascript
   const config = {
       feature: featureFlag ? 'new' : 'old'
   };
   ```

4. **逻辑与/或运算符**
   ```javascript
   const result = featureFlag && newFunction();
   // 当featureFlag为true时，简化为：const result = newFunction();
   ```

## 工作流程

### 阶段1：收集信息
1. **询问用户AB字段名称**
   - 需要清理的AB字段标识符（如：`newFeatureEnabled`, `enableV2UI`等）
   - 确认该字段已推全（值固定为true）

2. **询问项目路径**
   - 需要扫描的代码目录路径
   - 默认扫描当前目录

### 阶段2：代码扫描与分析
1. **查找所有相关文件**
   - 扫描指定目录下的`.js`, `.jsx`, `.ts`, `.tsx`文件
   - 使用grep或AST分析查找包含目标字段的文件

2. **识别条件判断模式**
   - 解析代码，识别包含目标字段的条件判断
   - 记录每个匹配的位置和类型

### 阶段3：代码清理
根据识别到的模式进行相应的清理：

#### 模式1：if语句清理
**原始代码：**
```javascript
if (featureFlag) {
    // true分支代码
} else {
    // false分支代码
}
```

**清理后：**
```javascript
// 删除整个if语句，只保留true分支代码
// true分支代码
```

**特殊情况：只有if没有else**
```javascript
if (featureFlag) {
    // 需要执行的代码
}
```
清理后删除整个if语句，保留代码块内容。

#### 模式2：三目运算符清理
**原始代码：**
```javascript
const value = featureFlag ? value1 : value2;
const result = featureFlag ? calculateNew() : calculateOld();
```

**清理后：**
```javascript
const value = value1;
const result = calculateNew();
```

#### 模式3：配置对象清理
**原始代码：**
```javascript
const config = {
    mode: featureFlag ? 'new' : 'old',
    version: featureFlag ? 2 : 1
};
```

**清理后：**
```javascript
const config = {
    mode: 'new',
    version: 2
};
```

#### 模式4：逻辑运算符清理
**原始代码：**
```javascript
const result = featureFlag && newFunction();
const value = featureFlag || defaultValue;
```

**清理后：**
```javascript
const result = newFunction();  // &&运算符，featureFlag为true时直接执行右侧
const value = true;  // ||运算符，featureFlag为true时结果为true
```

### 阶段4：生成变更报告
创建详细的变更总结文档，包含：

1. **概览信息**
   - 清理的AB字段名称
   - 扫描的文件数量
   - 发现的匹配数量
   - 清理的文件数量

2. **详细变更列表**
   - 每个文件的变更详情
   - 变更类型（if语句、三目运算符等）
   - 原始代码片段
   - 清理后代码片段
   - 文件路径和行号

3. **统计信息**
   - 各类模式的数量统计
   - 删除的代码行数估计
   - 简化后的代码复杂度变化

### 阶段5：代码验证
1. **语法检查**
   - 确保清理后的代码语法正确
   - 运行TypeScript类型检查（如果适用）

2. **测试运行**
   - 运行现有测试确保没有破坏功能
   - 特别关注与AB字段相关的测试用例

## 执行步骤

### 步骤1：初始化
```bash
# 确认当前工作目录
pwd

# 查找项目中的package.json确认项目类型
find . -name "package.json" -type f | head -5
```

### 步骤2：扫描代码
```bash
# 查找包含目标字段的JavaScript/TypeScript文件
find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | \
  xargs grep -l "featureFlag" 2>/dev/null | head -20
```

### 步骤3：分析代码模式
对于每个找到的文件，读取并分析内容：
```bash
# 查看文件内容，识别模式
cat filename.js | grep -n -B2 -A2 "featureFlag"
```

### 步骤4：执行清理
手动编辑文件，根据识别到的模式进行清理。使用编辑工具（如sed或直接文件编辑）：
```bash
# 示例：替换简单的三目运算符
sed -i '' "s/featureFlag ? \\([^:]*\\) : \\([^;]*\\)/\\1/g" filename.js
```

### 步骤5：生成报告
创建Markdown格式的变更报告：
```markdown
# AB字段清理报告

**字段名称**: featureFlag
**清理时间**: 2026-04-23
**项目路径**: /path/to/project

## 统计摘要
- 扫描文件数: 15
- 发现匹配数: 8
- 清理文件数: 5
- 删除代码行: ~12

## 详细变更

### 1. src/components/Button.js (第23行)
**类型**: if语句
**原始代码**:
```javascript
if (featureFlag) {
    return <NewButton />;
} else {
    return <OldButton />;
}
```

**清理后**:
```javascript
return <NewButton />;
```

### 2. src/utils/config.js (第45行)
**类型**: 三目运算符
**原始代码**:
```javascript
const apiUrl = featureFlag ? 'https://new.api.com' : 'https://old.api.com';
```

**清理后**:
```javascript
const apiUrl = 'https://new.api.com';
```

## 注意事项
1. 已删除所有featureFlag为false的代码分支
2. 建议删除featureFlag变量定义（如果不再使用）
3. 检查相关测试是否需要更新
```

## 注意事项

1. **谨慎操作**：清理前建议备份代码或使用版本控制
2. **代码审查**：清理后需要进行代码审查，确保逻辑正确
3. **测试验证**：必须运行测试验证功能完整性
4. **依赖检查**：检查是否有其他代码依赖被删除的分支
5. **配置更新**：更新相关配置文件，移除AB字段配置

## 高级功能（可选）

### AST分析
对于复杂代码，可以使用AST（抽象语法树）进行更精确的分析：
```javascript
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');
```

### 批量处理
支持批量处理多个AB字段：
```bash
# 清理多个字段
./clean-ab.sh --fields feature1,feature2,feature3 --path ./src
```

### 集成到CI/CD
将清理工具集成到持续集成流程：
```yaml
# GitHub Actions示例
- name: Clean AB fields
  run: |
    npm run clean-ab -- --field newFeature --path ./src
    git add .
    git commit -m "chore: clean AB field newFeature"
```

## 故障排除

### 常见问题
1. **语法错误**：清理后代码语法错误
   - 解决方案：仔细检查编辑后的代码，确保语法正确

2. **逻辑错误**：删除的分支包含重要逻辑
   - 解决方案：清理前仔细分析代码逻辑，确认删除安全

3. **类型错误**：TypeScript类型检查失败
   - 解决方案：更新类型定义，确保类型正确

### 回滚方案
如果清理出现问题，可以使用版本控制回滚：
```bash
# Git回滚
git checkout -- path/to/file.js
# 或
git reset --hard HEAD
```

## 学习与改进

每次清理后，记录学习经验：
- 遇到的特殊模式
- 有效的清理策略
- 需要避免的问题

将这些经验更新到本技能文档中，不断完善清理逻辑。