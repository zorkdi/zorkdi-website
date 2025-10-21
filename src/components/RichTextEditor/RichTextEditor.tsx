// src/components/RichTextEditor/RichTextEditor.tsx

"use client";

// NAYA: useEffect import kiya
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import styles from './Editor.module.css';
import { ChangeEvent, useRef, useEffect } from 'react'; // useEffect added

// Toolbar component
const Toolbar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return; // Add check for editor

    const storageRef = ref(storage, `blog_images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error("Image upload error:", error);
        alert("Image upload failed!");
         // Reset file input to allow re-uploading the same file if needed
         if(fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // NAYA: Check if editor is still available before running command
          if (editor && !editor.isDestroyed) {
             editor.chain().focus().setImage({ src: downloadURL }).run();
          }
        });
         // Reset file input after successful upload
         if(fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
    );
  };

  return (
    <div className={styles.toolbar}>
      {/* Text formatting buttons... */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.isActive : styles.toolbarButton}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.isActive : styles.toolbarButton}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? styles.isActive : styles.toolbarButton}>Paragraph</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? styles.isActive : styles.toolbarButton}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.isActive : styles.toolbarButton}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.isActive : styles.toolbarButton}>List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? styles.isActive : styles.toolbarButton}>Quote</button>

      {/* Image upload button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/gif"
      />
      {/* NAYA: Changed button type to "button" to prevent form submission */}
      <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.toolbarButton}>
        Image
      </button>
    </div>
  );
};

// Main Editor component
const RichTextEditor = ({ content, onChange }: { content: string, onChange: (richText: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Image.configure({
        inline: false,
      }),
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // NAYA: Explicitly destroy the editor on component unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]); // Dependency array includes editor

  return (
    <div className={styles.editorContainer}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;