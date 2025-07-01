# Supabase Storage Setup

To complete the user profile image upload feature, you need to create the following storage buckets in your Supabase dashboard:

## Steps to Create Storage Buckets:

1. Go to your Supabase project dashboard
2. Navigate to Storage in the left sidebar
3. Click "New bucket" and create the following buckets:

### 1. profile-pictures
- Name: `profile-pictures`
- Public bucket: Yes (check the box)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif

### 2. banner-images
- Name: `banner-images`
- Public bucket: Yes (check the box)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif

### 3. post-media
- Name: `post-media`
- Public bucket: Yes (check the box)
- File size limit: 50MB
- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, video/mp4, video/quicktime

## Storage Policies

For each bucket, you'll need to set up RLS (Row Level Security) policies:

### Upload Policy (for authenticated users)
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

### View Policy (for everyone)
```sql
-- Allow anyone to view images
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT TO public
USING (true);
```

### Delete Policy (for own images)
```sql
-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Environment Variables

Make sure you have the following in your server's .env file:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key (for server-side uploads)

The client should use the anon key for browser uploads.