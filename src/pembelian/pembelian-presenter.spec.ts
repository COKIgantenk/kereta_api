import { getStatusPemesanan } from './pembelian-presenter';

describe('getStatusPemesanan', () => {
  it.each([
    ['PENDING', 'BOOKED'],
    ['PAID', 'SUCCESS'],
    ['CANCELED', 'CANCELED'],
  ] as const)(
    'maps %s to %s for frontend ticket status',
    (status, expected) => {
      expect(getStatusPemesanan(status)).toBe(expected);
    },
  );
});
