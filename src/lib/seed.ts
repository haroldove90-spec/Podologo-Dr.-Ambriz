import { db } from '@/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export async function seedData() {
  const patientsSnap = await getDocs(collection(db, 'patients'));
  if (!patientsSnap.empty) return;

  console.log('Seeding initial data...');

  const patients = [
    {
      fullName: 'Juan Pérez García',
      birthDate: '1975-05-12',
      isDiabetic: true,
      isMinor: false,
      phone: '555-0123',
      email: 'juan.perez@example.com',
      createdAt: serverTimestamp(),
    },
    {
      fullName: 'María Rodríguez Sosa',
      birthDate: '1988-11-20',
      isDiabetic: false,
      isMinor: false,
      phone: '555-4567',
      email: 'maria.rod@example.com',
      createdAt: serverTimestamp(),
    },
    {
      fullName: 'Carlos Ruiz López (Menor)',
      birthDate: '2015-03-15',
      isDiabetic: false,
      isMinor: true,
      phone: '555-9876',
      email: 'padre.carlos@example.com',
      createdAt: serverTimestamp(),
    }
  ];

  for (const p of patients) {
    await addDoc(collection(db, 'patients'), p);
  }

  const bioLogs = [
    {
      cycleId: '2024-001',
      date: serverTimestamp(),
      operator: 'Dr. Harold',
      materialBatch: 'LOT-9921',
      status: 'Success',
      notes: 'Ciclo estándar completado sin incidencias.'
    },
    {
      cycleId: '2024-002',
      date: serverTimestamp(),
      operator: 'Enf. Ana',
      materialBatch: 'LOT-9922',
      status: 'Success',
      notes: 'Instrumental de cirugía menor.'
    }
  ];

  for (const log of bioLogs) {
    await addDoc(collection(db, 'biosecurity'), log);
  }
}
