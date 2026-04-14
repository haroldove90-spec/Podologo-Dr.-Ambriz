import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Settings, 
  Save, 
  FileDown, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronRight,
  ClipboardList,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface BiomechanicsStudy {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  morphology: string;
  gaitAnalysis: {
    stance: string;
    swing: string;
    toeOff: string;
  };
  jointRanges: {
    ankle: string;
    subtalar: string;
    firstMeta: string;
  };
  orthotics: {
    material: string;
    elements: string[];
    labInstructions: string;
  };
  status: 'Prescribed' | 'Manufacturing' | 'Delivered';
}

const SAMPLE_BIOMECHANICS: BiomechanicsStudy[] = [
  {
    id: 'b1',
    patientId: 'p1',
    patientName: 'Juan Pérez',
    date: '2024-04-10T10:00:00',
    morphology: 'Pie Plano Valgo Grado II',
    gaitAnalysis: {
      stance: 'Pronación excesiva en contacto inicial',
      swing: 'Normal',
      toeOff: 'Propulsión disminuida'
    },
    jointRanges: {
      ankle: '10° Dorsiflexión',
      subtalar: 'Eversión limitada',
      firstMeta: 'Hallux Limitus funcional'
    },
    orthotics: {
      material: 'Polipropileno 3mm',
      elements: ['Arco longitudinal interno', 'Cuña supinadora de talón'],
      labInstructions: 'Forro de EVA 2mm azul, pulido fino lateral.'
    },
    status: 'Prescribed'
  },
  {
    id: 'b2',
    patientId: 'p2',
    patientName: 'María García',
    date: '2024-04-12T11:30:00',
    morphology: 'Pie Cavo Suclínico',
    gaitAnalysis: {
      stance: 'Supinación en mediopié',
      swing: 'Circunducción leve',
      toeOff: 'Normal'
    },
    jointRanges: {
      ankle: '15° Dorsiflexión',
      subtalar: 'Rango amplio',
      firstMeta: 'Normal'
    },
    orthotics: {
      material: 'Resina Flux',
      elements: ['Barra metatarsal', 'Descarga selectiva 1er meta'],
      labInstructions: 'Caso de fascitis plantar recalcitrante. Máximo confort.'
    },
    status: 'Manufacturing'
  }
];

