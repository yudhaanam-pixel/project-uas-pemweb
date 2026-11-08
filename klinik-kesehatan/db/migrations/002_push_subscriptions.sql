
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    pengguna_id UUID NOT NULL
        REFERENCES public.pengguna(id)
        ON DELETE CASCADE,

    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (pengguna_id, endpoint)
);

CREATE INDEX IF NOT EXISTS
idx_push_subscriptions_pengguna
ON public.push_subscriptions(pengguna_id);

ALTER TABLE public.push_subscriptions
ENABLE ROW LEVEL SECURITY;
