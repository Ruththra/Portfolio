# Résumé storage

Résumé files are no longer served from this public directory. Configure the
private Supabase Storage credentials described in `.env.example`, run the
database migrations, and use **Resume** in the administrator workspace.

The selected file is downloaded through `/resume` with a short-lived signed
URL; unselected files remain private.
