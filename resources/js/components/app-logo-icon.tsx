import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLSpanElement>) {
    const { className = '', ...rest } = props;

    return (
        <span
            {...rest}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed  text-xs text-white dark:border-[#EAF2EC]/30 ${className}`.trim()}
        >
            §
        </span>
    );
}
