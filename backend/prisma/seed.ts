import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL is not configured. Skipping Prisma seed.');
    return;
  }

  if (!['development', 'test'].includes(process.env.DATABASE_ENV ?? '')) {
    throw new Error('Set DATABASE_ENV=development or DATABASE_ENV=test only after verifying the database target');
  }
  if (!['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
    throw new Error('Prisma seed is allowed only when NODE_ENV is development or test');
  }
  if (process.env.DATABASE_TARGET_CONFIRMATION !== 'I_HAVE_VERIFIED_THIS_IS_NOT_PRODUCTION') {
    throw new Error('Set DATABASE_TARGET_CONFIRMATION only after verifying the configured database is not production');
  }

  const stores = [
    { id: 'demo-store-01', name: 'Downtown Fresh Market', region: 'North', timezone: 'UTC' },
    { id: 'demo-store-02', name: 'Riverside Grocery', region: 'Central', timezone: 'UTC' },
  ];

  const products = [
    { id: 'demo-product-01', sku: 'DEMO-AV-001', name: 'Avocado', category: 'Fruit', unit: 'unit' },
    { id: 'demo-product-02', sku: 'DEMO-MIL-002', name: 'Milk', category: 'Dairy', unit: 'liter' },
  ];

  await prisma.$transaction(async (tx) => {
    for (const store of stores) {
      await tx.store.upsert({
        where: { id: store.id },
        update: {},
        create: store,
      });
    }
    for (const product of products) {
      await tx.product.upsert({
        where: { id: product.id },
        update: {},
        create: product,
      });
    }
    const avocadoBatch = await tx.inventoryBatch.upsert({
      where: { sourceId: 'zero-waste-demo:batch:01' },
      update: {},
      create: {
        sourceId: 'zero-waste-demo:batch:01',
        storeId: stores[0].id,
        productId: products[0].id,
        quantity: 42,
        expiryDate: new Date('2026-12-15T00:00:00.000Z'),
        status: 'WARNING',
      },
    });
    await tx.inventoryBatch.upsert({
      where: { sourceId: 'zero-waste-demo:batch:02' },
      update: {},
      create: {
        sourceId: 'zero-waste-demo:batch:02',
        storeId: stores[0].id,
        productId: products[1].id,
        quantity: 18,
        expiryDate: new Date('2026-12-12T00:00:00.000Z'),
        status: 'CRITICAL',
      },
    });
    await tx.salesRecord.upsert({
      where: { sourceId: 'zero-waste-demo:sale:01' },
      update: {},
      create: {
        sourceId: 'zero-waste-demo:sale:01',
        storeId: stores[0].id,
        productId: products[0].id,
        quantity: 16,
        revenue: 52.8,
        soldAt: new Date('2026-10-06T09:00:00.000Z'),
      },
    });
    await tx.receipt.upsert({
      where: { sourceId: 'zero-waste-demo:receipt:01' },
      update: {},
      create: {
        sourceId: 'zero-waste-demo:receipt:01',
        storeId: stores[0].id,
        supplierName: 'Demo Supplier',
        orderDate: new Date('2026-10-05T09:00:00.000Z'),
        totalCost: 84,
        lines: {
          create: [{
            productId: products[0].id,
            batchId: avocadoBatch.id,
            quantity: 42,
            unitCost: 2,
          }],
        },
      },
    });
    await tx.promotion.upsert({
      where: { sourceId: 'zero-waste-demo:promotion:01' },
      update: {},
      create: {
        sourceId: 'zero-waste-demo:promotion:01',
        storeId: stores[0].id,
        productId: products[0].id,
        name: 'Demo weekend offer',
        discountPct: 10,
        startsAt: new Date('2026-10-10T00:00:00.000Z'),
        endsAt: new Date('2026-10-12T00:00:00.000Z'),
      },
    });
    await tx.wasteRecord.upsert({
      where: { sourceId: 'zero-waste-demo:waste:01' },
      update: {},
      create: {
        sourceId: 'zero-waste-demo:waste:01',
        storeId: stores[0].id,
        productId: products[0].id,
        batchId: avocadoBatch.id,
        quantity: 2,
        reason: 'Demo spoilage fixture',
        recordedAt: new Date('2026-10-06T18:00:00.000Z'),
      },
    });
  });

  console.log('Development seed complete; existing seeded records were left unchanged');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
