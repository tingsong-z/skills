#!/usr/bin/env node

/**
 * AB字段清理脚本（AST版本）
 * 使用Babel AST进行精确的代码分析和清理
 * 需要安装：npm install @babel/parser @babel/traverse @babel/generator @babel/types
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// 命令行参数
const args = process.argv.slice(2);
let targetField = '';
let targetPath = '.';
let dryRun = false;
let backup = true;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--field' && i + 1 < args.length) {
    targetField = args[i + 1];
    i++;
  } else if (args[i] === '--path' && i + 1 < args.length) {
    targetPath = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  } else if (args[i] === '--no-backup') {
    backup = false;
  } else if (args[i] === '--help') {
    printHelp();
    process.exit(0);
  }
}

if (!targetField) {
  console.error('错误：请指定要清理的AB字段名称');
  console.error('用法：node clean-ab-ast.js --field <字段名> [--path <目录路径>] [--dry-run] [--no-backup]');
  process.exit(1);
}

console.log(`AB字段清理工具 (AST版本)`);
console.log(`字段: ${targetField}`);
console.log(`目录: ${path.resolve(targetPath)}`);
console.log(`模式: ${dryRun ? '模拟运行（不修改文件）' : '实际清理'}`);
console.log(`备份: ${backup ? '启用' : '禁用'}`);
console.log('=' .repeat(50));

// 检查Babel依赖
try {
  require('@babel/parser');
  require('@babel/traverse');
  require('@babel/generator');
  require('@babel/types');
} catch (e) {
  console.error('错误：缺少Babel依赖');
  console.error('请安装: npm install @babel/parser @babel/traverse @babel/generator @babel/types');
  process.exit(1);
}

// 查找JavaScript/TypeScript文件
const jsFiles = findJsFiles(path.resolve(targetPath));
console.log(`找到 ${jsFiles.length} 个文件`);

// 处理每个文件
let totalChanges = 0;
let processedFiles = 0;

jsFiles.forEach(filePath => {
  const changes = processFile(filePath, targetField, dryRun, backup);
  if (changes > 0) {
    processedFiles++;
    totalChanges += changes;
    console.log(`  ${filePath}: ${changes} 处变更`);
  }
});

console.log('=' .repeat(50));
console.log(`清理完成！`);
console.log(`处理文件: ${processedFiles}/${jsFiles.length}`);
console.log(`总变更数: ${totalChanges}`);

if (dryRun) {
  console.log(`\n注意：这是模拟运行，文件未被修改`);
  console.log(`要实际清理，请移除 --dry-run 参数`);
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
        if (!['node_modules', '.git', 'dist', 'build', '.claude'].includes(item.name)) {
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

// 处理单个文件
function processFile(filePath, fieldName, dryRun, backup) {
  const code = fs.readFileSync(filePath, 'utf8');

  try {
    // 解析AST
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const changes = [];

    // 遍历AST，查找目标字段
    traverse(ast, {
      // 处理if语句
      IfStatement(path) {
        const test = path.node.test;
        if (isFieldReference(test, fieldName)) {
          // if (featureFlag) { ... }
          changes.push({
            type: 'if-true',
            node: path.node,
            location: path.node.loc
          });

          if (!dryRun) {
            // 替换为then分支的内容
            if (t.isBlockStatement(path.node.consequent)) {
              path.replaceWithMultiple(path.node.consequent.body);
            } else {
              path.replaceWith(path.node.consequent);
            }
          }
        } else if (isNegatedFieldReference(test, fieldName)) {
          // if (!featureFlag) { ... }
          changes.push({
            type: 'if-false',
            node: path.node,
            location: path.node.loc
          });

          if (!dryRun) {
            // 删除整个if语句（因为featureFlag为true，!featureFlag为false）
            path.remove();
          }
        }
      },

      // 处理条件表达式（三目运算符）
      ConditionalExpression(path) {
        const test = path.node.test;
        if (isFieldReference(test, fieldName)) {
          // featureFlag ? consequent : alternate
          changes.push({
            type: 'conditional',
            node: path.node,
            location: path.node.loc
          });

          if (!dryRun) {
            // 替换为consequent（true分支）
            path.replaceWith(path.node.consequent);
          }
        } else if (isNegatedFieldReference(test, fieldName)) {
          // !featureFlag ? consequent : alternate
          changes.push({
            type: 'conditional-negated',
            node: path.node,
            location: path.node.loc
          });

          if (!dryRun) {
            // 替换为alternate（false分支）
            path.replaceWith(path.node.alternate);
          }
        }
      },

      // 处理逻辑表达式
      LogicalExpression(path) {
        const { operator, left, right } = path.node;

        if (operator === '&&' && isFieldReference(left, fieldName)) {
          // featureFlag && expression
          changes.push({
            type: 'logical-and',
            node: path.node,
            location: path.node.loc
          });

          if (!dryRun) {
            // 替换为right表达式
            path.replaceWith(right);
          }
        } else if (operator === '||' && isFieldReference(left, fieldName)) {
          // featureFlag || expression
          changes.push({
            type: 'logical-or',
            node: path.node,
            location: path.node.loc
          });

          if (!dryRun) {
            // 替换为true（或适当的值）
            path.replaceWith(t.booleanLiteral(true));
          }
        }
      },

      // 处理变量声明中的条件表达式
      VariableDeclarator(path) {
        const init = path.node.init;
        if (t.isConditionalExpression(init)) {
          const test = init.test;
          if (isFieldReference(test, fieldName)) {
            changes.push({
              type: 'variable-conditional',
              node: init,
              location: init.loc
            });

            if (!dryRun) {
              path.node.init = init.consequent;
            }
          }
        }
      },

      // 处理对象属性中的条件表达式
      ObjectProperty(path) {
        const value = path.node.value;
        if (t.isConditionalExpression(value)) {
          const test = value.test;
          if (isFieldReference(test, fieldName)) {
            changes.push({
              type: 'property-conditional',
              node: value,
              location: value.loc
            });

            if (!dryRun) {
              path.node.value = value.consequent;
            }
          }
        }
      }
    });

    // 如果有变更且不是模拟运行，保存文件
    if (changes.length > 0 && !dryRun) {
      // 备份原文件
      if (backup) {
        fs.copyFileSync(filePath, `${filePath}.bak`);
      }

      // 生成新代码
      const output = generate(ast, {}, code);
      fs.writeFileSync(filePath, output.code, 'utf8');
    }

    return changes.length;

  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message);
    return 0;
  }
}

// 检查节点是否是对目标字段的引用
function isFieldReference(node, fieldName) {
  if (t.isIdentifier(node, { name: fieldName })) {
    return true;
  }

  // 检查成员表达式，如 obj.featureFlag
  if (t.isMemberExpression(node)) {
    const property = node.property;
    if (t.isIdentifier(property, { name: fieldName })) {
      return true;
    }
  }

  return false;
}

// 检查节点是否是对目标字段的否定引用
function isNegatedFieldReference(node, fieldName) {
  if (t.isUnaryExpression(node, { operator: '!' })) {
    return isFieldReference(node.argument, fieldName);
  }
  return false;
}

// 打印帮助信息
function printHelp() {
  console.log(`
AB字段清理工具 (AST版本)

使用Babel AST进行精确的代码分析和清理，支持：
- if语句清理
- 三目运算符清理
- 逻辑运算符清理
- 变量声明中的条件表达式
- 对象属性中的条件表达式

用法:
  node clean-ab-ast.js --field <字段名> [选项]

选项:
  --field <字段名>    要清理的AB字段名称（必需）
  --path <目录路径>   清理目录，默认为当前目录
  --dry-run          模拟运行，不实际修改文件
  --no-backup        不创建备份文件
  --help             显示此帮助信息

示例:
  # 模拟运行，查看变更
  node clean-ab-ast.js --field newFeature --path ./src --dry-run

  # 实际清理，创建备份
  node clean-ab-ast.js --field enableV2 --path ./src

  # 实际清理，不创建备份
  node clean-ab-ast.js --field experimental --path ./src --no-backup

注意事项:
1. 清理前建议使用 --dry-run 查看变更
2. 默认会创建 .bak 备份文件
3. 清理后请运行测试验证功能
4. 复杂代码可能需要手动调整清理结果
  `);
}