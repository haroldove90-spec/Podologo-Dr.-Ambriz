import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Maximize2, 
  Columns, 
  FileDown, 
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card as UICard, CardContent as UICardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface GalleryImage {
  id: string;
  patientId: string;
  url: string;
  category: 'Inicial' | 'Proceso' | 'Final';
  date: string;
  notes: string;
}

const SAMPLE_IMAGES: GalleryImage[] = [
  {
    id: 'img1',
    patientId: 'p1',
    url: 'https://picsum.photos/seed/foot1/800/600',
    category: 'Inicial',
    date: '2024-01-15T10:00:00',
    notes: 'Onicocriptosis grado II en primer dedo.'
  },
  {
    id: 'img2',
    patientId: 'p1',
    url: 'https://picsum.photos/seed/foot2/800/600',
    category: 'Proceso',
    date: '2024-02-15T10:00:00',
    notes: 'Evolución favorable tras primera cura.'
  },
  {
    id: 'img3',
    patientId: 'p1',
    url: 'https://picsum.photos/seed/foot3/800/600',
    category: 'Final',
    date: '2024-03-15T10:00:00',
    notes: 'Alta clínica. Tejido totalmente epitelizado.'
  },
  {
    id: 'img4',
    patientId: 'p2',
    url: 'https://picsum.photos/seed/foot4/800/600',
    category: 'Inicial',
    date: '2024-03-01T10:00:00',
    notes: 'Hiperqueratosis plantar severa.'
  }
];

export default function ClinicalGallery({ patientId }: { patientId?: string }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('clinical_gallery');
    if (saved) {
      setImages(JSON.parse(saved));
    } else {
      setImages(SAMPLE_IMAGES);
      localStorage.setItem('clinical_gallery', JSON.stringify(SAMPLE_IMAGES));
    }
  }, []);

  const filteredImages = images.filter(img => {
    const matchesPatient = patientId ? img.patientId === patientId : true;
    const matchesCategory = filter === 'all' ? true : img.category === filter;
    return matchesPatient && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: GalleryImage = {
          id: Math.random().toString(36).substr(2, 9),
          patientId: patientId || 'unknown',
          url: reader.result as string,
          category: 'Proceso',
          date: new Date().toISOString(),
          notes: ''
        };
        const updated = [newImg, ...images];
        setImages(updated);
        localStorage.setItem('clinical_gallery', JSON.stringify(updated));
        toast.success('Imagen cargada correctamente');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(i => i !== id));
    } else if (compareIds.length < 2) {
      setCompareIds([...compareIds, id]);
    } else {
      setCompareIds([compareIds[1], id]);
    }
  };

  const exportEvolutionReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Reporte de Evolución Clínica', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Paciente ID: ${patientId || 'General'}`, 20, 30);
    doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 20, 37);

    let y = 50;
    filteredImages.forEach((img, index) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(`${img.category} - ${new Date(img.date).toLocaleDateString()}`, 20, y);
      doc.text(`Notas: ${img.notes}`, 20, y + 5);
      // In a real app we'd add the image here, but base64 in PDF can be tricky with jspdf
      // for this demo we'll just add a placeholder box
      doc.rect(20, y + 8, 50, 30);
      doc.text('[Imagen]', 35, y + 25);
      y += 50;
    });

    doc.save('reporte_evolucion.pdf');
    toast.success('Reporte PDF generado');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Galería Clínica</h3>
          <p className="text-slate-500 text-sm">Seguimiento visual de la evolución del paciente</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsComparing(!isComparing)} className={`rounded-xl glass ${isComparing ? 'bg-primary/20 border-primary' : ''}`}>
            <Columns className="h-4 w-4 mr-2" />
            {isComparing ? 'Salir de Comparación' : 'Comparar Lado a Lado'}
          </Button>
          <Button variant="outline" onClick={exportEvolutionReport} className="rounded-xl glass">
            <FileDown className="h-4 w-4 mr-2" />
            Reporte Evolución
          </Button>
          <div className="relative">
            <input 
              type="file" 
              id="gallery-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <label htmlFor="gallery-upload" className="cursor-pointer flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Subir Foto
              </label>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'Inicial', 'Proceso', 'Final'].map(cat => (
          <Button 
            key={cat} 
            variant={filter === cat ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilter(cat)}
            className="rounded-full px-4"
          >
            {cat === 'all' ? 'Todas' : cat}
          </Button>
        ))}
      </div>

      {isComparing && compareIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 glass rounded-3xl border-2 border-primary/30 animate-in fade-in zoom-in duration-300">
          {compareIds.map(id => {
            const img = images.find(i => i.id === id);
            return img ? (
              <div key={id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="rounded-lg">{img.category}</Badge>
                  <span className="text-xs text-slate-500">{new Date(img.date).toLocaleDateString()}</span>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/40 shadow-xl">
                  <img src={img.url} alt="Comparación" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            ) : null;
          })}
          {compareIds.length === 1 && (
            <div className="aspect-video rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-primary/40">
              <Plus className="h-8 w-8 mb-2" />
              <p className="text-sm">Selecciona otra imagen para comparar</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map(img => (
          <UICard key={img.id} className={`glass-card group overflow-hidden transition-all hover:scale-[1.02] ${compareIds.includes(img.id) ? 'ring-2 ring-primary' : ''}`}>
            <div className="relative aspect-square overflow-hidden">
              <img src={img.url} alt="Clínica" className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => toggleCompare(img.id)} className="rounded-xl">
                  <Columns className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-xl">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <Badge className="absolute top-2 left-2 rounded-lg backdrop-blur-md bg-white/60 text-slate-900 border-none">
                {img.category}
              </Badge>
            </div>
            <UICardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(img.date).toLocaleDateString()}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 italic">
                {img.notes || 'Sin notas adicionales...'}
              </p>
            </UICardContent>
          </UICard>
        ))}
      </div>
    </div>
  );
}
