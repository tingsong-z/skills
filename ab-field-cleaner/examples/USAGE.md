# AB字段清理使用示例

本示例展示如何使用AB字段清理技能清理代码中的条件判断逻辑。

## 场景描述

假设我们有一个AB字段 `newFeatureEnabled`，该字段已推全（值固定为true）。代码中有多处基于该字段的条件判断，需要清理。

## 清理前代码

查看 `before-cleanup.js` 文件，包含多种条件判断模式：

1. **if/else语句** - 完整的分支结构
2. **只有if的语句** - 条件执行某些代码
3. **三目运算符** - 条件赋值
4. **逻辑运算符** - && 和 || 运算
5. **配置对象** - 对象属性中的条件
6. **函数参数默认值** - 基于AB字段的默认值
7. **复杂嵌套条件** - 多层条件判断
8. **变量赋值中的条件** - 赋值时的三目运算
9. **数组成员条件** - 数组中的条件元素
10. **类方法中的条件** - 类方法内的条件逻辑
11. **导入使用** - 导入AB字段并在多处使用

## 清理步骤

### 步骤1: 扫描代码

```bash
# 在示例目录中运行扫描
cd /Users/xuyang/.claude/skills/ab-field-cleaner/examples
node ../scripts/scan-ab.js --field newFeatureEnabled --path . --output scan-report.md
```

扫描报告将显示所有包含 `newFeatureEnabled` 的代码位置。

### 步骤2: 分析扫描结果

查看 `scan-report.md`，了解需要清理的模式和位置。

### 步骤3: 执行清理

#### 方法A: 手动清理
根据扫描报告，手动编辑 `before-cleanup.js` 文件，应用以下清理规则：

1. **if/else语句** → 删除整个if结构，保留true分支
2. **三目运算符** → 替换为true分支值
3. **逻辑运算符** → 简化表达式
4. **配置对象** → 替换为固定值

#### 方法B: 自动清理（AST）
```bash
# 模拟运行查看变更
node ../scripts/clean-ab-ast.js --field newFeatureEnabled --path . --dry-run

# 实际清理（创建备份）
node ../scripts/clean-ab-ast.js --field newFeatureEnabled --path .
```

### 步骤4: 验证清理结果

清理后的代码应如 `after-cleanup.js` 所示。对比两个文件：

```bash
diff before-cleanup.js after-cleanup.js
```

### 步骤5: 生成清理报告

```bash
node ../scripts/generate-report.js --field newFeatureEnabled --scan scan-report.md --output cleanup-report.md
```

## 清理规则详解

### 规则1: if语句清理

**原始代码**:
```javascript
if (newFeatureEnabled) {
    return <NewComponent />;
} else {
    return <OldComponent />;
}
```

**清理后**:
```javascript
return <NewComponent />;
```

**说明**: 删除整个if结构，只保留true分支代码。

### 规则2: 三目运算符清理

**原始代码**:
```javascript
const API_URL = newFeatureEnabled ? 'https://api.new.com' : 'https://api.old.com';
```

**清理后**:
```javascript
const API_URL = 'https://api.new.com';
```

**说明**: 替换为true分支的值。

### 规则3: 逻辑运算符清理

**原始代码**:
```javascript
const isAllowed = newFeatureEnabled && user.hasPermission;
const shouldShow = newFeatureEnabled || forceShow;
```

**清理后**:
```javascript
const isAllowed = user.hasPermission;
const shouldShow = true; // 注意：可能需要根据业务逻辑调整
```

**说明**:
- `&&` 运算: 当左侧为true时，结果取决于右侧
- `||` 运算: 当左侧为true时，结果为true

### 规则4: 配置对象清理

**原始代码**:
```javascript
const appConfig = {
    theme: newFeatureEnabled ? 'dark' : 'light',
    features: {
        analytics: newFeatureEnabled ? 'v2' : 'v1'
    }
};
```

**清理后**:
```javascript
const appConfig = {
    theme: 'dark',
    features: {
        analytics: 'v2'
    }
};
```

**说明**: 对象属性中的条件表达式也需要清理。

## 特殊情况的处理

### 情况1: 只有if没有else

**原始代码**:
```javascript
if (newFeatureEnabled) {
    data = transformNewWay(data);
}
```

**清理后**:
```javascript
data = transformNewWay(data);
```

**说明**: 直接执行代码块内容。

### 情况2: 复杂的嵌套条件

**原始代码**:
```javascript
if (newFeatureEnabled) {
    if (user.premium) {
        return 'premium-new';
    } else {
        return 'standard-new';
    }
} else {
    return 'legacy';
}
```

**清理后**:
```javascript
if (user.premium) {
    return 'premium-new';
} else {
    return 'standard-new';
}
```

**说明**: 只删除外层条件，保留内层逻辑。

### 情况3: 数组成员条件

**原始代码**:
```javascript
const menuItems = [
    { label: 'Home', path: '/' },
    newFeatureEnabled ? { label: 'New Feature', path: '/new' } : null,
    { label: 'About', path: '/about' }
].filter(Boolean);
```

**清理后**:
```javascript
const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'New Feature', path: '/new' },
    { label: 'About', path: '/about' }
];
```

**说明**: 直接包含元素，移除条件和filter。

## 清理后的优化建议

1. **删除未使用的导入**: 如果AB字段只在此处使用，可以删除导入语句
2. **移除未使用的方法**: 如 `legacyAlgorithm` 如果不再需要
3. **简化逻辑**: 进一步简化清理后的代码
4. **更新类型定义**: 如果使用TypeScript，更新相关类型
5. **更新文档**: 更新代码注释和文档

## 验证清单

清理完成后，验证以下项目：

- [ ] 语法检查通过
- [ ] 代码逻辑正确
- [ ] 测试通过
- [ ] 功能正常
- [ ] 性能无退化

## 注意事项

1. **业务逻辑验证**: 确保清理后的逻辑符合业务需求
2. **边缘情况处理**: 检查边界条件和异常情况
3. **依赖关系**: 确保没有其他代码依赖被删除的分支
4. **配置更新**: 更新相关配置文件
5. **团队沟通**: 通知相关团队成员清理变更

## 扩展练习

尝试清理以下复杂场景：

1. **Promise链中的条件**:
   ```javascript
   fetchData()
     .then(data => newFeatureEnabled ? processNew(data) : processOld(data))
     .then(result => console.log(result));
   ```

2. **React组件中的条件**:
   ```javascript
   function MyComponent() {
     return (
       <div>
         {newFeatureEnabled ? <NewUI /> : <OldUI />}
         <button onClick={() => newFeatureEnabled ? handleNew() : handleOld()}>
           Click
         </button>
       </div>
     );
   }
   ```

3. **Redux reducer中的条件**:
   ```javascript
   function reducer(state, action) {
     switch (action.type) {
       case 'UPDATE':
         return {
           ...state,
           data: newFeatureEnabled ? transformNew(state.data) : transformOld(state.data)
         };
       default:
         return state;
     }
   }
   ```

通过这些练习，可以更好地掌握AB字段清理技能。