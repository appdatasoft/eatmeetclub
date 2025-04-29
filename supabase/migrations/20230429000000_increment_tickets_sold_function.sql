
-- Create function to increment tickets_sold count
CREATE OR REPLACE FUNCTION public.increment_tickets_sold(
  p_event_id UUID,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET tickets_sold = COALESCE(tickets_sold, 0) + p_quantity
  WHERE id = p_event_id;
END;
$$;
