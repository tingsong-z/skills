#!/usr/bin/env node

/**
 * AB字段扫描脚本
 * 扫描指定目录下的JavaScript/TypeScript文件，查找包含指定AB字段的代码
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 命令行参数解析
const args = process.argv.slice(2);
let targetField = '';
let targetPath = '.';
let outputFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--field' && i + 1 < args.length) {
    targetField = args[i + 1];
    i++;
  } else if (args[i] === '--path' && i + 1 < args.length) {
    targetPath = args[i + 1];
    i++;
  } else if (args[i] === '--output' && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  } else if (args[i] === '--help') {
    printHelp();
    process.exit(0);
  }
}

if (!targetField) {
  console.error('错误：请指定要扫描的AB字段名称');
  console.error('用法：node scan-ab.js --field <字段名> [--path <目录路径>] [--output <输出文件>]');
  process.exit(1);
}

// 解析目标路径
const absolutePath = path.resolve(targetPath);
if (!fs.existsSync(absolutePath)) {
  console.error(`错误：路径不存在 ${absolutePath}`);
  process.exit(1);
}

console.log(`开始扫描AB字段: ${targetField}`);
console.log(`扫描目录: ${absolutePath}`);

// 查找JavaScript/TypeScript文件
const jsFiles = findJsFiles(absolutePath);
console.log(`找到 ${jsFiles.length} 个JavaScript/TypeScript文件`);

// 扫描每个文件
const matches = [];
jsFiles.forEach(file => {
  const fileMatches = scanFile(file, targetField);
  if (fileMatches.length > 0) {
    matches.push({
      file,
      relativePath: path.relative(absolutePath, file),
      matches: fileMatches
    });
  }
});

console.log(`\n扫描完成！`);
console.log(`在 ${matches.length} 个文件中找到 ${matches.reduce((sum, m) => sum + m.matches.length, 0)} 个匹配`);

// 输出结果
if (outputFile) {
  const report = generateReport(matches, targetField, absolutePath);
  fs.writeFileSync(outputFile, report, 'utf8');
  console.log(`报告已保存到: ${outputFile}`);
} else {
  printMatches(matches);
}

// 打印帮助信息
function printHelp() {
  console.log(`
AB字段扫描工具

用法:
  node scan-ab.js --field <字段名> [选项]

选项:
  --field <字段名>    要扫描的AB字段名称（必需）
  --path <目录路径>   扫描目录，默认为当前目录
  --output <文件>     输出报告文件路径
  --help             显示此帮助信息

示例:
  node scan-ab.js --field newFeature --path ./src
  node scan-ab.js --field enableV2 --path ./src --output scan-report.md
  `);
}

// 查找JavaScript/TypeScript文件
function findJsFiles(dir) {
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);

      if (item.isDirectory()) {
        // 跳过node_modules等目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(item.name)) {
          traverse(fullPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

// 扫描单个文件
function scanFile(filePath, fieldName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const matches = [];

  // 简单的正则匹配（可以扩展为更复杂的AST分析）
  const patterns = [
    // if语句
    new RegExp(`if\\s*\\(\\s*${fieldName}\\s*\\)`, 'g'),
    new RegExp(`if\\s*\\(\\s*!\\s*${fieldName}\\s*\\)`, 'g'),
    // 三目运算符
    new RegExp(`${fieldName}\\s*\\?`, 'g'),
    // 逻辑运算符
    new RegExp(`${fieldName}\\s*&&`, 'g'),
    new RegExp(`${fieldName}\\s*\\|\\|`, 'g'),
    // 配置对象
    new RegExp(`:\\s*${fieldName}\\s*\\?`, 'g'),
  ];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let found = false;
    let patternType = '';

    // 检查每个模式
    if (patterns[0].test(line) || patterns[1].test(line)) {
      found = true;
      patternType = 'if语句';
    } else if (patterns[2].test(line)) {
      found = true;
      patternType = '三目运算符';
    } else if (patterns[3].test(line) || patterns[4].test(line)) {
      found = true;
      patternType = '逻辑运算符';
    } else if (patterns[5].test(line)) {
      found = true;
      patternType = '配置对象';
    }

    // 简单的字符串包含（备用）
    if (!found && line.includes(fieldName)) {
      found = true;
      patternType = '其他引用';
    }

    if (found) {
      matches.push({
        line: lineNumber,
        content: line.trim(),
        type: patternType
      });
    }
  });

  return matches;
}

// 打印匹配结果
function printMatches(matches) {
  matches.forEach(fileMatch => {
    console.log(`\n文件: ${fileMatch.relativePath}`);
    fileMatch.matches.forEach(match => {
      console.log(`  [${match.type}] 第${match.line}行: ${match.content.substring(0, 80)}${match.content.length > 80 ? '...' : ''}`);
    });
  });
}

// 生成报告
function generateReport(matches, fieldName, basePath) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  let report = `# AB字段扫描报告

**字段名称**: ${fieldName}
**扫描时间**: ${dateStr} ${timeStr}
**扫描目录**: ${basePath}

## 统计摘要
- 扫描文件总数: ${matches.reduce((sum, m) => sum + m.matches.length, 0)}
- 发现匹配文件数: ${matches.length}
- 总匹配数量: ${matches.reduce((sum, m) => sum + m.matches.length, 0)}

## 详细匹配列表
`;

  matches.forEach(fileMatch => {
    report += `\n### ${fileMatch.relativePath}\n`;
    fileMatch.matches.forEach(match => {
      report += `- **第${match.line}行** (${match.type}): \`${escapeMarkdown(match.content)}\`\n`;
    });
  });

  report += `
## 模式统计
`;

  const typeStats = {};
  matches.forEach(fileMatch => {
    fileMatch.matches.forEach(match => {
      typeStats[match.type] = (typeStats[match.type] || 0) + 1;
    });
  });

  Object.entries(typeStats).forEach(([type, count]) => {
    report += `- ${type}: ${count} 处\n`;
  });

  report += `
## 后续步骤建议

1. **代码清理**: 如果该AB字段已推全（值固定为true），可以清理相关条件判断
2. **手动检查**: 仔细检查每个匹配，确认清理安全性
3. **测试验证**: 清理后运行测试确保功能正常
4. **文档更新**: 更新相关文档，移除AB字段说明

## 清理模式示例

### if语句清理
\`\`\`javascript
// 清理前
if (${fieldName}) {
    // true分支
} else {
    // false分支（删除）
}

// 清理后
// true分支
\`\`\`

### 三目运算符清理
\`\`\`javascript
// 清理前
const value = ${fieldName} ? value1 : value2;

// 清理后
const value = value1;
\`\`\`
`;

  return report;
}

// 转义Markdown特殊字符
function escapeMarkdown(text) {
  return text.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
}