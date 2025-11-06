// src/app/admin/blog/new/page.tsx

"use client"; 

import NewPostForm from '@/app/admin/blog/new/NewPostForm'; // Ensure this path is correct

const CreatePostPage = () => {
  // Directly render the self-contained, TinyMCE-free form component
  return (
    <NewPostForm />
  );
};

export default CreatePostPage;