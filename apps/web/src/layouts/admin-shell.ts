/**
 * The admin shell ships as one lazily loaded chunk: public visitors never
 * download it, and the root + layout arrive together (no request waterfall).
 */
export { AdminRoot } from '@/components/admin/AdminRoot';
export { AdminLayout } from './AdminLayout';
