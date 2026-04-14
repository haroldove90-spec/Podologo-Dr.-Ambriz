-- Script SQL para Supabase (PostgreSQL)
-- Módulo de Análisis Biomecánico y Ortopodología

CREATE TABLE IF NOT EXISTS biomecanica_plantillas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Exploración Biomecánica
    morfologia_pie TEXT, -- Plano, Cavo, Valgo, Varo, etc.
    analisis_marcha JSONB, -- {apoyo: string, balanceo: string, despegue: string}
    rangos_articulares JSONB, -- {tobillo: string, subastragalina: string, meta1: string}
    
    -- Prescripción de Plantillas
    material_base TEXT,
    elementos_correccion TEXT[], -- Array de elementos (Arco, Barra, Cuñas)
    instrucciones_laboratorio TEXT,
    
    -- Metadatos
    status TEXT DEFAULT 'Prescrita' CHECK (status IN ('Prescrita', 'En Fabricación', 'Entregada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_biomecanica_paciente ON biomecanica_plantillas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_biomecanica_fecha ON biomecanica_plantillas(fecha);

-- RLS
ALTER TABLE biomecanica_plantillas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON biomecanica_plantillas FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON biomecanica_plantillas FOR INSERT 
TO authenticated 
WITH CHECK (true);
