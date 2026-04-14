-- Script SQL para Supabase (PostgreSQL)
-- Módulo de Galería Clínica y Seguimiento Visual

CREATE TABLE IF NOT EXISTS galeria_clinica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    url_imagen TEXT NOT NULL, -- URL o Base64
    categoria TEXT CHECK (categoria IN ('Inicial', 'Proceso', 'Final')) NOT NULL,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actualización de la tabla pacientes para contadores de productividad
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS total_visitas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_evaluacion_biomecanica TIMESTAMP WITH TIME ZONE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_galeria_paciente ON galeria_clinica(paciente_id);
CREATE INDEX IF NOT EXISTS idx_galeria_categoria ON galeria_clinica(categoria);

-- RLS
ALTER TABLE galeria_clinica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON galeria_clinica FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON galeria_clinica FOR INSERT 
TO authenticated 
WITH CHECK (true);
