// src/app/admin/blog/edit/[postId]/page.tsx

"use client"; 

import NewPostForm from '@/app/admin/blog/new/NewPostForm'; // NAYA: NewPostForm component use kiya

// Props for the component
interface EditPostPageProps {
  params: {
      postId: string; // ID for edit mode
  }
}

const AdminEditPostPage = ({ params }: EditPostPageProps) => {
  const { postId } = params;

  // FIX: Saara logic NewPostForm mein hai, isko sirf render karo
  return (
    <NewPostForm postId={postId} />
  );
};

export default AdminEditPostPage;