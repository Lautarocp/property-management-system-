/**
 * Backfill ledger entries for existing data.
 * Run with: npx ts-node -r tsconfig-paths/register prisma/seed/backfill-ledger.ts
 * Idempotent — safe to re-run.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function entryExists(referenceId: string, direction: 'DEBIT' | 'CREDIT', referenceType?: string) {
  return prisma.ledgerEntry.findFirst({
    where: {
      referenceId,
      direction,
      ...(referenceType && { referenceType }),
    },
  });
}

async function main() {
  console.log('Starting ledger backfill...');
  let created = 0;
  let skipped = 0;

  // ── Step 1: Payments (PENDING + OVERDUE) → DEBIT/CHARGE
  const allPayments = await prisma.payment.findMany({
    where: { status: { in: ['PENDING', 'OVERDUE', 'PAID', 'CANCELLED'] } },
    include: { lease: { select: { apartmentId: true } } },
  });

  for (const p of allPayments) {
    if (!p.lease || Number(p.amount) <= 0) { skipped++; continue; }

    const categoryMap: Record<string, any> = {
      RENT: 'RENT', DEPOSIT: 'DEPOSIT', MAINTENANCE: 'MAINTENANCE', LATE_FEE: 'EXTRA', OTHER: 'EXTRA',
    };

    // DEBIT entry (the charge)
    const debitExists = await entryExists(p.id, 'DEBIT', 'PaymentBackfill');
    if (!debitExists) {
      await prisma.ledgerEntry.create({
        data: {
          type: 'CHARGE',
          category: categoryMap[p.type] ?? 'EXTRA',
          direction: 'DEBIT',
          amount: Number(p.amount),
          description: `Backfilled charge: ${p.type}`,
          referenceId: p.id,
          referenceType: 'PaymentBackfill',
          tenantId: p.tenantId,
          leaseId: p.leaseId,
          apartmentId: p.lease.apartmentId,
          createdAt: p.createdAt,
        },
      });
      created++;
    } else {
      skipped++;
    }

    // CREDIT entry only for PAID payments
    if (p.status === 'PAID' && p.paidDate) {
      const creditExists = await entryExists(p.id, 'CREDIT', 'PaymentBackfill');
      if (!creditExists) {
        await prisma.ledgerEntry.create({
          data: {
            type: 'PAYMENT',
            category: categoryMap[p.type] ?? 'EXTRA',
            direction: 'CREDIT',
            amount: Number(p.amount),
            description: `Backfilled payment received: ${p.type}`,
            referenceId: p.id,
            referenceType: 'PaymentBackfill',
            tenantId: p.tenantId,
            leaseId: p.leaseId,
            apartmentId: p.lease.apartmentId,
            createdAt: p.paidDate,
          },
        });
        created++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`Payments: ${created} created, ${skipped} skipped`);
  const paymentsDone = created;
  created = 0; skipped = 0;

  // ── Step 2: MaintenanceRequests with tenantChargeAmount > 0
  const maintenanceRecords = await prisma.maintenanceRequest.findMany({
    where: { tenantChargeAmount: { not: null }, tenantId: { not: null } },
  });

  for (const m of maintenanceRecords) {
    if (!m.tenantId || !m.tenantChargeAmount || Number(m.tenantChargeAmount) <= 0) { skipped++; continue; }

    const activeLease = await prisma.lease.findFirst({
      where: { apartmentId: m.apartmentId },
      orderBy: { createdAt: 'desc' },
    });
    if (!activeLease) { skipped++; continue; }

    const debitExists = await entryExists(m.id, 'DEBIT', 'MaintenanceBackfill');
    if (!debitExists) {
      await prisma.ledgerEntry.create({
        data: {
          type: 'CHARGE',
          category: 'MAINTENANCE',
          direction: 'DEBIT',
          amount: Number(m.tenantChargeAmount),
          description: `Backfilled maintenance charge: ${m.title}`,
          referenceId: m.id,
          referenceType: 'MaintenanceBackfill',
          tenantId: m.tenantId,
          leaseId: activeLease.id,
          apartmentId: m.apartmentId,
          createdAt: m.createdAt,
        },
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`Maintenance charges: ${created} created, ${skipped} skipped`);
  const maintDone = created;
  created = 0; skipped = 0;

  // ── Step 3: Active leases with depositAmount > 0
  const activeLeases = await prisma.lease.findMany({
    where: { depositAmount: { gt: 0 } },
  });

  for (const l of activeLeases) {
    if (Number(l.depositAmount) <= 0) { skipped++; continue; }

    const debitExists = await entryExists(l.id, 'DEBIT', 'LeaseBackfill');
    if (!debitExists) {
      await prisma.ledgerEntry.create({
        data: {
          type: 'CHARGE',
          category: 'DEPOSIT',
          direction: 'DEBIT',
          amount: Number(l.depositAmount),
          description: 'Backfilled security deposit charge',
          referenceId: l.id,
          referenceType: 'LeaseBackfill',
          tenantId: l.tenantId,
          leaseId: l.id,
          apartmentId: l.apartmentId,
          createdAt: l.createdAt,
        },
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`Deposit charges: ${created} created, ${skipped} skipped`);

  console.log(`\nBackfill complete.`);
  console.log(`  Payments processed: ${paymentsDone} entries`);
  console.log(`  Maintenance charges: ${maintDone} entries`);
  console.log(`  Deposit charges: ${created} entries`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