export default function BiomechanicsModule() {
  const [studies, setStudies] = useState<BiomechanicsStudy[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [editingStudy, setEditingStudy] = useState<Partial<BiomechanicsStudy> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('biomechanics_studies');
    if (saved) {
      setStudies(JSON.parse(saved));
    } else {
      setStudies(SAMPLE_BIOMECHANICS);
      localStorage.setItem('biomechanics_studies', JSON.stringify(SAMPLE_BIOMECHANICS));
    }
  }, []);

  const handleSave = () => {
    if (!editingStudy?.patientName) {
      toast.error('Nombre del paciente es requerido');
      return;
    }

    const newStudy = {
      ...editingStudy,
      id: editingStudy.id || Math.random().toString(36).substr(2, 9),
      date: editingStudy.date || new Date().toISOString(),
      status: editingStudy.status || 'Prescribed'
    } as BiomechanicsStudy;

    const updatedStudies = editingStudy.id 
      ? studies.map(s => s.id === editingStudy.id ? newStudy : s)
      : [newStudy, ...studies];

    setStudies(updatedStudies);
    localStorage.setItem('biomechanics_studies', JSON.stringify(updatedStudies));
    toast.success('Estudio biomecánico guardado');
    setActiveView('list');
    setEditingStudy(null);
  };

  const exportWorkOrder = (study: BiomechanicsStudy) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('ORDEN DE TRABAJO - ORTOPODOLOGÍA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Dr. Ambríz - Podología Especializada`, 105, 28, { align: 'center' });
    
    // Patient Info
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(10);
    doc.text(`Paciente: ${study.patientName}`, 20, 45);
    doc.text(`Fecha: ${new Date(study.date).toLocaleDateString()}`, 140, 45);
    doc.text(`ID Estudio: ${study.id}`, 20, 52);
    
    // Orthotics Details
    doc.setFontSize(14);
    doc.text('ESPECIFICACIONES DE LA PLANTILLA', 20, 65);
    
    const tableData = [
      ['Material Base', study.orthotics.material],
      ['Elementos de Corrección', study.orthotics.elements.join(', ')],
      ['Instrucciones Lab', study.orthotics.labInstructions]
    ];
    
    (doc as any).autoTable({
      startY: 70,
      head: [['Campo', 'Detalle']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] }
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Firma del Especialista:', 20, finalY);
    doc.line(20, finalY + 10, 80, finalY + 10);
    
    doc.save(`Orden_Trabajo_${study.patientName.replace(' ', '_')}.pdf`);
    toast.success('Orden de trabajo generada');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(studies.map(s => ({
      Fecha: new Date(s.date).toLocaleDateString(),
      Paciente: s.patientName,
      Morfologia: s.morphology,
      Material: s.orthotics.material,
      Estado: s.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Mensual");
    XLSX.writeFile(wb, "Reporte_Plantillas_Mensual.xlsx");
    toast.success('Reporte Excel generado');
  };

  if (activeView === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setActiveView('list')} className="rounded-xl">
            ← Volver al listado
          </Button>
          <h3 className="text-xl font-bold">Nueva Evaluación Biomecánica</h3>
        </div>

        <Tabs defaultValue="exam" className="w-full">
          <TabsList className="glass p-1 rounded-2xl mb-6">
            <TabsTrigger value="exam" className="rounded-xl px-8">1. Exploración Física</TabsTrigger>
            <TabsTrigger value="orthotics" className="rounded-xl px-8">2. Receta de Plantillas</TabsTrigger>
          </TabsList>

          <TabsContent value="exam" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Morfología y Marcha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Paciente</Label>
                    <Input 
                      value={editingStudy?.patientName || ''} 
                      onChange={e => setEditingStudy({...editingStudy, patientName: e.target.value})}
                      className="glass"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Morfología del Pie</Label>
                    <Select 
                      value={editingStudy?.morphology || ''} 
                      onValueChange={v => setEditingStudy({...editingStudy, morphology: v})}
                    >
                      <SelectTrigger className="glass"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plano">Pie Plano</SelectItem>
                        <SelectItem value="Cavo">Pie Cavo</SelectItem>
                        <SelectItem value="Valgo">Pie Valgo</SelectItem>
                        <SelectItem value="Varo">Pie Varo</SelectItem>
                        <SelectItem value="Normal">Pie Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fase de Apoyo</Label>
                    <Input 
                      value={editingStudy?.gaitAnalysis?.stance || ''} 
                      onChange={e => setEditingStudy({...editingStudy, gaitAnalysis: {...(editingStudy?.gaitAnalysis || {stance:'', swing:'', toeOff:''}), stance: e.target.value}})}
                      className="glass"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fase de Balanceo</Label>
                    <Input 
                      value={editingStudy?.gaitAnalysis?.swing || ''} 
                      onChange={e => setEditingStudy({...editingStudy, gaitAnalysis: {...(editingStudy?.gaitAnalysis || {stance:'', swing:'', toeOff:''}), swing: e.target.value}})}
                      className="glass"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fase de Despegue</Label>
                    <Input 
                      value={editingStudy?.gaitAnalysis?.toeOff || ''} 
                      onChange={e => setEditingStudy({...editingStudy, gaitAnalysis: {...(editingStudy?.gaitAnalysis || {stance:'', swing:'', toeOff:''}), toeOff: e.target.value}})}
                      className="glass"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orthotics" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Configurador de Plantillas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Material Base</Label>
                    <Select 
                      value={editingStudy?.orthotics?.material || ''} 
                      onValueChange={v => setEditingStudy({...editingStudy, orthotics: {...(editingStudy?.orthotics || {material:'', elements:[], labInstructions:''}), material: v}})}
                    >
                      <SelectTrigger className="glass"><SelectValue placeholder="Selecciona material..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EVA">EVA (Etilvinilacetato)</SelectItem>
                        <SelectItem value="Polipropileno">Polipropileno</SelectItem>
                        <SelectItem value="Resina">Resina Flux</SelectItem>
                        <SelectItem value="Cuero">Cuero / Termoplástico</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="space-y-3">
                      <Label>Elementos de Corrección</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Arco Longitudinal', 'Barra Metatarsal', 'Cuña Supinadora', 'Cuña Pronadora', 'Descarga Talón', 'Oliva Metatarsal'].map(el => (
                          <div key={el} className="flex items-center space-x-2">
                            <Checkbox 
                              id={el} 
                              checked={editingStudy?.orthotics?.elements?.includes(el)}
                              onCheckedChange={(checked) => {
                                const current = editingStudy?.orthotics?.elements || [];
                                const next = checked ? [...current, el] : current.filter(x => x !== el);
                                setEditingStudy({...editingStudy, orthotics: {...(editingStudy?.orthotics || {material:'', elements:[], labInstructions:''}), elements: next}});
                              }}
                            />
                            <label htmlFor={el} className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {el}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Instrucciones para Laboratorio</Label>
                    <textarea 
                      className="w-full min-h-[150px] glass p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Especifica forros, grosores, acabados..."
                      value={editingStudy?.orthotics?.labInstructions || ''}
                      onChange={e => setEditingStudy({...editingStudy, orthotics: {...(editingStudy?.orthotics || {material:'', elements:[], labInstructions:''}), labInstructions: e.target.value}})}
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full h-12 rounded-2xl shadow-xl shadow-primary/20 text-lg">
                  <Save className="h-5 w-5 mr-2" />
                  Guardar y Finalizar Prescripción
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Análisis Biomecánico y Ortopodología</h3>
          <p className="text-slate-500 text-sm">Gestión de estudios de marcha y fabricación de plantillas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} className="rounded-xl glass">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Reporte Mensual
          </Button>
          <Button onClick={() => {
            setEditingStudy({});
            setActiveView('form');
          }} className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {studies.map(study => (
          <Card key={study.id} className="glass-card overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{study.patientName}</h4>
                        <p className="text-xs text-slate-500">{new Date(study.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={study.status === 'Prescribed' ? 'outline' : 'secondary'} className="rounded-lg">
                      {study.status === 'Prescribed' ? 'PRESCRITA' : study.status === 'Manufacturing' ? 'EN FABRICACIÓN' : 'ENTREGADA'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/30 p-3 rounded-xl border border-white/40">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Morfología</p>
                      <p className="text-sm font-medium">{study.morphology}</p>
                    </div>
                    <div className="bg-white/30 p-3 rounded-xl border border-white/40">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Material</p>
                      <p className="text-sm font-medium">{study.orthotics.material}</p>
                    </div>
                    <div className="bg-white/30 p-3 rounded-xl border border-white/40">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Elementos</p>
                      <p className="text-[10px] font-medium truncate">{study.orthotics.elements.join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 p-6 flex flex-col justify-center gap-2 border-l border-white/20">
                  <Button variant="outline" size="sm" onClick={() => exportWorkOrder(study)} className="rounded-xl glass w-full">
                    <FileDown className="h-4 w-4 mr-2" />
                    Orden de Trabajo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingStudy(study);
                    setActiveView('form');
                  }} className="rounded-xl w-full">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
