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
  await Promise.all([
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '1A' } }, update: {}, create: { id: 'apt-1a', number: '1A', floor: 1, area: 45, monthlyRent: 850, status: 'OCCUPIED', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '1B' } }, update: {}, create: { id: 'apt-1b', number: '1B', floor: 1, area: 65, monthlyRent: 1100, status: 'OCCUPIED', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '2A' } }, update: {}, create: { id: 'apt-2a', number: '2A', floor: 2, area: 75, monthlyRent: 1300, status: 'AVAILABLE', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '2B' } }, update: {}, create: { id: 'apt-2b', number: '2B', floor: 2, area: 95, monthlyRent: 1600, status: 'OCCUPIED', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '3A' } }, update: {}, create: { id: 'apt-3a', number: '3A', floor: 3, area: 42, monthlyRent: 800, status: 'MAINTENANCE', complexId: complex1.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex1.id, number: '3B' } }, update: {}, create: { id: 'apt-3b', number: '3B', floor: 3, area: 68, monthlyRent: 1150, status: 'AVAILABLE', complexId: complex1.id } }),
  ]);

  // ─── Apartments — Complex 2 ───────────────────────────────────────────────
  await Promise.all([
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '101' } }, update: {}, create: { id: 'apt-101', number: '101', floor: 1, area: 38, monthlyRent: 700, status: 'OCCUPIED', complexId: complex2.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '201' } }, update: {}, create: { id: 'apt-201', number: '201', floor: 2, area: 60, monthlyRent: 950, status: 'AVAILABLE', complexId: complex2.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '301' } }, update: {}, create: { id: 'apt-301', number: '301', floor: 3, area: 72, monthlyRent: 1200, status: 'OCCUPIED', complexId: complex2.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex2.id, number: '401' } }, update: {}, create: { id: 'apt-401', number: '401', floor: 4, area: 90, monthlyRent: 1500, status: 'AVAILABLE', complexId: complex2.id } }),
  ]);

  // ─── Apartments — Complex 3 ───────────────────────────────────────────────
  await Promise.all([
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex3.id, number: 'C1' } }, update: {}, create: { id: 'apt-c1', number: 'C1', floor: 1, area: 110, monthlyRent: 1400, status: 'OCCUPIED', complexId: complex3.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex3.id, number: 'C2' } }, update: {}, create: { id: 'apt-c2', number: 'C2', floor: 1, area: 80, monthlyRent: 1050, status: 'AVAILABLE', complexId: complex3.id } }),
    prisma.apartment.upsert({ where: { complexId_number: { complexId: complex3.id, number: 'C3' } }, update: {}, create: { id: 'apt-c3', number: 'C3', floor: 1, area: 140, monthlyRent: 1800, status: 'OCCUPIED', complexId: complex3.id } }),
  ]);

  console.log('✅ Apartments created');

  // ─── Tenants ─────────────────────────────────────────────────────────────
  await Promise.all([
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
  await Promise.all([
    prisma.lease.upsert({ where: { id: 'lease-1' }, update: {}, create: { id: 'lease-1', apartmentId: 'apt-1a', tenantId: 'tenant-1', startDate: new Date('2025-07-01'), endDate: new Date('2026-06-30'), monthlyRent: 850, depositAmount: 1700, status: 'ACTIVE', notes: 'Contrato renovado por segundo año.' } }),
    prisma.lease.upsert({ where: { id: 'lease-2' }, update: {}, create: { id: 'lease-2', apartmentId: 'apt-1b', tenantId: 'tenant-2', startDate: new Date('2025-09-01'), endDate: new Date('2026-08-31'), monthlyRent: 1100, depositAmount: 2200, status: 'ACTIVE' } }),
    prisma.lease.upsert({ where: { id: 'lease-3' }, update: {}, create: { id: 'lease-3', apartmentId: 'apt-101', tenantId: 'tenant-3', startDate: new Date('2025-11-01'), endDate: new Date('2026-10-31'), monthlyRent: 700, depositAmount: 1400, status: 'ACTIVE' } }),
    prisma.lease.upsert({ where: { id: 'lease-4' }, update: {}, create: { id: 'lease-4', apartmentId: 'apt-301', tenantId: 'tenant-4', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), monthlyRent: 1200, depositAmount: 2400, status: 'ACTIVE', notes: 'Contrato estudiantil.' } }),
    prisma.lease.upsert({ where: { id: 'lease-5' }, update: {}, create: { id: 'lease-5', apartmentId: 'apt-c1', tenantId: 'tenant-5', startDate: new Date('2025-06-01'), endDate: new Date('2026-05-31'), monthlyRent: 1400, depositAmount: 2800, status: 'ACTIVE' } }),
    prisma.lease.upsert({ where: { id: 'lease-6' }, update: {}, create: { id: 'lease-6', apartmentId: 'apt-2b', tenantId: 'tenant-6', startDate: new Date('2026-02-01'), endDate: new Date('2027-01-31'), monthlyRent: 1600, depositAmount: 3200, status: 'ACTIVE' } }),
    prisma.lease.upsert({ where: { id: 'lease-7' }, update: {}, create: { id: 'lease-7', apartmentId: 'apt-c3', tenantId: 'tenant-7', startDate: new Date('2025-08-01'), endDate: new Date('2026-07-31'), monthlyRent: 1800, depositAmount: 3600, status: 'ACTIVE' } }),
    // Terminated lease — history for Carlos
    prisma.lease.upsert({ where: { id: 'lease-old-1' }, update: {}, create: { id: 'lease-old-1', apartmentId: 'apt-3b', tenantId: 'tenant-1', startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), monthlyRent: 780, depositAmount: 1560, status: 'TERMINATED', notes: 'Mudanza a unidad más grande.' } }),
  ]);

  console.log('✅ Leases created');

  // ─── Payments ─────────────────────────────────────────────────────────────
  await Promise.all([
    // Carlos — 4 months paid + 1 pending
    prisma.payment.upsert({ where: { id: 'pay-1-oct' }, update: {}, create: { id: 'pay-1-oct', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2025-10-05'), paidDate: new Date('2025-10-03'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-nov' }, update: {}, create: { id: 'pay-1-nov', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2025-11-05'), paidDate: new Date('2025-11-04'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-dec' }, update: {}, create: { id: 'pay-1-dec', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2025-12-05'), paidDate: new Date('2025-12-02'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-jan' }, update: {}, create: { id: 'pay-1-jan', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-03'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-feb' }, update: {}, create: { id: 'pay-1-feb', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-04'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-1-mar' }, update: {}, create: { id: 'pay-1-mar', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 850, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),
    // Carlos deposit
    prisma.payment.upsert({ where: { id: 'pay-1-dep' }, update: {}, create: { id: 'pay-1-dep', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 1700, dueDate: new Date('2025-07-01'), paidDate: new Date('2025-06-30'), status: 'PAID', type: 'DEPOSIT' } }),

    // Laura — 2 paid, 1 overdue, 1 pending
    prisma.payment.upsert({ where: { id: 'pay-2-oct' }, update: {}, create: { id: 'pay-2-oct', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2025-10-05'), paidDate: new Date('2025-10-08'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-2-nov' }, update: {}, create: { id: 'pay-2-nov', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2025-11-05'), paidDate: new Date('2025-11-06'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-2-jan' }, update: {}, create: { id: 'pay-2-jan', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-06'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-2-feb' }, update: {}, create: { id: 'pay-2-feb', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2026-02-05'), status: 'OVERDUE', type: 'RENT', notes: 'No se recibió pago. Contactar al inquilino.' } }),
    prisma.payment.upsert({ where: { id: 'pay-2-mar' }, update: {}, create: { id: 'pay-2-mar', leaseId: 'lease-2', tenantId: 'tenant-2', amount: 1100, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),

    // Martín — deposit + 3 months paid + pending
    prisma.payment.upsert({ where: { id: 'pay-3-dep' }, update: {}, create: { id: 'pay-3-dep', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 1400, dueDate: new Date('2025-11-01'), paidDate: new Date('2025-11-01'), status: 'PAID', type: 'DEPOSIT' } }),
    prisma.payment.upsert({ where: { id: 'pay-3-dec' }, update: {}, create: { id: 'pay-3-dec', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 700, dueDate: new Date('2025-12-05'), paidDate: new Date('2025-12-03'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-3-jan' }, update: {}, create: { id: 'pay-3-jan', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 700, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-07'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-3-feb' }, update: {}, create: { id: 'pay-3-feb', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 700, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-05'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-3-mar' }, update: {}, create: { id: 'pay-3-mar', leaseId: 'lease-3', tenantId: 'tenant-3', amount: 700, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),

    // Ana — deposit paid + rent months
    prisma.payment.upsert({ where: { id: 'pay-4-dep' }, update: {}, create: { id: 'pay-4-dep', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 2400, dueDate: new Date('2026-01-01'), paidDate: new Date('2025-12-28'), status: 'PAID', type: 'DEPOSIT' } }),
    prisma.payment.upsert({ where: { id: 'pay-4-jan' }, update: {}, create: { id: 'pay-4-jan', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 1200, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-05'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-4-feb' }, update: {}, create: { id: 'pay-4-feb', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 1200, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-10'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-4-mar' }, update: {}, create: { id: 'pay-4-mar', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 1200, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),

    // Roberto — deposit + several months
    prisma.payment.upsert({ where: { id: 'pay-5-dep' }, update: {}, create: { id: 'pay-5-dep', leaseId: 'lease-5', tenantId: 'tenant-5', amount: 2800, dueDate: new Date('2025-06-01'), paidDate: new Date('2025-05-29'), status: 'PAID', type: 'DEPOSIT' } }),
    prisma.payment.upsert({ where: { id: 'pay-5-nov' }, update: {}, create: { id: 'pay-5-nov', leaseId: 'lease-5', tenantId: 'tenant-5', amount: 1400, dueDate: new Date('2025-11-05'), paidDate: new Date('2025-11-04'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-5-dec' }, update: {}, create: { id: 'pay-5-dec', leaseId: 'lease-5', tenantId: 'tenant-5', amount: 1400, dueDate: new Date('2025-12-05'), paidDate: new Date('2025-12-06'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-5-jan' }, update: {}, create: { id: 'pay-5-jan', leaseId: 'lease-5', tenantId: 'tenant-5', amount: 1400, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-05'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-5-feb' }, update: {}, create: { id: 'pay-5-feb', leaseId: 'lease-5', tenantId: 'tenant-5', amount: 1400, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-04'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-5-mar' }, update: {}, create: { id: 'pay-5-mar', leaseId: 'lease-5', tenantId: 'tenant-5', amount: 1400, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),

    // Sofía — deposit + rent
    prisma.payment.upsert({ where: { id: 'pay-6-dep' }, update: {}, create: { id: 'pay-6-dep', leaseId: 'lease-6', tenantId: 'tenant-6', amount: 3200, dueDate: new Date('2026-02-01'), paidDate: new Date('2026-01-28'), status: 'PAID', type: 'DEPOSIT' } }),
    prisma.payment.upsert({ where: { id: 'pay-6-feb' }, update: {}, create: { id: 'pay-6-feb', leaseId: 'lease-6', tenantId: 'tenant-6', amount: 1600, dueDate: new Date('2026-02-05'), paidDate: new Date('2026-02-05'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-6-mar' }, update: {}, create: { id: 'pay-6-mar', leaseId: 'lease-6', tenantId: 'tenant-6', amount: 1600, dueDate: new Date('2026-03-05'), status: 'OVERDUE', type: 'RENT' } }),

    // Diego — deposit + months + overdue
    prisma.payment.upsert({ where: { id: 'pay-7-dep' }, update: {}, create: { id: 'pay-7-dep', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 3600, dueDate: new Date('2025-08-01'), paidDate: new Date('2025-07-31'), status: 'PAID', type: 'DEPOSIT' } }),
    prisma.payment.upsert({ where: { id: 'pay-7-oct' }, update: {}, create: { id: 'pay-7-oct', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 1800, dueDate: new Date('2025-10-05'), paidDate: new Date('2025-10-05'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-7-nov' }, update: {}, create: { id: 'pay-7-nov', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 1800, dueDate: new Date('2025-11-05'), paidDate: new Date('2025-11-07'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-7-dec' }, update: {}, create: { id: 'pay-7-dec', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 1800, dueDate: new Date('2025-12-05'), paidDate: new Date('2025-12-04'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-7-jan' }, update: {}, create: { id: 'pay-7-jan', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 1800, dueDate: new Date('2026-01-05'), paidDate: new Date('2026-01-06'), status: 'PAID', type: 'RENT' } }),
    prisma.payment.upsert({ where: { id: 'pay-7-feb' }, update: {}, create: { id: 'pay-7-feb', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 1800, dueDate: new Date('2026-02-05'), status: 'OVERDUE', type: 'RENT', notes: 'Segundo mes sin pagar.' } }),
    prisma.payment.upsert({ where: { id: 'pay-7-mar' }, update: {}, create: { id: 'pay-7-mar', leaseId: 'lease-7', tenantId: 'tenant-7', amount: 1800, dueDate: new Date('2026-03-05'), status: 'PENDING', type: 'RENT' } }),
  ]);

  console.log('✅ Payments created');

  // ─── Maintenance Requests ─────────────────────────────────────────────────
  await Promise.all([
    // Resolved — with tenant charge
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-1' }, update: {}, create: {
      id: 'maint-1', apartmentId: 'apt-1a', tenantId: 'tenant-1',
      title: 'Canilla rota en baño', description: 'La canilla del baño principal gotea constantemente desde hace una semana.',
      status: 'RESOLVED', priority: 'HIGH', repairCost: 180, tenantChargeAmount: 90,
      tenantPercentage: 50, ownerPercentage: 50,
      notes: 'Plomero reemplazó canilla y sello. Se cobra 50% al inquilino por uso inadecuado.',
      resolvedAt: new Date('2026-01-20'),
    }}),
    // Resolved — full owner cost
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-2' }, update: {}, create: {
      id: 'maint-2', apartmentId: 'apt-1b', tenantId: 'tenant-2',
      title: 'Calefacción no funciona', description: 'El sistema de calefacción central no enciende. Temperatura bajo 10°C.',
      status: 'RESOLVED', priority: 'URGENT', repairCost: 520, tenantChargeAmount: 0,
      tenantPercentage: 0, ownerPercentage: 100,
      notes: 'Falla en el termostato central. Costo asumido por el propietario.',
      resolvedAt: new Date('2025-12-18'),
    }}),
    // In progress
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-3' }, update: {}, create: {
      id: 'maint-3', apartmentId: 'apt-101', tenantId: 'tenant-3',
      title: 'Humedad en pared dormitorio', description: 'Aparecieron manchas de humedad en la pared lateral del dormitorio principal.',
      status: 'IN_PROGRESS', priority: 'MEDIUM',
      notes: 'Esperando presupuesto de impermeabilización.',
    }}),
    // Open — urgent
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-4' }, update: {}, create: {
      id: 'maint-4', apartmentId: 'apt-c3', tenantId: 'tenant-7',
      title: 'Cortocircuito en cocina', description: 'Se fue la luz de la cocina y el tablero no resetea. Posible cortocircuito.',
      status: 'OPEN', priority: 'URGENT',
    }}),
    // Open — low priority
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-5' }, update: {}, create: {
      id: 'maint-5', apartmentId: 'apt-2b', tenantId: 'tenant-6',
      title: 'Pintura descascarada en balcón', description: 'La pintura del balcón está descascarada en varios sectores.',
      status: 'OPEN', priority: 'LOW',
    }}),
    // Closed — with tenant charge (creates a payment too)
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-6' }, update: {}, create: {
      id: 'maint-6', apartmentId: 'apt-301', tenantId: 'tenant-4',
      title: 'Vidrio roto ventana', description: 'El inquilino rompió accidentalmente el vidrio de la ventana del living.',
      status: 'CLOSED', priority: 'HIGH', repairCost: 240, tenantChargeAmount: 240,
      tenantPercentage: 100, ownerPercentage: 0,
      notes: 'Rotura por culpa del inquilino. Cargo total al inquilino.',
      resolvedAt: new Date('2026-02-05'),
    }}),
    // Resolved on complex 3
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-7' }, update: {}, create: {
      id: 'maint-7', apartmentId: 'apt-c1', tenantId: 'tenant-5',
      title: 'Puerta de entrada trabada', description: 'La cerradura de la puerta de entrada no gira correctamente.',
      status: 'RESOLVED', priority: 'HIGH', repairCost: 95, tenantChargeAmount: 0,
      tenantPercentage: 0, ownerPercentage: 100,
      resolvedAt: new Date('2026-01-10'),
    }}),
    // Maintenance apartment (no tenant)
    prisma.maintenanceRequest.upsert({ where: { id: 'maint-8' }, update: {}, create: {
      id: 'maint-8', apartmentId: 'apt-3a',
      title: 'Renovación integral', description: 'Unidad vacía en refacción: pintura, pisos, sanitarios.',
      status: 'IN_PROGRESS', priority: 'MEDIUM',
      notes: 'Plazo estimado: 3 semanas.',
    }}),
  ]);

  console.log('✅ Maintenance requests created');

  // ─── Expenses ─────────────────────────────────────────────────────────────
  await Promise.all([
    // Complex 1 expenses
    prisma.expense.upsert({ where: { id: 'exp-1' }, update: {}, create: { id: 'exp-1', complexId: complex1.id, description: 'Servicio de limpieza de áreas comunes', amount: 320, date: new Date('2026-01-10'), category: 'CLEANING', notes: 'Limpieza mensual de lobby, escaleras y SUM.' } }),
    prisma.expense.upsert({ where: { id: 'exp-2' }, update: {}, create: { id: 'exp-2', complexId: complex1.id, description: 'Factura de luz áreas comunes - Enero', amount: 145, date: new Date('2026-01-15'), category: 'UTILITIES' } }),
    prisma.expense.upsert({ where: { id: 'exp-3' }, update: {}, create: { id: 'exp-3', complexId: complex1.id, description: 'Reparación bomba de agua', amount: 580, date: new Date('2026-01-22'), category: 'REPAIRS', notes: 'Reemplazo de bomba presurizadora.' } }),
    prisma.expense.upsert({ where: { id: 'exp-4' }, update: {}, create: { id: 'exp-4', complexId: complex1.id, description: 'Seguro de edificio - Cuota trimestral', amount: 1200, date: new Date('2026-01-05'), category: 'INSURANCE' } }),
    prisma.expense.upsert({ where: { id: 'exp-5' }, update: {}, create: { id: 'exp-5', complexId: complex1.id, description: 'Servicio de limpieza de áreas comunes', amount: 320, date: new Date('2026-02-10'), category: 'CLEANING' } }),
    prisma.expense.upsert({ where: { id: 'exp-6' }, update: {}, create: { id: 'exp-6', complexId: complex1.id, description: 'Factura de luz áreas comunes - Febrero', amount: 162, date: new Date('2026-02-15'), category: 'UTILITIES' } }),
    prisma.expense.upsert({ where: { id: 'exp-7' }, update: {}, create: { id: 'exp-7', complexId: complex1.id, description: 'Pintura pasillo planta baja', amount: 430, date: new Date('2026-02-20'), category: 'REPAIRS' } }),
    prisma.expense.upsert({ where: { id: 'exp-8' }, update: {}, create: { id: 'exp-8', complexId: complex1.id, description: 'Servicio de limpieza - Marzo', amount: 320, date: new Date('2026-03-10'), category: 'CLEANING' } }),
    prisma.expense.upsert({ where: { id: 'exp-9' }, update: {}, create: { id: 'exp-9', complexId: complex1.id, description: 'Impuesto municipal edificio Q1', amount: 780, date: new Date('2026-03-01'), category: 'TAXES' } }),

    // Complex 2 expenses
    prisma.expense.upsert({ where: { id: 'exp-10' }, update: {}, create: { id: 'exp-10', complexId: complex2.id, description: 'Portero mensual', amount: 950, date: new Date('2026-01-01'), category: 'STAFF', notes: 'Sueldo portero enero.' } }),
    prisma.expense.upsert({ where: { id: 'exp-11' }, update: {}, create: { id: 'exp-11', complexId: complex2.id, description: 'Gas áreas comunes - Enero', amount: 210, date: new Date('2026-01-18'), category: 'UTILITIES' } }),
    prisma.expense.upsert({ where: { id: 'exp-12' }, update: {}, create: { id: 'exp-12', complexId: complex2.id, description: 'Portero mensual', amount: 950, date: new Date('2026-02-01'), category: 'STAFF' } }),
    prisma.expense.upsert({ where: { id: 'exp-13' }, update: {}, create: { id: 'exp-13', complexId: complex2.id, description: 'Reparación ascensor', amount: 1850, date: new Date('2026-02-08'), category: 'REPAIRS', notes: 'Mantenimiento semestral obligatorio.' } }),
    prisma.expense.upsert({ where: { id: 'exp-14' }, update: {}, create: { id: 'exp-14', complexId: complex2.id, description: 'Gas áreas comunes - Febrero', amount: 195, date: new Date('2026-02-18'), category: 'UTILITIES' } }),
    prisma.expense.upsert({ where: { id: 'exp-15' }, update: {}, create: { id: 'exp-15', complexId: complex2.id, description: 'Portero mensual', amount: 950, date: new Date('2026-03-01'), category: 'STAFF' } }),
    prisma.expense.upsert({ where: { id: 'exp-16' }, update: {}, create: { id: 'exp-16', complexId: complex2.id, description: 'Seguro torre - Cuota trimestral', amount: 900, date: new Date('2026-01-05'), category: 'INSURANCE' } }),

    // Complex 3 expenses
    prisma.expense.upsert({ where: { id: 'exp-17' }, update: {}, create: { id: 'exp-17', complexId: complex3.id, description: 'Mantenimiento jardín', amount: 280, date: new Date('2026-01-12'), category: 'CLEANING', notes: 'Corte de césped y poda mensual.' } }),
    prisma.expense.upsert({ where: { id: 'exp-18' }, update: {}, create: { id: 'exp-18', complexId: complex3.id, description: 'Agua riego espacios verdes', amount: 95, date: new Date('2026-01-20'), category: 'UTILITIES' } }),
    prisma.expense.upsert({ where: { id: 'exp-19' }, update: {}, create: { id: 'exp-19', complexId: complex3.id, description: 'Mantenimiento jardín', amount: 280, date: new Date('2026-02-12'), category: 'CLEANING' } }),
    prisma.expense.upsert({ where: { id: 'exp-20' }, update: {}, create: { id: 'exp-20', complexId: complex3.id, description: 'Impuesto rural Q1', amount: 450, date: new Date('2026-03-01'), category: 'TAXES' } }),
    prisma.expense.upsert({ where: { id: 'exp-21' }, update: {}, create: { id: 'exp-21', complexId: complex3.id, description: 'Reparación cerco perimetral', amount: 670, date: new Date('2026-02-25'), category: 'REPAIRS' } }),
  ]);

  console.log('✅ Expenses created');

  // ─── Ledger Entries ───────────────────────────────────────────────────────
  // Deposits (DEBIT charges at lease start)
  const depositEntries = [
    { id: 'led-dep-1', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 1700, createdAt: new Date('2025-07-01') },
    { id: 'led-dep-2', tenantId: 'tenant-2', leaseId: 'lease-2', apartmentId: 'apt-1b', amount: 2200, createdAt: new Date('2025-09-01') },
    { id: 'led-dep-3', tenantId: 'tenant-3', leaseId: 'lease-3', apartmentId: 'apt-101', amount: 1400, createdAt: new Date('2025-11-01') },
    { id: 'led-dep-4', tenantId: 'tenant-4', leaseId: 'lease-4', apartmentId: 'apt-301', amount: 2400, createdAt: new Date('2026-01-01') },
    { id: 'led-dep-5', tenantId: 'tenant-5', leaseId: 'lease-5', apartmentId: 'apt-c1', amount: 2800, createdAt: new Date('2025-06-01') },
    { id: 'led-dep-6', tenantId: 'tenant-6', leaseId: 'lease-6', apartmentId: 'apt-2b', amount: 3200, createdAt: new Date('2026-02-01') },
    { id: 'led-dep-7', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 3600, createdAt: new Date('2025-08-01') },
  ];
  for (const d of depositEntries) {
    await prisma.ledgerEntry.upsert({ where: { id: d.id }, update: {}, create: { id: d.id, type: 'CHARGE', category: 'DEPOSIT', direction: 'DEBIT', amount: d.amount, description: 'Security deposit charge', referenceId: `lease-${d.id.split('-')[2]}`, referenceType: 'Lease', tenantId: d.tenantId, leaseId: d.leaseId, apartmentId: d.apartmentId, createdAt: d.createdAt } });
    // Paid deposits get credit entry
    if (['led-dep-1','led-dep-2','led-dep-3','led-dep-4','led-dep-5','led-dep-6','led-dep-7'].includes(d.id)) {
      await prisma.ledgerEntry.upsert({ where: { id: `${d.id}-cr` }, update: {}, create: { id: `${d.id}-cr`, type: 'PAYMENT', category: 'DEPOSIT', direction: 'CREDIT', amount: d.amount, description: 'Security deposit received', referenceId: `pay-${d.id.split('-')[2]}-dep`, referenceType: 'Payment', tenantId: d.tenantId, leaseId: d.leaseId, apartmentId: d.apartmentId, createdAt: new Date(d.createdAt.getTime() + 86400000) } });
    }
  }

  // Rent charges + payments for key months
  type RentEntry = { id: string; tenantId: string; leaseId: string; apartmentId: string; amount: number; month: string; paid: boolean; paidDate?: Date };
  const rentEntries: RentEntry[] = [
    // Carlos
    { id: 'r1-oct', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 850, month: '2025-10', paid: true, paidDate: new Date('2025-10-03') },
    { id: 'r1-nov', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 850, month: '2025-11', paid: true, paidDate: new Date('2025-11-04') },
    { id: 'r1-dec', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 850, month: '2025-12', paid: true, paidDate: new Date('2025-12-02') },
    { id: 'r1-jan', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 850, month: '2026-01', paid: true, paidDate: new Date('2026-01-03') },
    { id: 'r1-feb', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 850, month: '2026-02', paid: true, paidDate: new Date('2026-02-04') },
    { id: 'r1-mar', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', amount: 850, month: '2026-03', paid: false },
    // Laura
    { id: 'r2-oct', tenantId: 'tenant-2', leaseId: 'lease-2', apartmentId: 'apt-1b', amount: 1100, month: '2025-10', paid: true, paidDate: new Date('2025-10-08') },
    { id: 'r2-nov', tenantId: 'tenant-2', leaseId: 'lease-2', apartmentId: 'apt-1b', amount: 1100, month: '2025-11', paid: true, paidDate: new Date('2025-11-06') },
    { id: 'r2-jan', tenantId: 'tenant-2', leaseId: 'lease-2', apartmentId: 'apt-1b', amount: 1100, month: '2026-01', paid: true, paidDate: new Date('2026-01-06') },
    { id: 'r2-feb', tenantId: 'tenant-2', leaseId: 'lease-2', apartmentId: 'apt-1b', amount: 1100, month: '2026-02', paid: false },
    { id: 'r2-mar', tenantId: 'tenant-2', leaseId: 'lease-2', apartmentId: 'apt-1b', amount: 1100, month: '2026-03', paid: false },
    // Martín
    { id: 'r3-dec', tenantId: 'tenant-3', leaseId: 'lease-3', apartmentId: 'apt-101', amount: 700, month: '2025-12', paid: true, paidDate: new Date('2025-12-03') },
    { id: 'r3-jan', tenantId: 'tenant-3', leaseId: 'lease-3', apartmentId: 'apt-101', amount: 700, month: '2026-01', paid: true, paidDate: new Date('2026-01-07') },
    { id: 'r3-feb', tenantId: 'tenant-3', leaseId: 'lease-3', apartmentId: 'apt-101', amount: 700, month: '2026-02', paid: true, paidDate: new Date('2026-02-05') },
    { id: 'r3-mar', tenantId: 'tenant-3', leaseId: 'lease-3', apartmentId: 'apt-101', amount: 700, month: '2026-03', paid: false },
    // Ana
    { id: 'r4-jan', tenantId: 'tenant-4', leaseId: 'lease-4', apartmentId: 'apt-301', amount: 1200, month: '2026-01', paid: true, paidDate: new Date('2026-01-05') },
    { id: 'r4-feb', tenantId: 'tenant-4', leaseId: 'lease-4', apartmentId: 'apt-301', amount: 1200, month: '2026-02', paid: true, paidDate: new Date('2026-02-10') },
    { id: 'r4-mar', tenantId: 'tenant-4', leaseId: 'lease-4', apartmentId: 'apt-301', amount: 1200, month: '2026-03', paid: false },
    // Roberto
    { id: 'r5-nov', tenantId: 'tenant-5', leaseId: 'lease-5', apartmentId: 'apt-c1', amount: 1400, month: '2025-11', paid: true, paidDate: new Date('2025-11-04') },
    { id: 'r5-dec', tenantId: 'tenant-5', leaseId: 'lease-5', apartmentId: 'apt-c1', amount: 1400, month: '2025-12', paid: true, paidDate: new Date('2025-12-06') },
    { id: 'r5-jan', tenantId: 'tenant-5', leaseId: 'lease-5', apartmentId: 'apt-c1', amount: 1400, month: '2026-01', paid: true, paidDate: new Date('2026-01-05') },
    { id: 'r5-feb', tenantId: 'tenant-5', leaseId: 'lease-5', apartmentId: 'apt-c1', amount: 1400, month: '2026-02', paid: true, paidDate: new Date('2026-02-04') },
    { id: 'r5-mar', tenantId: 'tenant-5', leaseId: 'lease-5', apartmentId: 'apt-c1', amount: 1400, month: '2026-03', paid: false },
    // Sofía
    { id: 'r6-feb', tenantId: 'tenant-6', leaseId: 'lease-6', apartmentId: 'apt-2b', amount: 1600, month: '2026-02', paid: true, paidDate: new Date('2026-02-05') },
    { id: 'r6-mar', tenantId: 'tenant-6', leaseId: 'lease-6', apartmentId: 'apt-2b', amount: 1600, month: '2026-03', paid: false },
    // Diego
    { id: 'r7-oct', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 1800, month: '2025-10', paid: true, paidDate: new Date('2025-10-05') },
    { id: 'r7-nov', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 1800, month: '2025-11', paid: true, paidDate: new Date('2025-11-07') },
    { id: 'r7-dec', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 1800, month: '2025-12', paid: true, paidDate: new Date('2025-12-04') },
    { id: 'r7-jan', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 1800, month: '2026-01', paid: true, paidDate: new Date('2026-01-06') },
    { id: 'r7-feb', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 1800, month: '2026-02', paid: false },
    { id: 'r7-mar', tenantId: 'tenant-7', leaseId: 'lease-7', apartmentId: 'apt-c3', amount: 1800, month: '2026-03', paid: false },
  ];

  for (const r of rentEntries) {
    // DEBIT charge
    await prisma.ledgerEntry.upsert({
      where: { id: `led-${r.id}-db` },
      update: {},
      create: {
        id: `led-${r.id}-db`,
        type: 'CHARGE', category: 'RENT', direction: 'DEBIT',
        amount: r.amount, description: `Rent charge ${r.month}`,
        referenceId: `pay-${r.id}`, referenceType: 'Payment',
        billingMonth: r.month,
        tenantId: r.tenantId, leaseId: r.leaseId, apartmentId: r.apartmentId,
        createdAt: new Date(`${r.month}-01`),
      },
    });
    // CREDIT payment (only if paid)
    if (r.paid && r.paidDate) {
      await prisma.ledgerEntry.upsert({
        where: { id: `led-${r.id}-cr` },
        update: {},
        create: {
          id: `led-${r.id}-cr`,
          type: 'PAYMENT', category: 'RENT', direction: 'CREDIT',
          amount: r.amount, description: `Rent payment received ${r.month}`,
          referenceId: `pay-${r.id}`, referenceType: 'Payment',
          billingMonth: r.month,
          tenantId: r.tenantId, leaseId: r.leaseId, apartmentId: r.apartmentId,
          createdAt: r.paidDate,
        },
      });
    }
  }

  // Maintenance payment records (so charges can be marked as paid from the UI)
  await prisma.payment.upsert({ where: { id: 'pay-maint-1' }, update: {}, create: { id: 'pay-maint-1', leaseId: 'lease-1', tenantId: 'tenant-1', amount: 90, dueDate: new Date('2026-01-20'), type: 'MAINTENANCE', status: 'PENDING', notes: 'Maintenance charge: Canilla rota en baño', maintenanceRequestId: 'maint-1' } });
  await prisma.payment.upsert({ where: { id: 'pay-maint-6' }, update: {}, create: { id: 'pay-maint-6', leaseId: 'lease-4', tenantId: 'tenant-4', amount: 240, dueDate: new Date('2026-02-05'), type: 'MAINTENANCE', status: 'PENDING', notes: 'Maintenance charge: Vidrio roto ventana', maintenanceRequestId: 'maint-6' } });

  // Maintenance charges (ledger)
  await prisma.ledgerEntry.upsert({ where: { id: 'led-maint-1' }, update: {}, create: { id: 'led-maint-1', type: 'CHARGE', category: 'MAINTENANCE', direction: 'DEBIT', amount: 90, description: 'Maintenance charge: Canilla rota en baño', referenceId: 'maint-1', referenceType: 'MaintenanceRequest', tenantId: 'tenant-1', leaseId: 'lease-1', apartmentId: 'apt-1a', createdAt: new Date('2026-01-20') } });
  await prisma.ledgerEntry.upsert({ where: { id: 'led-maint-6' }, update: {}, create: { id: 'led-maint-6', type: 'CHARGE', category: 'MAINTENANCE', direction: 'DEBIT', amount: 240, description: 'Maintenance charge: Vidrio roto ventana', referenceId: 'maint-6', referenceType: 'MaintenanceRequest', tenantId: 'tenant-4', leaseId: 'lease-4', apartmentId: 'apt-301', createdAt: new Date('2026-02-05') } });

  console.log('✅ Ledger entries created');

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!');
  console.log('   Users:         2  (admin@pms.com / manager@pms.com — password: Admin123!)');
  console.log('   Complexes:     3');
  console.log('   Apartments:    13 (7 occupied, 4 available, 1 maintenance)');
  console.log('   Tenants:       7');
  console.log('   Leases:        8  (7 active, 1 terminated)');
  console.log('   Payments:      36 (deposits + multi-month rent, mix of paid/pending/overdue)');
  console.log('   Maintenance:   8  (2 resolved w/ charges, 1 closed, 2 in progress, 2 open)');
  console.log('   Expenses:      21 (spread across 3 complexes and 4 months)');
  console.log('   Ledger entries: deposits + rent charges/payments for 6 months');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
