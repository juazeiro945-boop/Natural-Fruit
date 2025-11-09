-- Natural Fruit PWA - Schema SQL para Supabase

-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('pf', 'pj')),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  requires_invoice BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produção diária
CREATE TABLE production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  loss DECIMAL(10,2) DEFAULT 0,
  exchange DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'pix', 'boleto')),
  paid BOOLEAN DEFAULT false,
  invoice_issued BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_production_date ON production(date);
CREATE INDEX idx_production_product ON production(product_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_payment ON sales(payment_method);
CREATE INDEX idx_sales_paid ON sales(paid);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_updated_at BEFORE UPDATE ON production
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para products
CREATE POLICY "Todos podem ver produtos" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admins podem gerenciar produtos" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para clients
CREATE POLICY "Todos podem ver clientes" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos podem criar clientes" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Apenas admins podem atualizar clientes" ON clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para production
CREATE POLICY "Todos podem ver produção" ON production
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos podem criar produção" ON production
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Criador pode atualizar produção" ON production
  FOR UPDATE USING (created_by = auth.uid());

-- Políticas para sales
CREATE POLICY "Todos podem ver vendas" ON sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos podem criar vendas" ON sales
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Criador pode atualizar vendas" ON sales
  FOR UPDATE USING (created_by = auth.uid());

-- Inserir dados de exemplo
INSERT INTO products (name, description, unit, price) VALUES
  ('Salada de Frutas 500g', 'Salada de frutas mistas', 'und', 15.00),
  ('Coco Descascado', 'Coco verde descascado', 'und', 8.00),
  ('Melancia Cortada 1kg', 'Melancia em cubos', 'kg', 12.00),
  ('Manga Descascada', 'Manga sem casca', 'und', 6.00),
  ('Abacaxi Descascado', 'Abacaxi pronto para consumo', 'und', 10.00);

INSERT INTO clients (type, name, document, phone, email, requires_invoice) VALUES
  ('pf', 'João Silva', '123.456.789-00', '(75) 99999-0001', 'joao@email.com', false),
  ('pj', 'Restaurante Bom Sabor LTDA', '12.345.678/0001-00', '(75) 3333-1111', 'contato@bomsabor.com', true),
  ('pf', 'Maria Santos', '987.654.321-00', '(75) 99999-0002', 'maria@email.com', false);

-- Nota: O usuário admin precisa ser criado via Supabase Auth primeiro
-- Depois, inserir o perfil:
-- INSERT INTO profiles (id, name, role) VALUES ('USER_UUID_AQUI', 'Administrador', 'admin');

-- ============================================
-- MELHORIAS FASE 2: Sistema 95% Completo
-- ============================================

-- Tabela de entrada de matéria-prima
CREATE TABLE raw_material_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para raw_material_entries
CREATE INDEX idx_raw_material_date ON raw_material_entries(date);
CREATE INDEX idx_raw_material_product ON raw_material_entries(product_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_raw_material_entries_updated_at BEFORE UPDATE ON raw_material_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS para raw_material_entries
ALTER TABLE raw_material_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver entradas de matéria-prima" ON raw_material_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos podem criar entradas de matéria-prima" ON raw_material_entries
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Criador pode atualizar entradas" ON raw_material_entries
  FOR UPDATE USING (created_by = auth.uid());

-- Adicionar campos de valor nas tabelas de produção
ALTER TABLE production ADD COLUMN IF NOT EXISTS loss_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE production ADD COLUMN IF NOT EXISTS exchange_value DECIMAL(10,2) DEFAULT 0;

-- Função para calcular valor de perdas e trocas automaticamente
CREATE OR REPLACE FUNCTION calculate_production_values()
RETURNS TRIGGER AS $$
DECLARE
  product_price DECIMAL(10,2);
BEGIN
  -- Buscar preço do produto
  SELECT price INTO product_price FROM products WHERE id = NEW.product_id;
  
  -- Calcular valores
  NEW.loss_value := (NEW.loss * product_price);
  NEW.exchange_value := (NEW.exchange * product_price);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular valores automaticamente
CREATE TRIGGER calculate_production_values_trigger
  BEFORE INSERT OR UPDATE ON production
  FOR EACH ROW
  EXECUTE FUNCTION calculate_production_values();

-- View para relatório de aproveitamento de matéria-prima
CREATE OR REPLACE VIEW material_utilization AS
SELECT 
  p.name as product_name,
  rme.date,
  rme.quantity_received as received,
  prod.quantity as produced,
  prod.loss,
  prod.exchange,
  ROUND((prod.quantity::DECIMAL / NULLIF(rme.quantity_received, 0) * 100), 2) as utilization_rate,
  prod.loss_value,
  prod.exchange_value
FROM raw_material_entries rme
LEFT JOIN production prod ON prod.product_id = rme.product_id AND prod.date = rme.date
LEFT JOIN products p ON p.id = rme.product_id;

-- Dados de exemplo para matéria-prima
INSERT INTO raw_material_entries (date, product_id, quantity_received, unit_price, total_cost, supplier) 
SELECT 
  CURRENT_DATE,
  id,
  100,
  price * 0.5,
  100 * price * 0.5,
  'Fornecedor Exemplo'
FROM products LIMIT 3;

