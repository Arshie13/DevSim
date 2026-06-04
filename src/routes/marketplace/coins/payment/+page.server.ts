import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

const PACKAGES: Record<string, { name: string, amount: number, price: string }> = {
  'starter': { name: 'Starter Pouch', amount: 500, price: '₱249.00' },
  'pro':     { name: 'Pro Hoard', amount: 2000, price: '₱749.00' },
  'elite':   { name: 'Elite Vault', amount: 5000, price: '₱1,499.00' },
  'omega':   { name: 'Omega Nexus', amount: 15000, price: '₱3,999.00' },
};

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, '/');
  }

  const packageId = event.url.searchParams.get('packageId');
  const amountParam = event.url.searchParams.get('amount');

  let product = null;

  if (packageId && PACKAGES[packageId]) {
    product = {
      id: packageId,
      ...PACKAGES[packageId]
    };
  } else if (amountParam) {
    const amount = parseInt(amountParam);
    if (!isNaN(amount) && amount >= 100) {
      product = {
        id: 'custom',
        name: 'Custom Data Injection',
        amount: amount,
        price: `₱${(amount * 0.50).toFixed(2)}`
      };
    }
  }

  if (!product) {
    throw redirect(303, '/marketplace/coins');
  }

  return {
    user: session.user,
    product
  };
};