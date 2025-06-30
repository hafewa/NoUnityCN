export interface InformProps {
    /** Markdown 檔案名稱（不含副檔名） */
    filename: string;
    /** 公告顯示位置 */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    /** 主題顏色 */
    theme?: 'blue' | 'green' | 'red' | 'purple' | 'gray';
    /** 是否自動關閉 */
    autoClose?: boolean;
    /** 自動關閉延遲時間（毫秒） */
    autoCloseDelay?: number;
    /** 額外的 CSS 類名 */
    className?: string;
}

export interface InformComponent {
    (props: InformProps): JSX.Element | null;
}

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    typescript: {
        // 在生產構建期間忽略 TypeScript 錯誤（不推薦）
        // ignoreBuildErrors: false,
    },
    eslint: {
        // 在生產構建期間忽略 ESLint 錯誤（不推薦）
        // ignoreDuringBuilds: false,
    },
}

module.exports = nextConfig