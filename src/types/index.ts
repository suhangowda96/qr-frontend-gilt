export type VerificationStatus = 'verified' | 'invalid' | 'tampered' | 'revoked';

export interface VerificationResult {
  id: string;
  name: string;
  district: string;
  registrationDate: string;
  status: VerificationStatus;
}

export interface VerificationRecord {
  id: string;
  name: string;
  district: string;
  state: string;
  registrationDate: string;
  contact: string;
  status: 'active' | 'revoked' | 'pending';
}

export interface ScanLog {
  id: string;
  date: string;
  ipAddress: string;
  recordId: string;
  result: VerificationStatus;
}

export interface QRItem {
  id: string;
  recordId: string;
  recordName: string;
  status: 'active' | 'revoked';
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}
