#!/usr/bin/env node

/**
 * AB字段清理脚本（模板）
 * 注意：这是一个模板脚本，实际清理需要根据具体代码结构进行调整
 * 建议先使用scan-ab.js扫描，然后手动清理代码
 */

const fs = require('fs');
const path = require('path');

console.log(`
===========================================
AB字段清理工具
===========================================

重要提示：
1. 此脚本为模板，实际清理需要根据代码结构手动进行
2. 清理前请确保已备份代码或使用版本控制（如Git）
3. 建议先使用scan-ab.js扫描并生成报告
4. 清理后务必运行测试验证功能

使用方法：
1. 运行扫描：node scripts/scan-ab.js --field <字段名> --path ./src --output scan.md
2. 查看报告：cat scan.md
3. 手动清理：根据报告中的匹配位置，手动编辑文件
4. 验证清理：运行测试确保功能正常

自动清理选项（高级）：
如需自动清理，需要安装Babel相关依赖并实现AST分析：
npm install @babel/parser @babel/traverse @babel/generator @babel/types

然后参考scripts/clean-ab-ast.js（如果存在）进行自动清理。
`);

// 检查是否有Babel依赖
try {
  require.resolve('@babel/parser');
  console.log('检测到Babel依赖，可以尝试自动清理');
  console.log('运行: node scripts/clean-ab-ast.js --field <字段名> --path ./src');
} catch (e) {
  console.log('未检测到Babel依赖，建议手动清理或安装依赖');
  console.log('安装命令: npm install @babel/parser @babel/traverse @babel/generator @babel/types');
}

// 提供手动清理指南
console.log(`
===========================================
手动清理指南
===========================================

根据扫描报告中的匹配类型，采用不同的清理策略：

1. if语句清理：
   - 查找模式: if (featureFlag) { ... } else { ... }
   - 清理方法: 删除整个if语句，只保留true分支代码
   - 注意: 如果只有if没有else，直接删除if保留代码块

2. 三目运算符清理：
   - 查找模式: featureFlag ? value1 : value2
   - 清理方法: 替换为value1
   - 注意: 检查value1的可用性，确保类型正确

3. 逻辑运算符清理：
   - 查找模式: featureFlag && expression
   - 清理方法: 替换为expression
   - 查找模式: featureFlag || defaultValue
   - 清理方法: 替换为true（或适当的值）

4. 配置对象清理：
   - 查找模式: { key: featureFlag ? value1 : value2 }
   - 清理方法: 替换为{ key: value1 }

清理步骤：
1. 打开报告中的每个文件
2. 定位到匹配的行号
3. 根据模式进行清理
4. 保存文件
5. 运行语法检查（如TypeScript编译）
6. 运行测试

安全建议：
- 一次清理一个文件，验证后再继续
- 清理后立即提交到版本控制
- 保留清理前的提交以便回滚
`);

// 如果提供了字段参数，显示具体清理命令
const args = process.argv.slice(2);
if (args.length > 0) {
  const fieldName = args[0];
  console.log(`
===========================================
针对字段 "${fieldName}" 的清理建议
===========================================

1. 首先扫描代码：
   node scripts/scan-ab.js --field ${fieldName} --path . --output ${fieldName}-scan.md

2. 查看扫描结果：
   cat ${fieldName}-scan.md

3. 手动清理示例命令（使用sed，谨慎使用）：
   # 替换简单的三目运算符（备份原文件）
   sed -i.bak "s/${fieldName} ? \\([^:]*\\) : \\([^;]*\\)/\\1/g" filename.js

   # 替换if语句（简单情况）
   sed -i.bak "/if.*${fieldName}.*{/,/^[[:space:]]*}/d" filename.js

   # 查看修改差异
   diff filename.js.bak filename.js

4. 验证清理：
   # 运行TypeScript检查（如果适用）
   npx tsc --noEmit

   # 运行测试
   npm test

警告：sed命令可能不准确，建议手动编辑确认！
`);
}