import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  FileDown, 
  FileSpreadsheet, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Save,
  Thermometer,
  Timer,
  Gauge,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF with autotable types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface SterilizationCycle {
  id: string;
  batchId: string;
  date: string;
  temperature: number;
  pressure: number;
  time: number;
  chemicalIndicator: boolean;
  biologicalIndicator: boolean;
  status: 'Success' | 'Failure';
  operator: string;
  notes?: string;
}

const SAMPLE_DATA: SterilizationCycle[] = [
  {
    id: '1',
    batchId: 'LOT-2024-001',
    date: '2024-04-10T09:00:00',
    temperature: 134,
    pressure: 2.1,
    time: 20,
    chemicalIndicator: true,
    biologicalIndicator: true,
    status: 'Success',
    operator: 'Dr. Ambriz'
  },
  {
    id: '2',
    batchId: 'LOT-2024-002',
    date: '2024-04-11T10:30:00',
    temperature: 134,
    pressure: 2.1,
    time: 20,
    chemicalIndicator: true,
    biologicalIndicator: true,
    status: 'Success',
    operator: 'Asistente Laura'
  },
  {
    id: '3',
    batchId: 'LOT-2024-003',
    date: '2024-04-12T15:00:00',
    temperature: 121,
    pressure: 1.1,
    time: 15,
    chemicalIndicator: false,
    biologicalIndicator: false,
    status: 'Failure',
    operator: 'Dr. Ambriz',
    notes: 'Falla en sello de puerta, presión insuficiente'
  }
];

