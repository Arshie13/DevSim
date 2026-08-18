import { orderedHostPorts } from './preview-port';

describe('orderedHostPorts', () => {
  it('ignores database-only ports when resolving a preview URL', () => {
    const ports = {
      '27017': 27017,
      '5432': 5432,
      '3000': 3000,
      '5173': 5173,
    };

    expect(orderedHostPorts(ports)).toEqual([5173, 3000]);
  });
});
