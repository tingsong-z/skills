#!/usr/bin/env node

/**
 * 生成AB字段清理报告
 * 可以结合扫描结果和手动清理记录生成详细报告
 */

const fs = require('fs');
const path = require('path');

// 命令行参数
const args = process.argv.slice(2);
let fieldName = '';
let scanFile = '';
let changesFile = '';
let outputFile = 'ab-cleanup-report.md';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--field' && i + 1 < args.length) {
    fieldName = args[i + 1];
    i++;
  } else if (args[i] === '--scan' && i + 1 < args.length) {
    scanFile = args[i + 1];
    i++;
  } else if (args[i] === '--changes' && i + 1 < args.length) {
    changesFile = args[i + 1];
    i++;
  } else if (args[i] === '--output' && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === '--help') {
    printHelp();
    process.exit(0);
  }
}

if (!fieldName) {
  console.error('错误：请指定AB字段名称');
  console.error('用法：node generate-report.js --field <字段名> [--scan <扫描文件>] [--changes <变更文件>] [--output <输出文件>]');
  process.exit(1);
}

console.log(`生成AB字段清理报告: ${fieldName}`);

// 生成报告
const report = generateReport(fieldName, scanFile, changesFile);
fs.writeFileSync(outputFile, report, 'utf8');

console.log(`报告已生成: ${outputFile}`);
console.log(`文件大小: ${report.length} 字符`);

// 生成报告内容
function generateReport(fieldName, scanFile, changesFile) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  let report = `# AB字段清理报告

**字段名称**: ${fieldName}
**生成时间**: ${dateStr} ${timeStr}
**报告版本**: 1.0

## 执行摘要

本报告总结了针对AB字段"${fieldName}"的代码清理工作。该字段已推全（值固定为true），相关条件判断代码已被清理。

`;

  // 如果有扫描文件，添加扫描结果摘要
  if (scanFile && fs.existsSync(scanFile)) {
    try {
      const scanContent = fs.readFileSync(scanFile, 'utf8');
      report += `## 扫描结果摘要

清理前扫描结果来自: ${scanFile}

${extractScanSummary(scanContent)}
`;
    } catch (error) {
      report += `## 扫描结果

注意：无法读取扫描文件 ${scanFile}: ${error.message}

`;
    }
  }

  // 如果有变更文件，添加变更详情
  if (changesFile && fs.existsSync(changesFile)) {
    try {
      const changesContent = fs.readFileSync(changesFile, 'utf8');
      report += `## 变更详情

详细变更记录来自: ${changesFile}

${changesContent}
`;
    } catch (error) {
      report += `## 变更详情

注意：无法读取变更文件 ${changesFile}: ${error.message}

`;
    }
  }

  // 添加手动清理记录部分
  report += `## 手动清理记录

如果您进行了手动清理，请在此记录详细变更：

### 文件1: [文件名]
**变更类型**: [if语句/三目运算符/逻辑运算符/配置对象]
**原始代码**:
\`\`\`javascript
// 清理前代码
\`\`\`

**清理后代码**:
\`\`\`javascript
// 清理后代码
\`\`\`

**影响分析**:
- [ ] 语法检查通过
- [ ] 类型检查通过（TypeScript）
- [ ] 测试通过
- [ ] 功能验证通过

---

`;

  // 添加清理模式参考
  report += `## 清理模式参考

### 1. if语句清理
\`\`\`javascript
// 清理前
if (${fieldName}) {
    // true分支代码
} else {
    // false分支代码
}

// 清理后
// true分支代码
\`\`\`

### 2. 三目运算符清理
\`\`\`javascript
// 清理前
const value = ${fieldName} ? value1 : value2;
const result = ${fieldName} ? calculateNew() : calculateOld();

// 清理后
const value = value1;
const result = calculateNew();
\`\`\`

### 3. 逻辑运算符清理
\`\`\`javascript
// 清理前
const enabled = ${fieldName} && checkPermission();
const mode = ${fieldName} || 'default';

// 清理后
const enabled = checkPermission();
const mode = true; // 或适当的默认值
\`\`\`

### 4. 配置对象清理
\`\`\`javascript
// 清理前
const config = {
    api: ${fieldName} ? '/api/v2' : '/api/v1',
    timeout: ${fieldName} ? 5000 : 3000
};

// 清理后
const config = {
    api: '/api/v2',
    timeout: 5000
};
\`\`\`

`;

  // 添加验证清单
  report += `## 验证清单

清理完成后，请完成以下验证：

### 代码质量
- [ ] 所有清理后的文件语法正确
- [ ] TypeScript编译无错误（如果适用）
- [ ] 无未使用的变量或导入
- [ ] 代码格式符合项目规范

### 功能验证
- [ ] 运行所有单元测试并通过
- [ ] 运行集成测试（如果存在）
- [ ] 手动测试核心功能
- [ ] 验证边缘情况处理

### 依赖检查
- [ ] 检查是否有其他代码依赖被删除的分支
- [ ] 更新相关配置文件
- [ ] 移除AB字段的相关配置项
- [ ] 更新文档中的AB字段说明

### 版本控制
- [ ] 提交清理变更到版本控制
- [ ] 编写清晰的提交信息
- [ ] 创建标签或分支（如果需要）
- [ ] 通知相关团队成员

`;

  // 添加后续步骤
  report += `## 后续步骤

### 短期（1-2天）
1. 完成所有验证清单项目
2. 部署到测试环境进行验证
3. 收集测试环境反馈
4. 修复发现的问题

### 中期（1周）
1. 部署到生产环境
2. 监控生产环境指标
3. 确认无回归问题
4. 清理AB字段配置数据

### 长期（1个月）
1. 完全移除AB字段相关代码
2. 删除AB字段配置项
3. 更新架构文档
4. 总结清理经验

`;

  // 添加风险与缓解
  report += `## 风险与缓解措施

### 高风险
1. **功能回归**
   - 缓解：全面测试，特别是边缘情况
   - 缓解：分阶段部署，先小范围验证

2. **性能影响**
   - 缓解：性能测试对比
   - 缓解：监控关键指标

### 中风险
1. **代码逻辑错误**
   - 缓解：代码审查，特别是复杂逻辑
   - 缓解：静态分析工具检查

2. **依赖问题**
   - 缓解：检查所有依赖关系
   - 缓解：更新相关文档

### 低风险
1. **配置不一致**
   - 缓解：统一检查所有配置文件
   - 缓解：自动化配置验证

`;

  // 添加联系人信息
  report += `## 联系与支持

如有问题或需要支持，请联系：

- **技术负责人**: [姓名]
- **产品负责人**: [姓名]
- **测试负责人**: [姓名]
- **运维负责人**: [姓名]

## 文档历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | ${dateStr} | 系统生成 | 初始版本 |

---

*报告生成工具: AB字段清理技能 v1.0*
*生成时间: ${dateStr} ${timeStr}*
`;

  return report;
}

