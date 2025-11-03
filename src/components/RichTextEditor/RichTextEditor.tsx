// src/components/RichTextEditor/RichTextEditor.tsx

"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FaSpinner } from 'react-icons/fa'; // FaSpinner import kiya

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
                
                // CRITICAL FIX: Inline styling REMOVED. Ab CSS control karegi.
                // Image ko <p> tag mein wrap kiya (Rich Text Editor mein common hai)
                const imageHTML = `<p><img 
                    src="${finalImageURL}" 
                    alt="Uploaded Content Image" 
                /></p>`; 

                // Success callback: Editor mein content insert karna
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
        
        // FIX: Toolbar mein 'imagerow' button add kiya
        toolbar: 'undo redo | bold italic | h1 h2 h3 | link image imagerow | bullist numlist | blockquote | code | help',
        
        content_style: 'body { font-family:Poppins,sans-serif; font-size:16px; color: #EFEFEF; }',
        skin: 'oxide-dark', 
        content_css: 'dark', 
        
        // NAYA CRITICAL FIX: plugins ko cloud se load karne ke liye
        tinymceScriptURL: 'https://cdn.tiny.cloud/1/' + TINYMCE_API_KEY + '/tinymce/6/tinymce.min.js',

        images_upload_handler: imageUploadHandler,
        image_title: true,
        automatic_uploads: true,
        file_picker_types: 'image',

        // NAYA: Custom button setup karna
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
                // FIX: Key ko Environment Variable se use kiya
                apiKey={TINYMCE_API_KEY === 'no-api-key-found' ? undefined : TINYMCE_API_KEY} 
                onInit={(_evt: any, editor: any) => editorRef.current = editor} 
                initialValue={content}
                onEditorChange={(newContent: string) => onChange(newContent)} 
                init={config}
            />
             {TINYMCE_API_KEY === 'no-api-key-found' && (
                <div style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>
                    CRITICAL: Please set NEXT_PUBLIC_TINYMCE_API_KEY in your .env.local file.
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;