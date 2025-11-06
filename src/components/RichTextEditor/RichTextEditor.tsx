// src/components/RichTextEditor/RichTextEditor.tsx

"use client";

import React, { useRef, useState } from 'react'; 
import { Editor } from '@tinymce/tinymce-react';

import { FaSpinner } from 'react-icons/fa'; 

// Firebase imports for image upload
import { storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// NAYA: Environment variable se key load karna
const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key-found';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = useRef<any>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // --- Custom Image Row Command ---
    const insertImageRow = () => {
        if (editorRef.current) {
            const htmlToInsert = `
                <div class="imageRow">
                    <p><img src="/images/placeholder.png" alt="First Image" /></p>
                    <p><img src="/images/placeholder.png" alt="Second Image" /></p>
                </div>
            `;
            editorRef.current.execCommand('mceInsertContent', false, htmlToInsert); 
        }
    };

    // --- Image Upload Handler ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageUploadHandler = (blobInfo: any, success: (url: string) => void, failure: (error: string) => void) => {
        setUploading(true);
        setUploadError('');
        
        const file = blobInfo.blob();
        const storageRef = ref(storage, `editor_images/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            () => {
                // Progress tracking agar zaroori ho
            },
            (error) => {
                setUploading(false);
                setUploadError('Image upload failed: ' + error.message);
                failure('Image upload failed: ' + error.message);
            },
            async () => {
                const finalImageURL = await getDownloadURL(uploadTask.snapshot.ref);
                setUploading(false);
                setUploadError('');
                
                const imageHTML = `<p><img 
                    src="${finalImageURL}" 
                    alt="Uploaded Content Image" 
                /></p>`; 

                success(imageHTML);
            }
        );
    };

    // --- Editor Configuration ---
    const config = {
        height: 500,
        menubar: false,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
        ],
        
        toolbar: 'undo redo | bold italic | h1 h2 h3 | link image imagerow | bullist numlist | blockquote | code | help',
        
        content_style: 'body { font-family:Poppins,sans-serif; font-size:16px; color: #EFEFEF; }',
        skin: 'oxide-dark', 
        content_css: 'dark', 
        
        // CRITICAL FIX: tinymceScriptURL ko hata diya taaki woh invalid key ke saath load na ho.
        // tinymceScriptURL: 'https://cdn.tiny.cloud/1/' + TINYMCE_API_KEY + '/tinymce/6/tinymce.min.js',

        images_upload_handler: imageUploadHandler,
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setup: (editor: any) => {
            editor.ui.registry.addButton('imagerow', {
                text: 'Image Row',
                onAction: () => {
                    insertImageRow();
                }
            });
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {uploading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-neon-green)' }}>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '1rem' }} /> Uploading Image...
                </div>
            )}
            {uploadError && <p style={{ color: '#ff4757', textAlign: 'center', padding: '0.5rem' }}>{uploadError}</p>}

            <Editor
                apiKey={TINYMCE_API_KEY === 'hwfafxaz75m2t8p036w972tsxsgrt6z4n9hzs6wvt8yswc8k' ? undefined : TINYMCE_API_KEY} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onInit={(_evt: any, editor: any) => editorRef.current = editor} 
                initialValue={content}
                onEditorChange={(newContent: string) => onChange(newContent)} 
                init={config}
            />
             {/* CRITICAL WARNING MESSAGE (Agar key set nahi hai toh warning aayegi) */}
             {TINYMCE_API_KEY === 'hwfafxaz75m2t8p036w972tsxsgrt6z4n9hzs6wvt8yswc8k' && (
                <div style={{color: '#ffc966', backgroundColor: 'rgba(255, 165, 0, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginTop: '10px', border: '1px solid #ffc966'}}>
                    ⚠️ **WARNING:** TinyMCE API Key is missing. Editor may not function correctly. Please set **NEXT_PUBLIC_TINYMCE_API_KEY** in your environment variables.
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
