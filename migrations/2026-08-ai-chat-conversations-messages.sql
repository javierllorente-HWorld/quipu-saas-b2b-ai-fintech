-- Historial de chat IA (Quipu copiloto)
-- Ejecutar contra Neon/Postgres cuando corresponda (no ejecutado por el agente).

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  user_id UUID NULL REFERENCES users (id),
  title TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_organization_id ON ai_conversations (organization_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations (user_id);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages (conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages (created_at);
