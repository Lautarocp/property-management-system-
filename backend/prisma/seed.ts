import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ───────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pms.com' },
    update: {},
    create: {
      email: 'admin@pms.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@pms.com' },
    update: {},
    create: {
      email: 'manager@pms.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'González',
      role: 'MANAGER',
    },
  });

  console.log('✅ Users created');

  // ─── Complexes ───────────────────────────────────────────────────────────
  const complex1 = await prisma.apartmentComplex.upsert({
    where: { id: 'complex-1' },
    update: {},
    create: {
      id: 'complex-1',
      name: 'Residencial El Parque',
      address: 'Av. del Parque 1200',
      city: 'Buenos Aires',
      state: 'CABA',
      zipCode: 'C1425',
      description: 'Moderno complejo residencial a 2 cuadras del parque central. Amenidades: piscina, gimnasio, SUM.',
      ownerId: admin.id,
    },
  });

  const complex2 = await prisma.apartmentComplex.upsert({
    where: { id: 'complex-2' },
    update: {},
    create: {
      id: 'complex-2',
      name: 'Torres del Centro',
      address: 'Calle Corrientes 850',
      city: 'Rosario',
      state: 'Santa Fe',
      zipCode: 'S2000',
      description: 'Torre de 12 pisos en el corazón del centro. Cocheras disponibles, portería 24hs.',
      ownerId: admin.id,
    },
  });

  const complex3 = await prisma.apartmentComplex.upsert({
    where: { id: 'complex-3' },
    update: {},
    create: {
      id: 'complex-3',
      name: 'Barrio Jardín',
      address: 'Ruta 9 km 45',
      city: 'Córdoba',
      state: 'Córdoba',
      zipCode: 'X5000',
      description: 'Complejo de casas y departamentos bajos con amplios espacios verdes.',
      ownerId: manager.id,
    },
  });

  console.log('✅ Complexes created');

  // ─── Apartments — Complex 1 ───────────────────────────────────────────────
  const apts1 = await Promise.all([
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '1A' } }, update: {}, create: { id: 'apt-1a', number: '1A', floor: 1, area: 45, monthlyRent: 850, status: 'OCCUPIED', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '1B' } }, update: {}, create: { id: 'apt-1b', number: '1B', floor: 1, area: 65, monthlyRent: 1100, status: 'OCCUPIED', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '2A' } }, update: {}, create: { id: 'apt-2a', number: '2A', floor: 2, area: 75, monthlyRent: 1300, status: 'AVAILABLE', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '2B' } }, update: {}, create: { id: 'apt-2b', number: '2B', floor: 2, area: 95, monthlyRent: 1600, status: 'OCCUPIED', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '3A' } }, update: {}, create: { id: 'apt-3a', number: '3A', floor: 3, area: 42, monthlyRent: 800, status: 'MAINTENANCE', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '3B' } }, update: {}, create: { id: 'apt-3b', number: '3B', floor: 3, area: 68, monthlyRent: 1150, status: 'AVAILABLE', complexId: complex1.id } }),
  ]);

  // ─── Apartments — Complex 2 ───────────────────────────────────────────────
  const apts2 = await Promise.all([
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '101' } }, update: {}, create: { id: 'apt-101', number: '101', floor: 1, area: 38, monthlyRent: 700, status: 'OCCUPIED', complexId: complex2.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '201' } }, update: {}, create: { id: 'apt-201', number: '201', floor: 2, area: 60, monthlyRent: 950, status: 'AVAILABLE', complexId: complex2.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '301' } }, update: {}, create: { id: 'apt-301', number: '301', floor: 3, area: 72, monthlyRent: 1200, status: 'OCCUPIED', complexId: complex2.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '401' } }, update: {}, create: { id: 'apt-401', number: '401', floor: 4, area: 90, monthlyRent: 1500, status: 'AVAILABLE', complexId: complex2.id } }),
  ]);

  // ─── Apartments — Complex 3 ───────────────────────────────────────────────
  const apts3 = await Promise.all([
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex3.id, number: 'C1' } }, update: {}, create: { id: 'apt-c1', number: 'C1', floor: 1, area: 110, monthlyRent: 1400, status: 'OCCUPIED', complexId: complex3.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex3.id, number: 'C2' } }, update: {}, create: { id: 'apt-c2', number: 'C2', floor: 1, area: 80, monthlyRent: 1050, status: 'AVAILABLE', complexId: complex3.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex3.id, number: 'C3' } }, update: {}, create: { id: 'apt-c3', number: 'C3', floor: 1, area: 140, monthlyRent: 1800, status: 'OCCUPIED', complexId: complex3.id } }),
  ]);

  console.log('✅ Apartments created');

  // ─── Tenants ─────────────────────────────────────────────────────────────
  const tenants = await Promise.all([
    prisma.tenant.upsert({ where: { email: 'carlos.mendez@mail.com' }, update: {}, create: { id: 'tenant-1', firstName: 'Carlos', lastName: 'Méndez', email: 'carlos.mendez@mail.com', phone: '+54 11 4523-7890', dni: '28456123', birthDate: new Date('1985-04-12'), notes: 'Paga puntualmente. Prefiere contacto por WhatsApp.', createdById: admin.id } }),
    prisma.tenant.upsert({ where: { email: 'laura.perez@mail.com' }, update: {}, create: { id: 'tenant-2', firstName: 'Laura', lastName: 'Pérez', email: 'laura.perez@mail.com', phone: '+54 11 5678-1234', dni: '31234567', birthDate: new Date('1992-08-25'), notes: 'Tiene mascota (gato). Aprobado por administración.', createdById: admin.id } }),
    prisma.tenant.upsert({ where: { email: 'martin.silva@mail.com' }, update: {}, create: { id: 'tenant-3', firstName: 'Martín', lastName: 'Silva', email: 'martin.silva@mail.com', phone: '+54 341 4112-9900', dni: '25789456', birthDate: new Date('1979-11-03'), createdById: manager.id } }),
    prisma.tenant.upsert({ where: { email: 'ana.gomez@mail.com' }, update: {}, create: { id: 'tenant-4', firstName: 'Ana', lastName: 'Gómez', email: 'ana.gomez@mail.com', phone: '+54 11 4987-3321', dni: '35678901', birthDate: new Date('1998-02-14'), notes: 'Estudiante universitaria. Contrato por 1 año.', createdById: admin.id } }),
    prisma.tenant.upsert({ where: { email: 'roberto.garcia@mail.com' }, update: {}, create: { id: 'tenant-5', firstName: 'Roberto', lastName: 'García', email: 'roberto.garcia@mail.com', phone: '+54 351 4556-7788', dni: '22134567', birthDate: new Date('1971-07-30'), createdById: manager.id } }),
    prisma.tenant.upsert({ where: { email: 'sofia.torres@mail.com' }, update: {}, create: { id: 'tenant-6', firstName: 'Sofía', lastName: 'Torres', email: 'sofia.torres@mail.com', phone: '+54 11 4001-5566', dni: '38901234', birthDate: new Date('2001-05-18'), notes: 'Primer alquiler. Tiene garante aprobado.', createdById: admin.id } }),
    prisma.tenant.upsert({ where: { email: 'diego.ramirez@mail.com' }, update: {}, create: { id: 'tenant-7', firstName: 'Diego', lastName: 'Ramírez', email: 'diego.ramirez@mail.com', phone: '+54 341 4789-0011', dni: '29567890', birthDate: new Date('1988-12-09'), createdById: manager.id } }),
  ]);

  console.log('✅ Tenants created');

  // ─── Active Leases ────────────────────────────────────────────────────────
  const leases = await Promise.all([
    // Carlos → 1A (Complex 1)
    prisma.lease.upsert({ where: { id: 'lease-1' }, update: {}, create: { id: 'lease-1', apartmentId: 'apt-1a', tenantId: 'tenant-1', startDate: new Date('2025-07-01'), endDate: new Date('2026-06-30'), monthlyRent: 850, depositAmount: 1700, status: 'ACTIVE', notes: 'Contrato renovado por segundo año.' } }),
    // Laura → 1B (Complex 1)
    prisma.lease.upsert({ where: { id: 'lease-2' }, update: {}, create: { id: 'lease-2', apartmentId: 'apt-1b', tenantId: 'tenant-2', startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'), monthlyRent: 1100, depositAmount: 2200, status: 'ACTIVE' } }),
    // Martín → 101 (Complex 2)
    prisma.lease.upsert({ where: { id: 'lease-3' }, update: {}, create: { id: 'lease-3', apartmentId: 'apt-101', tenantId: 'tenant-3', startDate: new Date('2025-11-01'), endDate: new Date('2026-10-31'), monthlyRent: 700, depositAmount: 1400, status: 'ACTIVE' } }),
    // Ana → 301 (Complex 2)
    prisma.lease.upsert({ where: { id: 'lease-4' }, update: {}, create: { id: 'lease-4', apartmentId: 'apt-301', tenantId: 'tenant-4', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), monthlyRent: 1200, depositAmount: 2400, status: 'ACTIVE', notes: 'Contrato estudiantil.' } }),
    // Roberto → C1 (Complex 3)
    prisma.lease.upsert({ where: { id: 'lease-5' }, update: {}, create: { id: 'lease-5', apartmentId: 'apt-c1', tenantId: 'tenant-5', startDate: new Date('2025-06-01'), endDate: new Date('2026-05-31'), monthlyRent: 1400, depositAmount: 2800, status: 'ACTIVE' } }),
    // Sofía → 2B (Complex 1)
    prisma.lease.upsert({ where: { id: 'lease-6' }, update: {}, create: { id: 'lease-6', apartmentId: 'apt-2b', tenantId: 'tenant-6', startDate: new Date('2026-02-01'), endDate: new Date('2027-01-31'), monthlyRent: 1600, depositAmount: 3200, status: 'ACTIVE' } }),
    // Diego → C3 (Complex 3)
    prisma.lease.upsert({ where: { id: 'lease-7' }, update: {}, create: { id: 'lease-7', apartmentId: 'apt-c3', tenantId: 'tenant-7', startDate: new Date('2025-08-01'), endDate: new Date('2026-07-31'), monthlyRent: 1800, depositAmount: 3600, status: 'ACTIVE' } }),
    // Terminated lease — Carlos in old apt (history)
    prisma.lease.upsert({ where: { id: 'lease-old-1' }, update: {}, create: { id: 'lease-old-1', apartmentId: 'apt-3b', tenantId: 'tenant-1', startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), monthlyRent: 780, depositAmount: 1560, status: 'TERMINATED', notes: 'Mudanza a unidad más grande.' } }),
  ]);

  console.log('✅ Leases created');

  // ─── Payments ─────────────────────────────────────────────────────────────
  await Promise.all([
    // Carlos — paid months
    prisma.payment.upsert({ where: { id: 'pay-1-jan' }, update: {}, create: { id: 'pay-1-jan', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-03'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-feb' }, update: {}, create: { id: 'pay-1-feb', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-04'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-mar' }, update: {}, create: { id: 'pay-1-mar', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),
    // Laura — one overdue
    prisma.payment.upsert({ where: { id: 'pay-2-jan' }, update: {}, create: { id: 'pay-2-jan', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-06'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-2-feb' }, update: {}, create: { id: 'pay-2-feb', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2026-02-05'), status: 'OVERDUE', type: 'RENT', notes: 'No se recibió pago. Contactar al inquilino.' } }),
    prisma.payment.upsert({ where: { id: 'pay-2-mar' }, update: {}, create: { id: 'pay-2-mar', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),
    // Martín
    prisma.payment.upsert({ where: { id: 'pay-3-feb' }, update: {}, create: { id: 'pay-3-feb', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 700, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-05'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-3-mar' }, update: {}, create: { id: 'pay-3-mar', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 700, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),
    // Ana — deposit + rent
    prisma.payment.upsert({ where: { id: 'pay-4-dep' }, update: {}, create: { id: 'pay-4-dep', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 2400, dueDate: new Date('2026-01-01'), paidDate: new Date('2025-12-28'), status: 'PAID', type: 'DEPOSIT' } }),
    prisma.payment.upsert({ where: { id: 'pay-4-mar' }, update: {}, create: { id: 'pay-4-mar', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 1200, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),
  ]);

  console.log('✅ Payments created');

  console.log('\n🎉 Seed complete! Summary:');
  console.log('   Users:      2 (admin@pms.com / manager@pms.com — password: Admin123!)');
  console.log('   Complexes:  3');
  console.log('   Apartments: 13 (7 occupied, 4 available, 1 maintenance, 1 available)');
  console.log('   Tenants:    7');
  console.log('   Leases:     8 (7 active, 1 terminated)');
  console.log('   Payments:   10 (5 paid, 3 pending, 1 overdue, 1 deposit paid)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
