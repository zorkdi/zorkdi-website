// src/app/admin/blog/edit/[postId]/page.tsx

"use client"; 

import { use } from 'react'; // NAYA: 'use' hook import kiya params unwrap karne ke liye
import NewPostForm from '@/app/admin/blog/new/NewPostForm'; 

// Props definition update kiya Next.js 15 ke hisaab se
// Params ab ek Promise hai
interface EditPostPageProps {
  params: Promise<{
      postId: string; 
  }>
}

const AdminEditPostPage = ({ params }: EditPostPageProps) => {
  // NAYA: Params ko 'use' hook se unwrap kiya (Next.js 15 Requirement)
  // Isse woh error "params.postId accessed directly" chala jayega
  const { postId } = use(params);

  return (
    <NewPostForm postId={postId} />
  );
};

export default AdminEditPostPage;