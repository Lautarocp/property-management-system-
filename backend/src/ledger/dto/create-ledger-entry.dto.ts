import { LedgerEntryType, LedgerEntryCategory, LedgerEntryDirection } from '@prisma/client';

export class CreateLedgerEntryDto {
  type!: LedgerEntryType;
  category!: LedgerEntryCategory;
  direction!: LedgerEntryDirection;
  amount!: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  billingMonth?: string;
  tenantId!: string;
  leaseId?: string;
  apartmentId!: string;
}
