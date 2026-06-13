import { supabase } from './supabase';

export interface Document {
  id: string;
  title: string;
  category: string;
  status: string;
  bl_number?: string;
  reference?: string;
  owner?: string;
  file_reference?: string;
  issue_date?: string;
  expiry_date?: string;
  uploaded_by?: string;
  notes?: string;
  storage_path?: string;
  mime_type?: string;
  file_size?: number;
  created_at?: string;
}

export async function uploadDocument(
  file: File,
  metadata: Partial<Document>
) {
  if (file.type !== 'application/pdf')
    throw new Error('Only PDF files are allowed.');
  if (file.size > 25 * 1024 * 1024)
    throw new Error(`File exceeds 25MB (${(file.size / (1024*1024)).toFixed(2)}MB).`);

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const storagePath = `documents/${metadata.category || 'general'}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file);
  if (uploadError) throw uploadError;

  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      title: metadata.title,
      category: metadata.category,
      status: metadata.status || 'Active',
      bl_number: metadata.bl_number,
      reference: metadata.reference,
      owner: metadata.owner,
      issue_date: metadata.issue_date,
      expiry_date: metadata.expiry_date,
      notes: metadata.notes,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from('documents').remove([storagePath]);
    throw dbError;
  }
  return doc;
}

export async function downloadDocument(documentId: string) {
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path, title')
    .eq('id', documentId)
    .single();
  if (fetchError || !doc?.storage_path) throw new Error('Document not found');

  const { data, error } = await supabase.storage
    .from('documents')
    .download(doc.storage_path);
  if (error) throw error;
  return { data, fileName: doc.title };
}

export async function deleteDocument(documentId: string) {
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', documentId)
    .single();
  if (fetchError) throw fetchError;

  if (doc.storage_path) {
    await supabase.storage.from('documents').remove([doc.storage_path]);
  }
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
  if (dbError) throw dbError;
  return true;
}
