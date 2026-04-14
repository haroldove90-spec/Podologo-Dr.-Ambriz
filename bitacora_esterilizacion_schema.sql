-- Script SQL para Supabase (PostgreSQL)
-- Módulo de Trazabilidad de Esterilización (Bioseguridad)

CREATE TABLE IF NOT EXISTS bitacora_esterilizacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    temperatura NUMERIC(5,2) NOT NULL, -- Grados Celsius
    presion NUMERIC(4,2) NOT NULL,    -- Bar
    tiempo_minutos INTEGER NOT NULL,
    
    -- Resultados de indicadores
    indicador_quimico BOOLEAN DEFAULT TRUE, -- TRUE = Viraje correcto
    indicador_biologico BOOLEAN DEFAULT TRUE, -- TRUE = Negativo (Correcto)
    
    status TEXT CHECK (status IN ('Success', 'Failure')) NOT NULL,
    operador_id UUID REFERENCES auth.users(id),
    notas TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_esterilizacion_fecha ON bitacora_esterilizacion(fecha);
CREATE INDEX IF NOT EXISTS idx_esterilizacion_status ON bitacora_esterilizacion(status);

-- RLS
ALTER TABLE bitacora_esterilizacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON bitacora_esterilizacion FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON bitacora_esterilizacion FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados" 
ON bitacora_esterilizacion FOR UPDATE 
TO authenticated 
USING (true);
