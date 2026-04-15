-- ============================================================
-- MIGRATION: Merge APP del Consenso schema in BCS DB
-- Target project: knuuqldetklmsrtvggtk (BCS / ultrabot.space)
-- Date: 2026-04-15
-- ============================================================

-- STEP 1: Estendi profiles con colonne Consenso
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT CHECK (char_length(display_name) BETWEEN 2 AND 30),
  ADD COLUMN IF NOT EXISTS avatar_color  TEXT DEFAULT '#6366F1',
  ADD COLUMN IF NOT EXISTS avatar_url    TEXT;

-- STEP 2: Tabelle Consenso (nessun conflitto con BCS)

CREATE TABLE IF NOT EXISTS public.pairing_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  TEXT        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code        TEXT        NOT NULL UNIQUE CHECK (code ~ '^\d{6}$'),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '10 minutes',
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consent_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','active','confirmed','revoked','expired')),
  initiated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at      TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '5 hours',
  revoked_by        TEXT        REFERENCES public.profiles(id),
  integrity_hash    TEXT        NOT NULL DEFAULT '',
  participant_count INT         NOT NULL DEFAULT 2,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consent_participants (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID        NOT NULL REFERENCES public.consent_sessions(id) ON DELETE CASCADE,
  user_id    TEXT        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  role       TEXT        NOT NULL CHECK (role IN ('initiator','participant')),
  UNIQUE (session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.consent_confirmations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES public.consent_sessions(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      TEXT        NOT NULL CHECK (action IN ('confirmed','revoked')),
  actioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_hash TEXT        NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.pairing_rate_limits (
  user_id       TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  attempt_count INT         NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
);

-- STEP 3: Indici per performance
CREATE INDEX IF NOT EXISTS idx_pairing_codes_creator     ON public.pairing_codes(creator_id);
CREATE INDEX IF NOT EXISTS idx_consent_sessions_status   ON public.consent_sessions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_consent_participants_usr  ON public.consent_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_confirmations_s   ON public.consent_confirmations(session_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user          ON public.pairing_rate_limits(user_id, window_start);

-- STEP 4: Abilita RLS su tutte le tabelle Consenso
ALTER TABLE public.pairing_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_rate_limits   ENABLE ROW LEVEL SECURITY;

-- STEP 4a: Policy pairing_codes
CREATE POLICY pairing_creator ON public.pairing_codes
  FOR ALL USING (creator_id = (auth.jwt()->>'sub'));

CREATE POLICY pairing_read_valid ON public.pairing_codes
  FOR SELECT USING (used_at IS NULL AND expires_at > now());

-- STEP 4b: Policy consent_sessions
CREATE POLICY sessions_participants_only ON public.consent_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.consent_participants cp
      WHERE cp.session_id = id AND cp.user_id = (auth.jwt()->>'sub')
    )
  );

-- STEP 4c: Policy consent_participants
CREATE POLICY participants_same_session ON public.consent_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consent_participants cp2
      WHERE cp2.session_id = session_id AND cp2.user_id = (auth.jwt()->>'sub')
    )
  );

CREATE POLICY participants_insert_self ON public.consent_participants
  FOR INSERT WITH CHECK (user_id = (auth.jwt()->>'sub'));

-- STEP 4d: Policy consent_confirmations
CREATE POLICY confirmations_self_read ON public.consent_confirmations
  FOR SELECT USING (user_id = (auth.jwt()->>'sub'));

CREATE POLICY confirmations_insert_self ON public.consent_confirmations
  FOR INSERT WITH CHECK (user_id = (auth.jwt()->>'sub'));

-- STEP 4e: Policy pairing_rate_limits
CREATE POLICY rate_limits_self ON public.pairing_rate_limits
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- STEP 5: Funzioni

-- Helper: estrai user_id dal JWT Clerk
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt()->>'sub', auth.jwt()->>'user_id');
$$;

-- Helper: verifica partecipazione sessione
CREATE OR REPLACE FUNCTION public.is_current_user_participant(p_session_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consent_participants
    WHERE session_id = p_session_id
      AND user_id = public.requesting_user_id()
  );
$$;

