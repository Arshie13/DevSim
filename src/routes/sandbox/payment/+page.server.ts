import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

const SANDBOX_PRICE_CENTAVOS = 19900;

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, '/');
  }

  return {
    user: session.user,
    product: {
      name: 'Sandbox Access',
      price: '₱199.00',
      centavos: SANDBOX_PRICE_CENTAVOS,
    }
  };
};
