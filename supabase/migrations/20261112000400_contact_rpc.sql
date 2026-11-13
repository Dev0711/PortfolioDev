-- ============================================================================
-- 0004 · Contact form entry point
-- Visitors cannot touch public.contact_messages. The server action calls this
-- SECURITY DEFINER function with the anon key; it validates input again and
-- rate-limits per hashed client address, so no service-role key is needed at
-- runtime.
-- ============================================================================

create or replace function public.submit_contact_message(
  p_name    text,
  p_email   text,
  p_subject text,
  p_message text,
  p_ip_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_from_sender integer;
  recent_total       integer;
begin
  p_name    := btrim(coalesce(p_name, ''));
  p_email   := lower(btrim(coalesce(p_email, '')));
  p_subject := btrim(coalesce(p_subject, ''));
  p_message := btrim(coalesce(p_message, ''));

  if char_length(p_name) not between 1 and 120
     or char_length(p_email) not between 3 and 254
     or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or char_length(p_subject) > 200
     or char_length(p_message) not between 10 and 5000 then
    return 'invalid';
  end if;

  -- Per-sender limit: 3 messages per hour.
  if p_ip_hash is not null then
    select count(*) into recent_from_sender
    from public.contact_messages
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';

    if recent_from_sender >= 3 then
      return 'rate_limited';
    end if;
  end if;

  -- Global circuit breaker: 60 messages per hour across all senders.
  select count(*) into recent_total
  from public.contact_messages
  where created_at > now() - interval '1 hour';

  if recent_total >= 60 then
    return 'rate_limited';
  end if;

  insert into public.contact_messages (name, email, subject, message, ip_hash)
  values (p_name, p_email, p_subject, p_message, p_ip_hash);

  return 'ok';
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text, text) to anon, authenticated;
