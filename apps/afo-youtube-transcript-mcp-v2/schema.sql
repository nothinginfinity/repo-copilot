-- afo-youtube-transcript-mcp-v2 schema
CREATE TABLE IF NOT EXISTS yt_transcripts (
  transcript_id TEXT PRIMARY KEY,
  url TEXT,
  video_id TEXT,
  title TEXT,
  language TEXT,
  source_note TEXT,
  transcript_text TEXT,
  segments_json TEXT,
  chunk_count INTEGER,
  status TEXT,
  caption_format TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_yt_transcripts_video_id ON yt_transcripts(video_id);
CREATE INDEX IF NOT EXISTS idx_yt_transcripts_created_at ON yt_transcripts(created_at);
