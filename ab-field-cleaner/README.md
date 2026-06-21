# AB字段清理技能

当AB实验字段推全（值固定为true）后，此技能帮助识别并清理代码中相关的条件判断逻辑，删除不再需要的代码分支，并生成变更总结文档。

## 功能特性

- **智能识别**: 支持多种AB字段条件判断模式
  - if/else语句
  - 三目运算符
  - 逻辑运算符（&&, ||）
  - 配置对象属性
- **安全清理**: 提供模拟运行、备份等安全选项
- **详细报告**: 生成完整的清理报告和验证清单
- **多语言支持**: 专注于JavaScript/TypeScript项目

## 快速开始

### 1. 安装依赖（可选）

```bash
cd /path/to/your/project
npm install @babel/parser @babel/traverse @babel/generator @babel/types
```

### 2. 扫描AB字段

```bash
# 使用脚本扫描
node scripts/scan-ab.js --field newFeature --path ./src --output scan-report.md

# 或手动扫描
find ./src -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | \
  xargs grep -l "newFeature" 2>/dev/null
```

### 3. 查看扫描结果

```bash
cat scan-report.md
```

### 4. 清理代码

#### 选项A: 手动清理（推荐）
根据扫描报告，手动编辑文件清理AB字段。

#### 选项B: 自动清理（AST版本）
```bash
# 模拟运行，查看变更
node scripts/clean-ab-ast.js --field newFeature --path ./src --dry-run

# 实际清理（创建备份）
node scripts/clean-ab-ast.js --field newFeature --path ./src
```

#### 选项C: 简单自动清理
```bash
# 使用简单替换（谨慎使用）
node scripts/clean-ab.js newFeature
```

### 5. 生成清理报告

```bash
node scripts/generate-report.js --field newFeature --scan scan-report.md --output cleanup-report.md
```

## 使用Claude Code技能

在Claude Code中，当需要清理AB字段时：

1. 激活技能: `/ab-field-cleaner` 或提及"清理AB字段"
2. 提供信息:
   - AB字段名称
   - 项目路径
   - 清理范围
3. 按照技能指导执行清理步骤

## 技能工作流程

### 阶段1: 信息收集
1. 确认AB字段名称和状态（已推全）
2. 确定项目路径和文件范围
3. 选择清理策略（手动/自动）

### 阶段2: 代码扫描
1. 查找包含目标字段的文件
2. 识别条件判断模式
3. 生成扫描报告

### 阶段3: 代码清理
根据模式进行清理：
- **if语句**: 删除整个if结构，保留true分支
- **三目运算符**: 替换为true分支值
- **逻辑运算符**: 简化表达式
- **配置对象**: 替换为固定值

### 阶段4: 验证与报告
1. 语法和类型检查
2. 测试运行
3. 生成详细清理报告
4. 更新相关文档

## 文件结构

```
ab-field-cleaner/
├── SKILL.md                 # 技能主文档
├── README.md               # 说明文档
├── package.json           # 依赖配置
└── scripts/               # 工具脚本
    ├── scan-ab.js        # 扫描脚本
    ├── clean-ab.js       # 清理脚本（模板）
    ├── clean-ab-ast.js   # AST清理脚本
    └── generate-report.js # 报告生成脚本
```

## 支持的模式示例

### 1. if语句清理
```javascript
// 清理前
if (featureFlag) {
    return <NewComponent />;
} else {
    return <OldComponent />;
}

// 清理后
return <NewComponent />;
```

### 2. 三目运算符清理
```javascript
// 清理前
const apiUrl = featureFlag ? '/api/v2' : '/api/v1';

// 清理后
const apiUrl = '/api/v2';
```

### 3. 逻辑运算符清理
```javascript
// 清理前
const isEnabled = featureFlag && user.hasPermission;

// 清理后
const isEnabled = user.hasPermission;
```

### 4. 配置对象清理
```javascript
// 清理前
const config = {
    theme: featureFlag ? 'dark' : 'light',
    version: featureFlag ? 2 : 1
};

// 清理后
const config = {
    theme: 'dark',
    version: 2
};
```

## 安全建议

1. **版本控制**: 清理前确保代码已提交到Git
2. **备份**: 使用脚本的备份功能或手动备份
3. **分步进行**: 一次清理一个文件，验证后再继续
4. **测试验证**: 清理后立即运行测试
5. **代码审查**: 复杂清理建议进行代码审查

## 故障排除

### 常见问题

1. **语法错误清理后**
   - 原因: 自动清理可能破坏代码结构
   - 解决: 手动修复或恢复备份

2. **TypeScript类型错误**
   - 原因: 类型不匹配
   - 解决: 更新类型定义或添加类型断言

3. **逻辑错误**
   - 原因: 删除的分支包含重要逻辑
   - 解决: 仔细分析代码，必要时保留部分逻辑

### 回滚方案

```bash
# 使用Git回滚
git checkout -- path/to/file.js

# 使用备份文件
cp file.js.bak file.js

# 重置所有更改
git reset --hard HEAD
```

## 高级用法

### 批量处理多个字段

```bash
# 创建处理脚本
#!/bin/bash
FIELDS="feature1 feature2 feature3"
for FIELD in $FIELDS; do
    echo "处理字段: $FIELD"
    node scripts/scan-ab.js --field $FIELD --path ./src --output scan-$FIELD.md
    # 手动清理后
    node scripts/generate-report.js --field $FIELD --scan scan-$FIELD.md --output report-$FIELD.md
done
```

### 集成到CI/CD

```yaml
# GitHub Actions示例
name: Clean AB Fields
on:
  workflow_dispatch:
    inputs:
      field:
        description: 'AB字段名称'
        required: true

jobs:
  clean:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Scan AB field
        run: node scripts/scan-ab.js --field ${{ github.event.inputs.field }} --path ./src --output scan.md
      - name: Generate report
        run: node scripts/generate-report.js --field ${{ github.event.inputs.field }} --scan scan.md --output report.md
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: ab-cleanup-report
          path: report.md
```

## 贡献与反馈

如有问题或改进建议：

1. 检查现有文档和示例
2. 提交Issue描述问题
3. 提供复现步骤和代码示例
4. 建议改进方案

## 许可证

MIT License - 详见LICENSE文件

---

**注意**: 此技能工具旨在辅助代码清理，实际清理前请确保理解代码逻辑并做好备份。对于重要项目，建议在测试环境验证后再应用到生产环境。