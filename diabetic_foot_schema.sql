-- Script SQL para Supabase (PostgreSQL)
-- Módulo de Evaluación de Pie Diabético

-- 1. Tabla de Pacientes (Referencia)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    is_diabetic BOOLEAN DEFAULT FALSE,
    is_minor BOOLEAN DEFAULT FALSE,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Evaluaciones de Pie Diabético
CREATE TABLE IF NOT EXISTS evaluaciones_diabetico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    
    -- Exploración Vascular
    pulso_pedio_der TEXT CHECK (pulso_pedio_der IN ('Strong', 'Weak', 'Absent')),
    pulso_pedio_izq TEXT CHECK (pulso_pedio_izq IN ('Strong', 'Weak', 'Absent')),
    pulso_tibial_der TEXT CHECK (pulso_tibial_der IN ('Strong', 'Weak', 'Absent')),
    pulso_tibial_izq TEXT CHECK (pulso_tibial_izq IN ('Strong', 'Weak', 'Absent')),
    
    -- Exploración Neurológica (JSON para puntos del monofilamento)
    -- Estructura: {"hallux": true, "meta1": false, ...} donde true = siente, false = no siente
    sensibilidad_monofilamento JSONB NOT NULL,
    
    -- Clasificación
    wagner_grade INTEGER CHECK (wagner_grade >= 0 AND wagner_grade <= 5),
    risk_level TEXT NOT NULL, -- 'Bajo', 'Moderado', 'Alto', 'Muy Alto'
    
    -- Notas y Metadatos
    observaciones TEXT,
    evaluador_id UUID REFERENCES auth.users(id),
    fecha_evaluacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_evaluaciones_paciente ON evaluaciones_diabetico(paciente_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON evaluaciones_diabetico(fecha_evaluacion);

-- 4. Políticas de Seguridad (RLS)
ALTER TABLE evaluaciones_diabetico ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden ver/crear evaluaciones
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON evaluaciones_diabetico FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON evaluaciones_diabetico FOR INSERT 
TO authenticated 
WITH CHECK (true);
