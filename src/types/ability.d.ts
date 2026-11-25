import type { AppAbility } from '@/services/ability';

declare module 'vue' {
    interface ComponentCustomProperties {
        $ability: AppAbility;
        $can(this: this, ...args: Parameters<AppAbility['can']>): boolean;
    }
}

export {};