export default function SterilizationModule() {
  const [cycles, setCycles] = useState<SterilizationCycle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<SterilizationCycle | null>(null);
  const [formData, setFormData] = useState<Partial<SterilizationCycle>>({
    batchId: '',
    date: new Date().toISOString().slice(0, 16),
    temperature: 134,
    pressure: 2.1,
    time: 20,
    chemicalIndicator: true,
    biologicalIndicator: true,
    status: 'Success',
    operator: ''
  });

  // Load from localStorage (Offline Capability)
  useEffect(() => {
    const saved = localStorage.getItem('sterilization_cycles');
    if (saved) {
      setCycles(JSON.parse(saved));
    } else {
      setCycles(SAMPLE_DATA);
      localStorage.setItem('sterilization_cycles', JSON.stringify(SAMPLE_DATA));
    }
  }, []);

  // Save to localStorage whenever cycles change
  useEffect(() => {
    if (cycles.length > 0) {
      localStorage.setItem('sterilization_cycles', JSON.stringify(cycles));
    }
  }, [cycles]);

  const handleSave = () => {
    if (!formData.batchId || !formData.operator) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const newCycle: SterilizationCycle = {
      id: editingCycle?.id || Math.random().toString(36).substr(2, 9),
      batchId: formData.batchId!,
      date: formData.date!,
      temperature: Number(formData.temperature),
      pressure: Number(formData.pressure),
      time: Number(formData.time),
      chemicalIndicator: formData.chemicalIndicator!,
      biologicalIndicator: formData.biologicalIndicator!,
      status: formData.status as 'Success' | 'Failure',
      operator: formData.operator!,
      notes: formData.notes
    };

    if (editingCycle) {
      setCycles(cycles.map(c => c.id === editingCycle.id ? newCycle : c));
      toast.success('Ciclo actualizado');
    } else {
      setCycles([newCycle, ...cycles]);
      toast.success('Ciclo registrado exitosamente');
    }

    setIsDialogOpen(false);
    setEditingCycle(null);
    setFormData({
      batchId: '',
      date: new Date().toISOString().slice(0, 16),
      temperature: 134,
      pressure: 2.1,
      time: 20,
      chemicalIndicator: true,
      biologicalIndicator: true,
      status: 'Success',
      operator: ''
    });
  };

  const deleteCycle = (id: string) => {
    setCycles(cycles.filter(c => c.id !== id));
    toast.success('Registro eliminado');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Bitácora de Esterilización - Podología Pro', 14, 15);
    
    const tableData = cycles.map(c => [
      c.batchId,
      new Date(c.date).toLocaleString(),
      `${c.temperature}°C`,
      `${c.pressure} bar`,
      `${c.time} min`,
      c.status === 'Success' ? 'ÉXITO' : 'FALLA',
      c.operator
    ]);

    doc.autoTable({
      head: [['Lote', 'Fecha', 'Temp', 'Presión', 'Tiempo', 'Estado', 'Operador']],
      body: tableData,
      startY: 20,
    });

    doc.save('bitacora_esterilizacion.pdf');
    toast.success('PDF exportado');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(cycles);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bitácora");
    XLSX.writeFile(wb, "bitacora_esterilizacion.xlsx");
    toast.success('Excel exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Trazabilidad de Esterilización</h3>
          <p className="text-slate-500 text-sm">Control de bioseguridad y cumplimiento normativo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportPDF} className="rounded-xl glass">
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel} className="rounded-xl glass">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ciclo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-white/60">
              <DialogHeader>
                <DialogTitle>{editingCycle ? 'Editar Ciclo' : 'Nuevo Ciclo de Autoclave'}</DialogTitle>
                <DialogDescription>Registra los parámetros técnicos del proceso de esterilización.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>ID Lote</Label>
                    <Input value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} placeholder="LOT-2024-XXX" className="glass" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fecha/Hora</Label>
                    <Input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="glass" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Temp (°C)</Label>
                    <Input type="number" value={formData.temperature} onChange={e => setFormData({...formData, temperature: Number(e.target.value)})} className="glass" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Presión (bar)</Label>
                    <Input type="number" step="0.1" value={formData.pressure} onChange={e => setFormData({...formData, pressure: Number(e.target.value)})} className="glass" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tiempo (min)</Label>
                    <Input type="number" value={formData.time} onChange={e => setFormData({...formData, time: Number(e.target.value)})} className="glass" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Operador</Label>
                    <Input value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} placeholder="Nombre" className="glass" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Estado Final</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as any})}>
                      <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Success">Éxito</SelectItem>
                        <SelectItem value="Failure">Falla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} className="w-full rounded-xl">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCycle ? 'Actualizar' : 'Guardar Registro'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Responsive Table / Cards */}
      <div className="hidden md:block">
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/20 bg-white/10">
                  <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Lote</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Fecha</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Parámetros</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Estado</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Operador</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map(cycle => (
                  <tr key={cycle.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-700">{cycle.batchId}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(cycle.date).toLocaleDateString()}
                      <br />
                      <span className="text-[10px]">{new Date(cycle.date).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-3 text-xs">
                        <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {cycle.temperature}°C</span>
                        <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {cycle.pressure}b</span>
                        <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {cycle.time}m</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={cycle.status === 'Success' ? 'outline' : 'destructive'} className="rounded-lg">
                        {cycle.status === 'Success' ? 'EXITOSO' : 'FALLA'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm">{cycle.operator}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingCycle(cycle);
                          setFormData(cycle);
                          setIsDialogOpen(true);
                        }} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCycle(cycle.id)} className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {cycles.map(cycle => (
          <Card key={cycle.id} className={`glass-card ${cycle.status === 'Failure' ? 'border-red-500/50' : ''}`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{cycle.batchId}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(cycle.date).toLocaleString()}
                  </p>
                </div>
                <Badge variant={cycle.status === 'Success' ? 'outline' : 'destructive'} className="rounded-lg">
                  {cycle.status === 'Success' ? 'EXITOSO' : 'FALLA'}
                </Badge>
              </div>

              {cycle.status === 'Failure' && (
                <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-xl flex items-center gap-2 text-red-600 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>RIESGO SANITARIO: Ciclo no válido</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Temp</p>
                  <p className="text-sm font-bold">{cycle.temperature}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Presión</p>
                  <p className="text-sm font-bold">{cycle.pressure}b</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Tiempo</p>
                  <p className="text-sm font-bold">{cycle.time}m</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <UserIcon className="h-3 w-3" />
                  {cycle.operator}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingCycle(cycle);
                    setFormData(cycle);
                    setIsDialogOpen(true);
                  }} className="rounded-lg">Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCycle(cycle.id)} className="text-red-500 rounded-lg">Borrar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
