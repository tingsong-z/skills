// 示例：包含AB字段条件判断的代码
// AB字段名称：newFeatureEnabled

// 1. if语句示例
function renderComponent() {
    if (newFeatureEnabled) {
        return <NewComponent />;
    } else {
        return <OldComponent />;
    }
}

// 2. 只有if没有else
function processData(data) {
    if (newFeatureEnabled) {
        data = transformNewWay(data);
    }
    return data;
}

// 3. 三目运算符
const API_URL = newFeatureEnabled ? 'https://api.new.com' : 'https://api.old.com';
const TIMEOUT = newFeatureEnabled ? 5000 : 3000;

// 4. 逻辑运算符
const isAllowed = newFeatureEnabled && user.hasPermission;
const shouldShow = newFeatureEnabled || forceShow;

// 5. 配置对象
const appConfig = {
    theme: newFeatureEnabled ? 'dark' : 'light',
    features: {
        analytics: newFeatureEnabled ? 'v2' : 'v1',
        caching: newFeatureEnabled ? true : false
    }
};

// 6. 函数参数默认值
function fetchData(options = {}) {
    const useCache = options.useCache !== undefined ? options.useCache : newFeatureEnabled;
    return apiCall({ ...options, useCache });
}

// 7. 复杂的嵌套条件
function getDisplayMode() {
    if (newFeatureEnabled) {
        if (user.premium) {
            return 'premium-new';
        } else {
            return 'standard-new';
        }
    } else {
        return 'legacy';
    }
}

// 8. 变量赋值中的条件
const featureSettings = newFeatureEnabled
    ? loadNewSettings()
    : loadLegacySettings();

// 9. 数组成员中的条件
const menuItems = [
    { label: 'Home', path: '/' },
    newFeatureEnabled ? { label: 'New Feature', path: '/new' } : null,
    { label: 'About', path: '/about' }
].filter(Boolean);

// 10. 类方法中的条件
class DataProcessor {
    process(input) {
        if (newFeatureEnabled) {
            return this.newAlgorithm(input);
        } else {
            return this.legacyAlgorithm(input);
        }
    }

    newAlgorithm(data) {
        // 新算法实现
        return data.map(x => x * 2);
    }

    legacyAlgorithm(data) {
        // 旧算法实现
        return data.map(x => x + 1);
    }
}

// 11. 导入的条件使用
import { newFeatureEnabled } from './config';

export {
    renderComponent,
    API_URL,
    appConfig,
    getDisplayMode,
    DataProcessor
};