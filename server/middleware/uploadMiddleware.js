const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

let supabase;

const getSupabase = () => {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  
  if (file.fieldname === 'profilePicture' || file.fieldname === 'bannerImage') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
    }
  } else if (file.fieldname === 'media') {
    if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const uploadProfile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile images
  },
});

const uploadPost = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for post media
  },
});

const uploadToSupabase = async (file, bucket, path) => {
  try {
    // Debug logging
    console.log('Upload attempt:', {
      bucket,
      path,
      fileSize: file.buffer.length,
      mimeType: file.mimetype,
      supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Missing',
      serviceKey: (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'Set' : 'Missing'
    });

    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.mimetype.split('/')[1]}`;
    
    const { data, error } = await getSupabase().storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        bucket,
        fileName
      });
      throw error;
    }

    const { data: { publicUrl } } = getSupabase().storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Upload successful:', { bucket, fileName, publicUrl });
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

module.exports = {
  uploadProfile,
  uploadPost,
  uploadToSupabase,
};