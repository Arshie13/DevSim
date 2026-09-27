import type { CheatsheetStack } from '$types/cheatsheets';

const TESTS_BASE =
	'submodules/projects/tech-stacks/nextjs-postgres-prisma/scenario-1/pos-system/tests';

/**
 * Cheatsheet content for the `nextjs-postgres-prisma` stack.
 *
 * v1 authors `scenario-1` (POS System) end to end. Scenarios 2 and 3 and the
 * tutorial are scaffolded with their level titles so the UI can show progress;
 * their tasks are backfilled in follow-up content-only changes.
 *
 * Every snippet is derived from the `// Candidate creates:` contract at the top
 * of the matching test file, and keeps the exact assertions that file makes.
 */
export const nextjsPostgresPrismaCheatsheet: CheatsheetStack = {
	name: 'nextjs-postgres-prisma',
	label: 'Next.js + PostgreSQL + Prisma',
	description:
		'A Next.js App Router POS system backed by PostgreSQL and Prisma. Tasks cover a peso-formatting helper, server actions for inventory and cart maths, React checkout components, coupon selection and sales reporting.',
	scenarios: [
		{
			ref: 'scenario-1',
			folder: 'pos-system',
			name: 'POS System',
			description:
				'Build a point-of-sale system for tracking inventory, managing sales, and applying coupons and discounts.',
			totalTasks: 10,
			levels: [
				{
					order: 1,
					title: 'Getting Familiar with the Codebase',
					tasks: [
						{
							level: 1,
							task: 1,
							title: 'Prepare Development Environment',
							summary:
								'Install dependencies, point the app at your own PostgreSQL database, then generate the Prisma client, apply migrations and seed sample data.',
							targetFiles: ['.env'],
							steps: [
								'Install dependencies with `pnpm install`.',
								'Copy `.env.example` to `.env` and set `DATABASE_URL` to your own PostgreSQL connection string.',
								'Generate the Prisma client.',
								'Apply the existing migrations.',
								'Seed the sample data the UI expects.'
							],
							snippets: [
								{
									label: 'Point the app at your database',
									language: 'env',
									filename: '.env',
									code: 'DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/pos_system?schema=public"',
									note: 'The grader never reads your password. It runs your own environment and asserts the migration and seed actually worked.'
								},
								{
									label: 'Run the full setup sequence',
									language: 'bash',
									code: 'pnpm install\npnpm exec prisma generate\npnpm exec prisma migrate deploy\npnpm prisma:seed'
								}
							],
							testLabel: 'Level 1 Task 1: Environment Setup',
							testPath: `${TESTS_BASE}/level-1/task-1/setup-check.test.tsx`
						},
						{
							level: 1,
							task: 2,
							title: 'Add Peso Formatting Helper',
							summary:
								'Export a pure `formatPeso(amount)` helper that prefixes the peso sign and always shows exactly two decimals.',
							targetFiles: ['src/lib/format.ts'],
							snippets: [
								{
									label: 'Create the helper',
									language: 'ts',
									filename: 'src/lib/format.ts',
									code:
										'/**\n * Formats a number as Philippine pesos with exactly two decimals.\n */\nexport function formatPeso(amount: number): string {\n  return `\u20b1${amount.toFixed(2)}`;\n}',
									note: '`toFixed(2)` is the whole implementation — it covers rounding and the two-decimal rule, including `9.999` → `\u20b110.00`.'
								}
							],
							testLabel: 'L1T2: formatPeso',
							testPath: `${TESTS_BASE}/level-1/task-2/format.test.tsx`
						}
					]
				},
				{
					order: 2,
					title: 'Inventory Quality',
					tasks: [
						{
							level: 2,
							task: 1,
							title: 'Stock Status Server Action',
							summary:
								'Export an async server action that reads a product by id from Prisma and classifies it as OUT_OF_STOCK, LOW_STOCK or IN_STOCK.',
							targetFiles: ['src/lib/actions/inventory.ts'],
							snippets: [
								{
									label: 'Create the server action',
									language: 'ts',
									filename: 'src/lib/actions/inventory.ts',
									code:
										"import { prisma } from '@/lib/prisma';\n\nexport type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';\n\nexport interface StockStatusResult {\n  productId: string;\n  quantity: number;\n  status: StockStatus;\n}\n\nexport async function getStockStatusForProduct(\n  productId: string,\n): Promise<StockStatusResult> {\n  const product = await prisma.product.findUnique({\n    where: { product_id: productId },\n  });\n\n  if (!product) {\n    throw new Error(`Product not found: ${productId}`);\n  }\n\n  const quantity = product.quantity;\n  const status: StockStatus =\n    quantity <= 0 ? 'OUT_OF_STOCK' : quantity <= 5 ? 'LOW_STOCK' : 'IN_STOCK';\n\n  return { productId: product.product_id, quantity, status };\n}",
									note: 'The classifier is `<= 0` → OUT_OF_STOCK, `1–5` → LOW_STOCK, `> 5` → IN_STOCK. A missing product must throw.'
								}
							],
							testLabel: 'L2T1: getStockStatusForProduct (server action)',
							testPath: `${TESTS_BASE}/level-2/task-1/stock-status.test.tsx`
						},
						{
							level: 2,
							task: 2,
							title: 'Cart Totals Server Action',
							summary:
								'Export an async server action that looks up product prices and returns the cart subtotal, percentage discount and total, rounded to two decimals.',
							targetFiles: ['src/lib/actions/cart.ts'],
							snippets: [
								{
									label: 'Create the server action',
									language: 'ts',
									filename: 'src/lib/actions/cart.ts',
									code:
										"import { prisma } from '@/lib/prisma';\n\nexport interface CartItemInput {\n  product_id: string;\n  cartQuantity: number;\n}\n\nexport interface CartTotals {\n  subtotal: number;\n  discount: number;\n  total: number;\n}\n\nconst round2 = (value: number) => Math.round(value * 100) / 100;\n\nexport async function getCartTotals(input: {\n  items: CartItemInput[];\n  discountPercent?: number;\n}): Promise<CartTotals> {\n  const { items, discountPercent = 0 } = input;\n\n  // Short-circuit: an empty cart must not query Prisma at all.\n  if (items.length === 0) {\n    return { subtotal: 0, discount: 0, total: 0 };\n  }\n\n  const products = await prisma.product.findMany({\n    where: { product_id: { in: items.map((item) => item.product_id) } },\n  });\n\n  const prices = new Map(products.map((p) => [p.product_id, p.price]));\n\n  const subtotal = round2(\n    items.reduce(\n      (sum, item) => sum + (prices.get(item.product_id) ?? 0) * item.cartQuantity,\n      0,\n    ),\n  );\n  const discount = round2(subtotal * (discountPercent / 100));\n\n  return { subtotal, discount, total: round2(subtotal - discount) };\n}",
									note: 'Prices come from the database, never from the caller. Returning early for an empty cart is asserted by the test.'
								}
							],
							testLabel: 'L2T2: getCartTotals (server action)',
							testPath: `${TESTS_BASE}/level-2/task-2/cart-totals.test.tsx`
						}
					]
				},
				{
					order: 3,
					title: 'Checkout Integrity',
					tasks: [
						{
							level: 3,
							task: 1,
							title: 'Checkout Errors Banner Component',
							summary:
								'Default-export a React component that shows a `role="status"` confirmation when there are no errors, and a `role="alert"` list with one item per error otherwise.',
							targetFiles: ['src/components/CheckoutErrors.tsx'],
							snippets: [
								{
									label: 'Create the component',
									language: 'tsx',
									filename: 'src/components/CheckoutErrors.tsx',
									code:
										"interface CheckoutErrorsProps {\n  errors: string[];\n}\n\nexport default function CheckoutErrors({ errors }: CheckoutErrorsProps) {\n  if (errors.length === 0) {\n    return (\n      <p role=\"status\" className=\"checkout-ok\">\n        Ready to checkout\n      </p>\n    );\n  }\n\n  return (\n    <div role=\"alert\" className=\"checkout-errors\">\n      <ul>\n        {errors.map((error) => (\n          <li key={error}>{error}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}"
								}
							],
							testLabel: 'L3T1: <CheckoutErrors />',
							testPath: `${TESTS_BASE}/level-3/task-1/validate-checkout.test.tsx`
						},
						{
							level: 3,
							task: 2,
							title: 'Order Summary Component',
							summary:
								'Default-export an order summary that renders the customer name, one row per item with a peso-formatted line subtotal, an optional coupon discount and the total.',
							targetFiles: ['src/components/OrderSummary.tsx'],
							snippets: [
								{
									label: 'Create the component',
									language: 'tsx',
									filename: 'src/components/OrderSummary.tsx',
									code:
										"import { formatPeso } from '@/lib/format';\n\ninterface OrderItem {\n  product_id: string;\n  product_name: string;\n  price: number;\n  cartQuantity: number;\n}\n\ninterface Coupon {\n  coupon_id: string;\n  code: string;\n  discount_percent: number;\n}\n\ninterface OrderSummaryProps {\n  customerName: string;\n  items: OrderItem[];\n  coupon?: Coupon;\n}\n\nexport default function OrderSummary({\n  customerName,\n  items,\n  coupon,\n}: OrderSummaryProps) {\n  const subtotal = items.reduce(\n    (sum, item) => sum + item.price * item.cartQuantity,\n    0,\n  );\n  const discount = coupon ? (subtotal * coupon.discount_percent) / 100 : 0;\n  const total = subtotal - discount;\n\n  return (\n    <div className=\"order-summary\">\n      <p data-testid=\"customer-name\">{customerName}</p>\n\n      <ul>\n        {items.map((item) => (\n          <li key={item.product_id} data-testid=\"order-item\">\n            <span>{item.product_name}</span>\n            <span>{formatPeso(item.price * item.cartQuantity)}</span>\n          </li>\n        ))}\n      </ul>\n\n      {coupon && (\n        <p data-testid=\"order-discount\">\n          Discount ({coupon.code}): {formatPeso(discount)}\n        </p>\n      )}\n\n      <p data-testid=\"order-total\">Total: {formatPeso(total)}</p>\n    </div>\n  );\n}",
									note: '`order-discount` must not render at all when no coupon is passed. This component imports the `formatPeso` helper from Task 1.2.'
								}
							],
							testLabel: 'L3T2: <OrderSummary />',
							testPath: `${TESTS_BASE}/level-3/task-2/build-order-payload.test.tsx`
						}
					]
				},
				{
					order: 4,
					title: 'Coupons Feature Expansion',
					tasks: [
						{
							level: 4,
							task: 1,
							title: 'Coupon Input Component',
							summary:
								'Default-export a controlled coupon input whose Apply button is disabled while empty, normalizes the code (trim + strip inner whitespace + uppercase) and clears the field after applying.',
							targetFiles: ['src/components/CouponInput.tsx'],
							snippets: [
								{
									label: 'Create the component',
									language: 'tsx',
									filename: 'src/components/CouponInput.tsx',
									code:
										"import { useState } from 'react';\n\ninterface CouponInputProps {\n  onApply: (normalizedCode: string) => void;\n}\n\nconst normalize = (code: string) =>\n  code.trim().replace(/\\s+/g, '').toUpperCase();\n\nexport default function CouponInput({ onApply }: CouponInputProps) {\n  const [code, setCode] = useState('');\n\n  const normalized = normalize(code);\n  const canApply = normalized.length > 0;\n\n  function handleApply() {\n    if (!canApply) return;\n    onApply(normalized);\n    setCode('');\n  }\n\n  return (\n    <div className=\"coupon-input\">\n      <input\n        type=\"text\"\n        value={code}\n        placeholder=\"Coupon code\"\n        onChange={(event) => setCode(event.target.value)}\n      />\n      <button type=\"button\" onClick={handleApply} disabled={!canApply}>\n        Apply\n      </button>\n    </div>\n  );\n}",
									note: 'Normalization is the whole point: `"  save 10 "` → `SAVE10`. Whitespace-only input leaves the button disabled and must not call `onApply`.'
								}
							],
							testLabel: 'L4T1: <CouponInput />',
							testPath: `${TESTS_BASE}/level-4/task-1/coupon-validate.test.tsx`
						},
						{
							level: 4,
							task: 2,
							title: 'Best Coupon Selector Server Action',
							summary:
								'Export an async server action that fetches active coupons, ignores expired ones, and returns the coupon yielding the largest discount on a subtotal (or null).',
							targetFiles: ['src/lib/actions/coupons.ts'],
							snippets: [
								{
									label: 'Create the server action',
									language: 'ts',
									filename: 'src/lib/actions/coupons.ts',
									code:
										"import { prisma } from '@/lib/prisma';\n\ninterface CouponRow {\n  coupon_id: string;\n  code: string;\n  discount_percent: number;\n  expires_at: Date | null;\n}\n\nexport interface BestCouponResult {\n  coupon: { coupon_id: string; code: string; discount_percent: number };\n  discount: number;\n}\n\nconst round2 = (value: number) => Math.round(value * 100) / 100;\n\nexport async function applyBestCoupon(\n  subtotal: number,\n  now: Date = new Date(),\n): Promise<BestCouponResult | null> {\n  const coupons = await prisma.coupon.findMany({\n    where: { is_active: true },\n  });\n\n  const usable = (coupons as CouponRow[]).filter(\n    (coupon) => !coupon.expires_at || coupon.expires_at.getTime() > now.getTime(),\n  );\n\n  if (usable.length === 0) return null;\n\n  const best = usable.reduce((winner, coupon) =>\n    coupon.discount_percent > winner.discount_percent ? coupon : winner,\n  );\n\n  return {\n    coupon: {\n      coupon_id: best.coupon_id,\n      code: best.code,\n      discount_percent: best.discount_percent,\n    },\n    discount: round2(subtotal * (best.discount_percent / 100)),\n  };\n}",
									note: 'Filtering by `is_active: true` happens in the Prisma query, and the expiry check happens in code against the injected `now`.'
								}
							],
							testLabel: 'L4T2: applyBestCoupon (server action)',
							testPath: `${TESTS_BASE}/level-4/task-2/apply-best-coupon.test.tsx`
						}
					]
				},
				{
					order: 5,
					title: 'Sales Reporting',
					tasks: [
						{
							level: 5,
							task: 1,
							title: 'Sales Summary Component',
							summary:
								'Default-export a sales summary that totals revenue and discounts, counts orders, and averages order value — all peso-formatted, with no division by zero on an empty list.',
							targetFiles: ['src/components/SalesSummary.tsx'],
							snippets: [
								{
									label: 'Create the component',
									language: 'tsx',
									filename: 'src/components/SalesSummary.tsx',
									code:
										"import { formatPeso } from '@/lib/format';\n\ninterface Order {\n  total_amount: number;\n  discount_amount: number;\n}\n\ninterface SalesSummaryProps {\n  orders: Order[];\n}\n\nexport default function SalesSummary({ orders }: SalesSummaryProps) {\n  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);\n  const totalDiscount = orders.reduce((sum, order) => sum + order.discount_amount, 0);\n  const orderCount = orders.length;\n  const averageOrder = orderCount === 0 ? 0 : totalRevenue / orderCount;\n\n  return (\n    <div className=\"sales-summary\">\n      <p data-testid=\"total-revenue\">{formatPeso(totalRevenue)}</p>\n      <p data-testid=\"total-discount\">{formatPeso(totalDiscount)}</p>\n      <p data-testid=\"order-count\">{orderCount}</p>\n      <p data-testid=\"average-order\">{formatPeso(averageOrder)}</p>\n    </div>\n  );\n}",
									note: 'Guard the average against an empty `orders` array — the test asserts all four values are zero there.'
								}
							],
							testLabel: 'L5T1: <SalesSummary />',
							testPath: `${TESTS_BASE}/level-5/task-1/summarize-sales.test.tsx`
						},
						{
							level: 5,
							task: 2,
							title: 'Top Selling Products Server Action',
							summary:
								'Export an async server action that aggregates order items per product, sorts by units sold descending (ties broken by revenue) and respects a limit.',
							targetFiles: ['src/lib/actions/reports.ts'],
							snippets: [
								{
									label: 'Create the server action',
									language: 'ts',
									filename: 'src/lib/actions/reports.ts',
									code:
										"import { prisma } from '@/lib/prisma';\n\nexport interface TopSellingProduct {\n  product_id: string;\n  product_name: string;\n  unitsSold: number;\n  revenue: number;\n}\n\nexport async function getTopSellingProducts(\n  limit: number,\n): Promise<TopSellingProduct[]> {\n  const items = await prisma.orderItem.findMany({\n    include: { product: true },\n  });\n\n  const byProduct = new Map<string, TopSellingProduct>();\n\n  for (const item of items) {\n    const existing = byProduct.get(item.product_id);\n\n    if (existing) {\n      existing.unitsSold += item.quantity;\n      existing.revenue += item.subtotal;\n    } else {\n      byProduct.set(item.product_id, {\n        product_id: item.product_id,\n        product_name: item.product.product_name,\n        unitsSold: item.quantity,\n        revenue: item.subtotal,\n      });\n    }\n  }\n\n  return [...byProduct.values()]\n    .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)\n    .slice(0, limit);\n}",
									note: 'The tie-break matters: two products can sell the same units, and the higher revenue must rank first.'
								}
							],
							testLabel: 'L5T2: getTopSellingProducts (server action)',
							testPath: `${TESTS_BASE}/level-5/task-2/top-selling.test.tsx`
						}
					]
				}
			]
		},
		{
			ref: 'scenario-2',
			folder: 'gym-member-portal',
			name: 'Gym Member Portal',
			description:
				'A gym membership portal covering membership status, class capacity, booking aggregation and attendance analytics.',
			totalTasks: 10,
			levels: [
				{ order: 1, title: 'Getting Familiar with the Codebase', tasks: [] },
				{ order: 2, title: 'Membership Logic', tasks: [] },
				{ order: 3, title: 'Class Capacity', tasks: [] },
				{ order: 4, title: 'Booking Aggregation', tasks: [] },
				{ order: 5, title: 'Attendance Analytics', tasks: [] }
			]
		},
		{
			ref: 'scenario-3',
			folder: 'employee-time-tracking',
			name: 'Employee Time Tracking',
			description:
				'An employee time-tracking app covering time calculations, time-off logic, payroll computation and payroll reporting.',
			totalTasks: 10,
			levels: [
				{ order: 1, title: 'Getting Familiar with the Codebase', tasks: [] },
				{ order: 2, title: 'Time Calculations', tasks: [] },
				{ order: 3, title: 'Time-Off Logic', tasks: [] },
				{ order: 4, title: 'Payroll Computation', tasks: [] },
				{ order: 5, title: 'Payroll Reporting', tasks: [] }
			]
		},
		{
			ref: 'tutorial',
			folder: 'TO_DO_LIST',
			name: 'Tutorial — To-Do List',
			description:
				'A minimal full-stack to-do list that walks through environment setup and a small peso-formatting helper.',
			totalTasks: 2,
			levels: [{ order: 1, title: 'Environment Setup & Orientation', tasks: [] }]
		}
	]
};
