import { page } from '../config/page';

export function oldValue(name, fallback = '') {
    return page.old?.[name] ?? fallback ?? '';
}
