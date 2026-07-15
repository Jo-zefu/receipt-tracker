import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export interface Receipt {
  id?: string;
  filename: string;
  vendor: string | null;
  category: string;
  amount: number | null;
  date: string | null;
  raw_text: string;
  confidence: 'high' | 'low';
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Insert a new receipt into the database
 */
export async function insertReceipt(receipt: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>): Promise<Receipt> {
  const { data, error } = await supabase
    .from('receipts')
    .insert([receipt])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert receipt: ${error.message}`);
  }

  return data;
}

/**
 * Get all receipts, sorted by date descending
 */
export async function getAllReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch receipts: ${error.message}`);
  }

  return data || [];
}

/**
 * Delete all receipts
 */
export async function deleteAllReceipts(): Promise<void> {
  const { error } = await supabase
    .from('receipts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (error) {
    throw new Error(`Failed to delete receipts: ${error.message}`);
  }
}

/**
 * Upload image to Supabase Storage
 * @param filename - Original filename
 * @param buffer - File buffer
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(filename: string, buffer: Buffer): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${timestamp}-${sanitizedFilename}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract path from URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const storagePath = pathParts.slice(pathParts.indexOf('receipts') + 1).join('/');

  const { error } = await supabase.storage
    .from('receipts')
    .remove([storagePath]);

  if (error) {
    console.error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Get summary statistics
 */
export async function getReceiptSummary() {
  const receipts = await getAllReceipts();

  const total = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const byCategory: Record<string, number> = {};

  receipts.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + (r.amount || 0);
  });

  return {
    count: receipts.length,
    total,
    byCategory,
  };
}
