import { helper } from '@ember/component/helper';

export function formatDateTime([date]) {
  return date
    ? (new Date(date)).toLocaleString('fr-FR', { timeZone: 'UTC' }).replace(',', '')
    : date;
}

export default helper(formatDateTime);
