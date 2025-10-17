export interface User {
  uid: string;
  email: string;
  displayName?: string;
  language?: string;
}

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  userId: string;
}

export interface SymptomCheck {
  id: string;
  symptoms: string[];
  result: string;
  timestamp: string;
  userId: string;
}

export interface FirstAidCategory {
  id: string;
  title: string;
  description: string;
  steps: string[];
  icon: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface BloodDonor {
  id: string;
  userId: string;
  name: string;
  bloodType: string;
  age: number;
  weight: number;
  phone: string;
  email: string;
  address: string;
  lastDonationDate?: string;
  isEligible: boolean;
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

export interface BloodDonation {
  id: string;
  donorId: string;
  donationDate: string;
  bloodBankId: string;
  bloodBankName: string;
  donationType: 'whole_blood' | 'plasma' | 'platelets' | 'red_cells';
  volume: number;
  notes?: string;
  nextEligibleDate: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  operatingHours: string;
  bloodTypes: string[];
  urgentNeeds: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}