// 从扫描文件中提取摘要
function extractScanSummary(scanContent) {
  // 简单的文本提取
  const lines = scanContent.split('\n');
  let summary = '';

  // 查找统计信息
  let inStats = false;
  for (const line of lines) {
    if (line.includes('统计摘要') || line.includes('## 统计')) {
      inStats = true;
    } else if (inStats && line.startsWith('## ')) {
      break;
    } else if (inStats && line.trim()) {
      summary += line + '\n';
    }
  }

  if (!summary) {
    summary = '无法提取扫描统计信息，请查看原始扫描文件。\n';
  }

  return summary;
}

// 打印帮助信息
function printHelp() {
  console.log(`
AB字段清理报告生成工具

根据扫描结果和清理记录生成详细的清理报告。

用法:
  node generate-report.js --field <字段名> [选项]

选项:
  --field <字段名>     AB字段名称（必需）
  --scan <文件>        扫描结果文件（scan-ab.js输出）
  --changes <文件>     变更记录文件
  --output <文件>      输出报告文件，默认为 ab-cleanup-report.md
  --help              显示此帮助信息

示例:
  # 生成基本报告
  node generate-report.js --field newFeature --output report.md

  # 包含扫描结果的报告
  node generate-report.js --field enableV2 --scan scan-result.md --output full-report.md

  # 包含扫描和变更记录的报告
  node generate-report.js --field experimental --scan scan.md --changes changes.txt --output final-report.md

报告内容:
  1. 执行摘要
  2. 扫描结果摘要（如果提供）
  3. 变更详情（如果提供）
  4. 手动清理记录模板
  5. 清理模式参考
  6. 验证清单
  7. 后续步骤
  8. 风险与缓解
  9. 联系信息
  `);
}