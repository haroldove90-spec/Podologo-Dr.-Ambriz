import React from 'react';
import { 
  Users, 
  Settings, 
  ShieldCheck, 
  TrendingUp, 
  FileDown, 
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ProductivityDashboard() {
  const stats = [
    { label: 'Pacientes Totales', value: '124', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Plantillas Prescritas', value: '18', change: '+5%', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Ciclos Autoclave', value: '42', change: '100% OK', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Ingresos Estimados', value: '$24,500', change: '+18%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const exportConsolidatedReport = () => {
    const data = [
      { Servicio: 'Consulta General', Cantidad: 45, Ingreso: 22500 },
      { Servicio: 'Plantillas Ortopédicas', Cantidad: 12, Ingreso: 18000 },
      { Servicio: 'Evaluación Pie Diabético', Cantidad: 8, Ingreso: 6400 },
      { Servicio: 'Cirugía Ungueal', Cantidad: 3, Ingreso: 7500 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Servicios");
    XLSX.writeFile(wb, "Reporte_Consolidado_Servicios.xlsx");
    toast.success('Reporte Excel generado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Dashboard de Productividad</h3>
          <p className="text-slate-500 text-sm">Control de KPIs y rendimiento clínico</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConsolidatedReport} className="rounded-xl glass">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Reporte Consolidado
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <FileDown className="h-4 w-4 mr-2" />
            Descargar Reporte Completo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="rounded-lg bg-white/50 border-none text-[10px]">
                  {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1 inline" /> : null}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h4 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Pacientes</CardTitle>
            <CardDescription>Comparativa por especialidad médica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Pie Diabético', value: 45, color: 'bg-red-500' },
                { label: 'Podología Pediátrica', value: 30, color: 'bg-blue-500' },
                { label: 'Ortopodología', value: 25, color: 'bg-purple-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Estado de Esterilización</CardTitle>
            <CardDescription>Últimos 30 días de operación</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="stroke-slate-100"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-green-500"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-green-600">100%</span>
                <span className="text-[10px] text-slate-400 uppercase">Seguro</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">128</p>
                <p className="text-xs text-slate-500">Ciclos Totales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">0</p>
                <p className="text-xs text-slate-500">Fallas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
