import 'vue-router';
import type { AppAction, AppSubject } from '@/services/ability';

declare module 'vue-router' {
    interface RouteMeta {
        requireAuth?: boolean;
        redirectIfAuth?: boolean;
        action?: AppAction;
        subject?: AppSubject;
        abilities?: Array<{ action: AppAction; subject: AppSubject }>;
    }
}

export {};
