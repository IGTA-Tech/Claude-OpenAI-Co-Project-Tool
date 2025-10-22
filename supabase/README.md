# Supabase Database Setup

## Quick Start

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Enable pgvector extension**:
   - Go to Database → Extensions in your Supabase dashboard
   - Search for "vector" and enable it

3. **Run the schema**:
   - Copy the contents of `schema.sql`
   - Go to SQL Editor in your Supabase dashboard
   - Paste and execute the schema

4. **Set up Storage Buckets**:
   - Create a bucket named `documents` for file uploads
   - Create a bucket named `images` for generated images
   - Set appropriate permissions (authenticated users can upload/read)

5. **Update environment variables**:
   - Copy your Project URL to `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your anon/public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy your service_role key to `SUPABASE_SERVICE_ROLE_KEY`

## Storage Bucket Policies

### Documents Bucket
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their documents
CREATE POLICY "Users can read their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Images Bucket
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their images
CREATE POLICY "Users can read their images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Database Tables

- **profiles**: User profile information
- **api_keys**: Encrypted API keys for AI providers
- **projects**: User projects with custom instructions
- **documents**: Uploaded documents
- **document_chunks**: Text chunks with vector embeddings
- **conversations**: Chat conversations
- **messages**: Individual chat messages
- **generated_images**: DALL-E generated images
- **n8n_webhooks**: n8n automation webhooks
- **decision_rooms**: Multi-model comparison sessions
- **usage_logs**: API usage tracking

## Important Notes

- pgvector extension is required for semantic search
- All tables have RLS enabled for security
- Updated_at timestamps are automatically managed
- User profiles are auto-created on signup
