import { supabase } from './supabase.js';

export async function uploadProductImage(file, shopId) {
  const ext = file.name.split('.').pop();
  const fileName = `${shopId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteProductImage(imageUrl) {
  // Extract path from full URL
  const path = imageUrl.split('/product-images/')[1];
  if (!path) return;

  await supabase.storage
    .from('product-images')
    .remove([path]);
}