import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Image as ImageIcon, 
  LayoutDashboard,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { auth, signIn, logout, db } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, limit, where } from 'firebase/firestore';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ScrollArea } from './components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Patient {
  id: string;
  fullName: string;
  isDiabetic: boolean;
  isMinor: boolean;
  phone: string;
  lastVisit?: any;
}

interface Consultation {
  id: string;
  patientId: string;
  date: any;
  type: string;
  assessment: string;
  subjective: string;
  objective: string;
  plan: string;
}

interface BiosecurityCycle {
  id: string;
  cycleId: string;
  date: any;
  status: 'Success' | 'Failure';
  operator: string;
}

import { seedData } from '@/lib/seed';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import DiabeticFootEvaluation from '@/components/DiabeticFootEvaluation';
import SterilizationModule from '@/components/SterilizationModule';
import BiomechanicsModule from '@/components/BiomechanicsModule';
import { Download } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [biosecurityLogs, setBiosecurityLogs] = useState<BiosecurityCycle[]>([]);

  // Form states
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    birthDate: '',
    isDiabetic: false,
    isMinor: false,
    phone: '',
    email: ''
  });

  const handleAddPatient = async () => {
    try {
      await addDoc(collection(db, 'patients'), {
        ...newPatient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsNewPatientOpen(false);
      toast.success('Paciente registrado exitosamente');
      setNewPatient({ fullName: '', birthDate: '', isDiabetic: false, isMinor: false, phone: '', email: '' });
    } catch (error) {
      toast.error('Error al registrar paciente');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isGuest) {
        setUser(user);
        if (user) {
          toast.success(`Bienvenido, ${user.displayName}`);
          seedData(); // Seed data if empty
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isGuest]);

  useEffect(() => {
    if (!user) return;

    // Fetch Patients
    const qPatients = query(collection(db, 'patients'), limit(50));
    const unsubPatients = onSnapshot(qPatients, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
    });

    // Fetch Biosecurity
    const qBio = query(collection(db, 'biosecurity'), orderBy('date', 'desc'), limit(5));
    const unsubBio = onSnapshot(qBio, (snapshot) => {
      setBiosecurityLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BiosecurityCycle)));
    });

    return () => {
      unsubPatients();
      unsubBio();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8 glass-card p-8 shadow-2xl"
        >
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Activity className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Podólogo Dr. Ambríz</h1>
            <p className="text-slate-500">Gestión clínica especializada y cumplimiento NOM-024</p>
          </div>
          <Button 
            onClick={() => {
              setIsGuest(true);
              setUser({ uid: 'demo-user', email: 'demo@podologia.com', displayName: 'Dr. Ambríz' } as any);
            }} 
            className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            Acceder al Dashboard
          </Button>
          <p className="text-xs text-slate-400">
            Modo demostración sin credenciales.
          </p>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'consultations', label: 'Consultas', icon: Calendar },
    { id: 'biosecurity', label: 'Bioseguridad', icon: ShieldCheck },
    { id: 'biomechanics', label: 'Biomecánica', icon: Activity },
    { id: 'gallery', label: 'Galería', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <header className="md:hidden bg-white/45 backdrop-blur-md border-b border-white/60 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Podólogo Dr. Ambríz</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white/45 backdrop-blur-lg border-r border-white/60 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="hidden md:flex items-center gap-3 px-2 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">Podólogo Dr. Ambríz</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-600 hover:bg-slate-100'}
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 mb-4">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={logout}>
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {navItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500">
                {activeTab === 'dashboard' ? 'Resumen diario y métricas clave' : `Gestión de ${navItems.find(i => i.id === activeTab)?.label.toLowerCase()}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {deferredPrompt && (
                <Button variant="outline" onClick={handleInstall} className="rounded-xl glass border-primary/30 text-primary">
                  <Download className="h-4 w-4 mr-2" />
                  Instalar App
                </Button>
              )}
              <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
                <DialogTrigger>
                  <Button className="rounded-xl shadow-md">
                    <Plus className="h-5 w-5 mr-2" />
                    Nuevo Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glass-card border-white/60">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
                    <DialogDescription>
                      Ingresa los datos básicos para abrir el expediente clínico.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input id="name" value={newPatient.fullName} onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})} placeholder="Ej. Juan Pérez" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="birth">Fecha de Nacimiento</Label>
                        <Input id="birth" type="date" value={newPatient.birthDate} onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} placeholder="555-0000" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="diabetic" checked={newPatient.isDiabetic} onChange={(e) => setNewPatient({...newPatient, isDiabetic: e.target.checked})} className="rounded border-slate-300 text-primary focus:ring-primary" />
                        <Label htmlFor="diabetic" className="text-sm">Diabético</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="minor" checked={newPatient.isMinor} onChange={(e) => setNewPatient({...newPatient, isMinor: e.target.checked})} className="rounded border-slate-300 text-primary focus:ring-primary" />
                        <Label htmlFor="minor" className="text-sm">Menor de Edad</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddPatient} className="w-full rounded-xl">Guardar Paciente</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedPatient ? (
                <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
              ) : (
                <>
                  {activeTab === 'dashboard' && <DashboardView patients={patients} biosecurity={biosecurityLogs} onSelectPatient={setSelectedPatient} />}
                  {activeTab === 'patients' && <PatientsView patients={patients} onSelectPatient={setSelectedPatient} />}
                  {activeTab === 'biosecurity' && <SterilizationModule />}
                  {activeTab === 'biomechanics' && <BiomechanicsModule />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardView({ patients, biosecurity, onSelectPatient }: { patients: Patient[], biosecurity: BiosecurityCycle[], onSelectPatient: (p: Patient) => void }) {
  const diabeticPatients = patients.filter(p => p.isDiabetic);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Widget 1: Próximas Citas */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Citas de Hoy
            </CardTitle>
            <Badge variant="secondary" className="rounded-lg">4 Pendientes</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.slice(0, 3).map((p, i) => (
              <div key={p.id} onClick={() => onSelectPatient(p)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="h-10 w-10 glass rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-500">
                  <span>09:{30 + (i * 15)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{p.fullName}</p>
                  <p className="text-xs text-slate-500">{p.isDiabetic ? 'Pie Diabético' : 'Podología General'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Widget 2: Alertas de Bioseguridad */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Bioseguridad
          </CardTitle>
          <CardDescription>Últimos ciclos de autoclave</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {biosecurity.length > 0 ? biosecurity.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <div className="flex items-center gap-3">
                  {log.status === 'Success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ciclo #{log.cycleId}</p>
                    <p className="text-xs text-slate-500">{log.operator}</p>
                  </div>
                </div>
                <Badge variant={log.status === 'Success' ? 'outline' : 'destructive'} className="rounded-lg">
                  {log.status === 'Success' ? 'Correcto' : 'Error'}
                </Badge>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400 italic">No hay registros recientes</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Widget 3: Pacientes Diabéticos */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Riesgo: Pie Diabético
          </CardTitle>
          <CardDescription>Pacientes que requieren atención prioritaria</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[240px] pr-4">
            <div className="space-y-3">
              {diabeticPatients.map((patient) => (
                <div key={patient.id} className="p-3 rounded-2xl border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-slate-900">{patient.fullName}</p>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg text-[10px]">ALTO RIESGO</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>Última revisión: Hace 15 días</span>
                  </div>
                </div>
              ))}
              {diabeticPatients.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic">No hay pacientes registrados</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Widget 4: Biomecánica & Plantillas */}
      <Card className="glass-card overflow-hidden lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Producción de Plantillas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">En Diseño</p>
              <p className="text-2xl font-bold text-blue-900">12</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">En Fabricación</p>
              <p className="text-2xl font-bold text-amber-900">5</p>
            </div>
            <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Listas para Entrega</p>
              <p className="text-2xl font-bold text-green-900">8</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget 5: Galería Reciente */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-purple-500" />
            Galería Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative group cursor-pointer">
                <img 
                  src={`https://picsum.photos/seed/foot${i}/200/200`} 
                  alt="Clinical" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold uppercase">Ver Evolución</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientsView({ patients, onSelectPatient }: { patients: Patient[], onSelectPatient: (p: Patient) => void }) {
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listado de Pacientes</CardTitle>
          <CardDescription>Gestiona la información y expedientes clínicos</CardDescription>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar paciente..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/60 bg-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Paciente</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Condición</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contacto</th>
                <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 glass rounded-xl">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {patient.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">{patient.fullName}</p>
                        <p className="text-xs text-slate-500">ID: {patient.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {patient.isDiabetic && <Badge className="bg-red-100 text-red-700 border-none rounded-lg text-[10px]">DIABÉTICO</Badge>}
                      {patient.isMinor && <Badge className="bg-blue-100 text-blue-700 border-none rounded-lg text-[10px]">MENOR</Badge>}
                      {!patient.isDiabetic && !patient.isMinor && <Badge variant="outline" className="rounded-lg text-[10px]">GENERAL</Badge>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{patient.phone}</td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => onSelectPatient(patient)}>
                      Ver Expediente
                    </Button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 italic">
                    No se encontraron pacientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientDetailView({ patient, onBack }: { patient: Patient, onBack: () => void }) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '', type: 'General' });

  useEffect(() => {
    const q = query(collection(db, `patients/${patient.id}/consultations`), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setConsultations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation)));
    });
  }, [patient.id]);

  const handleAddConsultation = async () => {
    try {
      await addDoc(collection(db, `patients/${patient.id}/consultations`), {
        ...soap,
        patientId: patient.id,
        date: serverTimestamp()
      });
      setIsConsultationOpen(false);
      toast.success('Consulta guardada exitosamente');
      setSoap({ subjective: '', objective: '', assessment: '', plan: '', type: 'General' });
    } catch (error) {
      toast.error('Error al guardar consulta');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <X className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 glass rounded-2xl">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {patient.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{patient.fullName}</h3>
            <div className="flex gap-2">
              {patient.isDiabetic && <Badge className="bg-red-100 text-red-700 border-none rounded-lg text-[10px]">DIABÉTICO</Badge>}
              {patient.isMinor && <Badge className="bg-blue-100 text-blue-700 border-none rounded-lg text-[10px]">MENOR</Badge>}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="bg-white/45 backdrop-blur-md p-1 rounded-2xl border border-white/60 mb-6">
          <TabsTrigger value="history" className="rounded-xl px-6 data-[state=active]:glass">Historial Clínico</TabsTrigger>
          <TabsTrigger value="diabetic" className="rounded-xl px-6 data-[state=active]:glass">Pie Diabético</TabsTrigger>
          <TabsTrigger value="biomechanics" className="rounded-xl px-6 data-[state=active]:glass">Biomecánica</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-xl px-6 data-[state=active]:glass">Galería</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-bold">Consultas Recientes</h4>
            <Dialog open={isConsultationOpen} onOpenChange={setIsConsultationOpen}>
              <DialogTrigger>
                <Button className="rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Consulta (SOAP)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] glass-card border-white/60">
                <DialogHeader>
                  <DialogTitle>Nueva Consulta Clínica</DialogTitle>
                  <DialogDescription>Formato S.O.A.P. según NOM-004</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Consulta</Label>
                    <Select value={soap.type} onValueChange={(v) => setSoap({...soap, type: v})}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">Podología General</SelectItem>
                        <SelectItem value="Diabetic Foot">Pie Diabético</SelectItem>
                        <SelectItem value="Pediatric">Pediátrica</SelectItem>
                        <SelectItem value="Orthotics">Ortopedia/Plantillas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>S: Subjetivo</Label>
                      <textarea className="min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Síntomas, motivo de consulta..." value={soap.subjective} onChange={(e) => setSoap({...soap, subjective: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>O: Objetivo</Label>
                      <textarea className="min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Hallazgos clínicos, signos..." value={soap.objective} onChange={(e) => setSoap({...soap, objective: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>A: Análisis/Diagnóstico</Label>
                      <textarea className="min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Impresión diagnóstica..." value={soap.assessment} onChange={(e) => setSoap({...soap, assessment: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>P: Plan/Tratamiento</Label>
                      <textarea className="min-h-[100px] p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Tratamiento, indicaciones..." value={soap.plan} onChange={(e) => setSoap({...soap, plan: e.target.value})} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddConsultation} className="w-full rounded-xl">Guardar Consulta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {consultations.map((c) => (
              <Card key={c.id} className="glass-card overflow-hidden">
                <CardHeader className="bg-white/20 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-bold">{new Date(c.date?.seconds * 1000).toLocaleDateString()}</span>
                      <Badge variant="outline" className="rounded-lg">{c.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Subjetivo & Objetivo</h5>
                      <p className="text-sm text-slate-700 mb-4"><span className="font-bold">S:</span> {c.subjective}</p>
                      <p className="text-sm text-slate-700"><span className="font-bold">O:</span> {c.objective}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Diagnóstico & Plan</h5>
                      <p className="text-sm text-slate-700 mb-4"><span className="font-bold">A:</span> {c.assessment}</p>
                      <p className="text-sm text-slate-700"><span className="font-bold">P:</span> {c.plan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {consultations.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">
                No hay consultas registradas para este paciente.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="diabetic" className="space-y-6">
          <DiabeticFootEvaluation patientId={patient.id} />
        </TabsContent>

        <TabsContent value="biomechanics">
          <Card className="glass-card p-8 text-center">
            <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-2">Estudio Biomecánico</h4>
            <p className="text-slate-500 mb-6">Análisis de marcha, ángulos y prescripción de plantillas ortopédicas.</p>
            <Button variant="outline" className="rounded-xl">Iniciar Nuevo Estudio</Button>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
              <Plus className="h-8 w-8 text-slate-300 mb-2" />
              <span className="text-xs font-bold text-slate-400 uppercase">Añadir Foto</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

