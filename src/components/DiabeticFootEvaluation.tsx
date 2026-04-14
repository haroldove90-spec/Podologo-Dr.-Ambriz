import React, { useState, useMemo } from 'react';
import { ShieldAlert, Activity, Footprints, Save, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FootPoint {
  id: string;
  x: number;
  y: number;
  label: string;
}

const FOOT_POINTS: FootPoint[] = [
  { id: 'hallux', x: 35, y: 15, label: '1er Dedo' },
  { id: 'toe3', x: 55, y: 18, label: '3er Dedo' },
  { id: 'toe5', x: 75, y: 25, label: '5to Dedo' },
  { id: 'meta1', x: 35, y: 35, label: '1er Metatarsiano' },
  { id: 'meta3', x: 55, y: 38, label: '3er Metatarsiano' },
  { id: 'meta5', x: 75, y: 42, label: '5to Metatarsiano' },
  { id: 'mid_medial', x: 30, y: 60, label: 'Mediopié Medial' },
  { id: 'mid_lateral', x: 70, y: 65, label: 'Mediopié Lateral' },
  { id: 'heel', x: 50, y: 85, label: 'Talón' },
  { id: 'dorsum', x: 50, y: 50, label: 'Dorso (1er Espacio)' },
];

export default function DiabeticFootEvaluation({ patientId, onSave }: { patientId: string, onSave?: () => void }) {
  const [vascular, setVascular] = useState({
    pedioRight: 'Strong',
    pedioLeft: 'Strong',
    tibialRight: 'Strong',
    tibialLeft: 'Strong',
  });

  const [sensibility, setSensibility] = useState<Record<string, boolean>>({});
  const [wagnerGrade, setWagnerGrade] = useState('0');
  const [notes, setNotes] = useState('');

  const togglePoint = (id: string) => {
    setSensibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const riskLevel = useMemo(() => {
    const lostPoints = Object.values(sensibility).filter(v => v).length;
    const absentPulses = Object.values(vascular).filter(v => v === 'Absent').length;
    
    if (parseInt(wagnerGrade) > 0) return { label: 'RIESGO MUY ALTO', color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
    if (lostPoints >= 4 || absentPulses >= 1) return { label: 'RIESGO ALTO', color: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
    if (lostPoints >= 1) return { label: 'RIESGO MODERADO', color: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
    return { label: 'RIESGO BAJO', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' };
  }, [sensibility, vascular, wagnerGrade]);

  const handleSave = async () => {
    try {
      await addDoc(collection(db, `patients/${patientId}/diabetic_evaluations`), {
        vascular,
        sensibility,
        wagnerGrade: parseInt(wagnerGrade),
        riskLevel: riskLevel.label,
        notes,
        date: serverTimestamp()
      });
      toast.success('Evaluación guardada correctamente');
      if (onSave) onSave();
    } catch (error) {
      toast.error('Error al guardar la evaluación');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Vascular Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              Exploración Vascular
            </CardTitle>
            <CardDescription>Evaluación de pulsos periféricos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pulso Pedio (Der)</Label>
                <Select value={vascular.pedioRight} onValueChange={(v) => setVascular({...vascular, pedioRight: v})}>
                  <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong">Fuerte</SelectItem>
                    <SelectItem value="Weak">Débil</SelectItem>
                    <SelectItem value="Absent">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pulso Pedio (Izq)</Label>
                <Select value={vascular.pedioLeft} onValueChange={(v) => setVascular({...vascular, pedioLeft: v})}>
                  <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong">Fuerte</SelectItem>
                    <SelectItem value="Weak">Débil</SelectItem>
                    <SelectItem value="Absent">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tibial Posterior (Der)</Label>
                <Select value={vascular.tibialRight} onValueChange={(v) => setVascular({...vascular, tibialRight: v})}>
                  <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong">Fuerte</SelectItem>
                    <SelectItem value="Weak">Débil</SelectItem>
                    <SelectItem value="Absent">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tibial Posterior (Izq)</Label>
                <Select value={vascular.tibialLeft} onValueChange={(v) => setVascular({...vascular, tibialLeft: v})}>
                  <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong">Fuerte</SelectItem>
                    <SelectItem value="Weak">Débil</SelectItem>
                    <SelectItem value="Absent">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wagner Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Clasificación de Wagner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Grado de Ulceración</Label>
              <Select value={wagnerGrade} onValueChange={setWagnerGrade}>
                <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Grado 0: Ninguna, pie de riesgo</SelectItem>
                  <SelectItem value="1">Grado 1: Úlcera superficial</SelectItem>
                  <SelectItem value="2">Grado 2: Úlcera profunda (tendón/cápsula)</SelectItem>
                  <SelectItem value="3">Grado 3: Úlcera profunda + Absceso/Osteítis</SelectItem>
                  <SelectItem value="4">Grado 4: Gangrena limitada (antepié/talón)</SelectItem>
                  <SelectItem value="5">Grado 5: Gangrena extensa de todo el pie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={`p-4 rounded-2xl border ${riskLevel.border} ${riskLevel.color} bg-opacity-10 flex items-center justify-between`}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Clasificación Sugerida</p>
                <p className={`text-xl font-black ${riskLevel.text}`}>{riskLevel.label}</p>
              </div>
              <Badge className={`${riskLevel.color} text-white border-none`}>Wagner {wagnerGrade}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Neurological / Monofilament Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Footprints className="h-5 w-5 text-blue-500" />
              Exploración Neurológica
            </CardTitle>
            <CardDescription>Prueba de Monofilamento 10g (Semmes-Weinstein)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-48 h-80 bg-white/20 rounded-3xl border border-white/40 p-4">
                {/* Simple Foot SVG representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-200 stroke-slate-400 stroke-[0.5]">
                  <path d="M50,5 C30,5 20,20 20,40 C20,60 30,75 35,85 C40,95 60,95 65,85 C70,75 80,60 80,40 C80,20 70,5 50,5 Z" />
                  {FOOT_POINTS.map(point => (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      className={`cursor-pointer transition-colors ${sensibility[point.id] ? 'fill-red-500 stroke-red-600' : 'fill-green-500 stroke-green-600'}`}
                      onClick={() => togglePoint(point.id)}
                    />
                  ))}
                </svg>
                <div className="absolute -right-32 top-0 space-y-1 hidden md:block">
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="w-3 h-3 rounded-full bg-green-500" /> Siente
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> NO siente
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-slate-600">Instrucciones:</p>
                <p className="text-xs text-slate-500 italic">Haz clic en los puntos rojos para marcar pérdida de sensibilidad protectora.</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {FOOT_POINTS.slice(0, 6).map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sensibility[p.id] ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-[10px] font-medium">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Observaciones Adicionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea 
              className="w-full min-h-[100px] glass p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Detalles sobre deformidades, calzado, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={handleSave} className="w-full rounded-xl shadow-lg shadow-primary/20">
              <Save className="h-4 w-4 mr-2" />
              Guardar Evaluación Completa
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
