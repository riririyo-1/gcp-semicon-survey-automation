export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  image_url: string | null;
  content: string | null;
  published_date: string | null;
  summary: string | null;
  tags: string[] | null;
  major_category?: string | null;
  minor_category?: string | null;
  created_at: string;
  updated_at: string;
  metadata_generated: boolean;
}