-- Genera codice pairing 6 cifre univoco
CREATE OR REPLACE FUNCTION public.generate_pairing_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code   TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := lpad(floor(random() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS (
      SELECT 1 FROM public.pairing_codes
      WHERE code = v_code AND used_at IS NULL AND expires_at > now()
    ) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;
GRANT EXECUTE ON FUNCTION public.generate_pairing_code() TO authenticated;

-- Genera codice con rate limiting (max 5/minuto per utente)
CREATE OR REPLACE FUNCTION public.generate_pairing_code_safe()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id TEXT        := public.requesting_user_id();
  v_window  TIMESTAMPTZ := date_trunc('minute', now());
  v_count   INT;
BEGIN
  SELECT attempt_count INTO v_count
  FROM public.pairing_rate_limits
  WHERE user_id = v_user_id AND window_start = v_window;

  IF v_count IS NULL THEN
    INSERT INTO public.pairing_rate_limits VALUES (v_user_id, v_window, 1)
    ON CONFLICT (user_id, window_start)
    DO UPDATE SET attempt_count = public.pairing_rate_limits.attempt_count + 1;
  ELSIF v_count >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMIT: max 5 codici per minuto';
  ELSE
    UPDATE public.pairing_rate_limits
    SET attempt_count = attempt_count + 1
    WHERE user_id = v_user_id AND window_start = v_window;
  END IF;

  RETURN public.generate_pairing_code();
END;
$$;
GRANT EXECUTE ON FUNCTION public.generate_pairing_code_safe() TO authenticated;

-- Crea sessione consenso con lista partecipanti
CREATE OR REPLACE FUNCTION public.create_consent_session(
  p_participant_ids TEXT[],
  p_integrity_hash  TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session_id UUID;
  v_caller     TEXT := public.requesting_user_id();
  v_pid        TEXT;
BEGIN
  IF NOT (v_caller = ANY(p_participant_ids)) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: caller must be in participant list';
  END IF;

  INSERT INTO public.consent_sessions (integrity_hash, participant_count)
  VALUES (p_integrity_hash, array_length(p_participant_ids, 1))
  RETURNING id INTO v_session_id;

  FOREACH v_pid IN ARRAY p_participant_ids LOOP
    INSERT INTO public.consent_participants (session_id, user_id, role)
    VALUES (
      v_session_id,
      v_pid,
      CASE WHEN v_pid = v_caller THEN 'initiator' ELSE 'participant' END
    );
  END LOOP;

  RETURN v_session_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_consent_session(TEXT[], TEXT) TO authenticated;

-- Crea sessione da codice pairing scansionato
CREATE OR REPLACE FUNCTION public.create_session_from_pairing_code(
  p_code           TEXT,
  p_integrity_hash TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller  TEXT := public.requesting_user_id();
  v_creator TEXT;
  v_session UUID;
BEGIN
  SELECT creator_id INTO v_creator
  FROM public.pairing_codes
  WHERE code = p_code AND used_at IS NULL AND expires_at > now()
  FOR UPDATE;

  IF v_creator IS NULL THEN
    RAISE EXCEPTION 'INVALID_CODE: codice non valido o scaduto';
  END IF;
  IF v_creator = v_caller THEN
    RAISE EXCEPTION 'SELF_PAIR: non puoi fare pairing con te stesso';
  END IF;

  UPDATE public.pairing_codes SET used_at = now() WHERE code = p_code;

  SELECT public.create_consent_session(
    ARRAY[v_caller, v_creator], p_integrity_hash
  ) INTO v_session;

  RETURN v_session;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_session_from_pairing_code(TEXT, TEXT) TO authenticated;

-- Registra azione consenso (confirmed / revoked)
CREATE OR REPLACE FUNCTION public.record_consent_action(
  p_session_id  UUID,
  p_action      TEXT,
  p_action_hash TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller            TEXT := public.requesting_user_id();
  v_status            TEXT;
  v_confirmed_count   INT;
  v_participant_count INT;
BEGIN
  SELECT status, participant_count
  INTO v_status, v_participant_count
  FROM public.consent_sessions WHERE id = p_session_id;

  IF NOT public.is_current_user_participant(p_session_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;
  IF v_status NOT IN ('pending','active') THEN
    RAISE EXCEPTION 'SESSION_NOT_ACTIVE';
  END IF;
  IF now() > (SELECT expires_at FROM public.consent_sessions WHERE id = p_session_id) THEN
    RAISE EXCEPTION 'SESSION_EXPIRED';
  END IF;

  INSERT INTO public.consent_confirmations (session_id, user_id, action, action_hash)
  VALUES (p_session_id, v_caller, p_action, p_action_hash);

  IF p_action = 'revoked' THEN
    UPDATE public.consent_sessions
    SET status = 'revoked', revoked_at = now(), revoked_by = v_caller
    WHERE id = p_session_id;
  ELSE
    SELECT COUNT(*) INTO v_confirmed_count
    FROM public.consent_confirmations
    WHERE session_id = p_session_id AND action = 'confirmed';

    IF v_confirmed_count >= v_participant_count THEN
      UPDATE public.consent_sessions
      SET status = 'confirmed', confirmed_at = now()
      WHERE id = p_session_id;
    ELSE
      UPDATE public.consent_sessions SET status = 'active'
      WHERE id = p_session_id;
    END IF;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.record_consent_action(UUID, TEXT, TEXT) TO authenticated;

-- Leggi profili di tutti i partecipanti di una sessione
CREATE OR REPLACE FUNCTION public.get_session_profiles(p_session_id UUID)
RETURNS TABLE(user_id TEXT, display_name TEXT, avatar_color TEXT, avatar_url TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_current_user_participant(p_session_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;
  RETURN QUERY
    SELECT p.id, p.display_name, p.avatar_color, p.avatar_url
    FROM public.profiles p
    JOIN public.consent_participants cp ON cp.user_id = p.id
    WHERE cp.session_id = p_session_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_session_profiles(UUID) TO authenticated;

-- Conta conferme e revoche di una sessione
CREATE OR REPLACE FUNCTION public.get_session_metrics(p_session_id UUID)
RETURNS TABLE(confirmed_count INT, any_revoked BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_current_user_participant(p_session_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;
  RETURN QUERY
    SELECT
      COUNT(*) FILTER (WHERE action = 'confirmed')::INT,
      BOOL_OR(action = 'revoked')
    FROM public.consent_confirmations
    WHERE session_id = p_session_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_session_metrics(UUID) TO authenticated;

-- Upsert profilo utente (usato da APP del Consenso al login)
CREATE OR REPLACE FUNCTION public.upsert_my_profile(
  p_display_name TEXT,
  p_avatar_color TEXT,
  p_avatar_url   TEXT DEFAULT NULL
) RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id TEXT := public.requesting_user_id();
  v_profile public.profiles;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_color, avatar_url)
  VALUES (v_user_id, p_display_name, p_avatar_color, p_avatar_url)
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        avatar_color = EXCLUDED.avatar_color,
        avatar_url   = EXCLUDED.avatar_url,
        updated_at   = now()
  RETURNING * INTO v_profile;
  RETURN v_profile;
END;
$$;
GRANT EXECUTE ON FUNCTION public.upsert_my_profile(TEXT, TEXT, TEXT) TO authenticated;

-- Scade sessioni non più attive
CREATE OR REPLACE FUNCTION public.expire_stale_sessions()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.consent_sessions
  SET status = 'expired'
  WHERE status IN ('pending','active') AND expires_at < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Pulizia rate limit records vecchi
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.pairing_rate_limits
  WHERE window_start < now() - INTERVAL '10 minutes';
END;
$$;

-- STEP 6: View stato corrente consenso per sessione/utente
CREATE OR REPLACE VIEW public.v_current_consent_status AS
SELECT DISTINCT ON (session_id, user_id)
  session_id,
  user_id,
  action      AS current_status,
  actioned_at AS last_action_at
FROM public.consent_confirmations
ORDER BY session_id, user_id, actioned_at DESC;

-- STEP 7: Trigger updated_at su profiles (idempotente)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'profiles_updated_at'
      AND tgrelid = 'public.profiles'::regclass
  ) THEN
    CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
