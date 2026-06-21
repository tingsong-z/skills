// 示例：清理AB字段后的代码
// AB字段名称：newFeatureEnabled（已推全，值固定为true）

// 1. if语句示例 - 清理后
function renderComponent() {
    return <NewComponent />;
}

// 2. 只有if没有else - 清理后
function processData(data) {
    data = transformNewWay(data);
    return data;
}

// 3. 三目运算符 - 清理后
const API_URL = 'https://api.new.com';
const TIMEOUT = 5000;

// 4. 逻辑运算符 - 清理后
const isAllowed = user.hasPermission; // && newFeatureEnabled 已移除
const shouldShow = true; // || newFeatureEnabled 已移除，注意：可能需要调整逻辑

// 5. 配置对象 - 清理后
const appConfig = {
    theme: 'dark',
    features: {
        analytics: 'v2',
        caching: true
    }
};

// 6. 函数参数默认值 - 清理后
function fetchData(options = {}) {
    const useCache = options.useCache !== undefined ? options.useCache : true; // newFeatureEnabled 替换为 true
    return apiCall({ ...options, useCache });
}

// 7. 复杂的嵌套条件 - 清理后
function getDisplayMode() {
    if (user.premium) {
        return 'premium-new';
    } else {
        return 'standard-new';
    }
}

// 8. 变量赋值中的条件 - 清理后
const featureSettings = loadNewSettings();

// 9. 数组成员中的条件 - 清理后
const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'New Feature', path: '/new' }, // 直接包含，不再有条件
    { label: 'About', path: '/about' }
];

// 10. 类方法中的条件 - 清理后
class DataProcessor {
    process(input) {
        return this.newAlgorithm(input);
    }

    newAlgorithm(data) {
        // 新算法实现
        return data.map(x => x * 2);
    }

    // legacyAlgorithm 方法可以删除，如果不再使用
    // legacyAlgorithm(data) {
    //     // 旧算法实现
    //     return data.map(x => x + 1);
    // }
}

// 11. 导入的条件使用 - 清理后
// 注意：如果newFeatureEnabled不再在其他地方使用，可以删除导入
// import { newFeatureEnabled } from './config';

export {
    renderComponent,
    API_URL,
    appConfig,
    getDisplayMode,
    DataProcessor
};