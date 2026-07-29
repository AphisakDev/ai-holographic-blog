import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Heart,
  ArrowLeft,
  Calendar,
  User,
  X,
  Copy,
  Trash2,
  Send,
  MessageSquare
} from 'lucide-react';
import { 
  getPost, 
  getComments, 
  createComment, 
  deleteComment, 
  toggleLike, 
  type Post, 
  type CommentItem 
} from '../lib/api';
import { formatDate } from '../lib/utils';
import heroCatImg from '../assets/aii.png';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export default function ViewPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLogin = Boolean(user);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // alert dialog state
  const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  // comment state
  const [commentText, setCommentText] = useState<string>('');
  const [isSendingComment, setIsSendingComment] = useState<boolean>(false);

  // like state
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // copy link state
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      if (!postId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [postData, commentList] = await Promise.all([
          getPost(postId),
          getComments(postId).catch(() => [])
        ]);

        if (postData) {
          setPost(postData);
          setComments(commentList);
        } else {
          setError('Article not found');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [postId]);

  const handleLikeClick = async () => {
    if (!isLogin) {
      setAlertMessage('กรุณาเข้าสู่ระบบก่อนกดไลก์บทความนี้');
      setShowLoginAlert(true);
      return;
    }

    if (!postId || !post || isLiking) return;

    setIsLiking(true);
    try {
      const res = await toggleLike(postId);
      setPost({
        ...post,
        likes: res.likes,
        likedBy: res.likedBy
      });
      toast.success(res.isLiked ? 'กดถูกใจบทความนี้แล้ว 💖' : 'ยกเลิกการถูกใจแล้ว');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการกดถูกใจ');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentInteraction = () => {
    if (!isLogin) {
      setAlertMessage('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
      setShowLoginAlert(true);
      const textarea = document.getElementById('comment-textarea');
      if (textarea) {
        (textarea as HTMLTextAreaElement).blur();
      }
    }
  };

  const handleSendComment = async () => {
    if (!isLogin) {
      setAlertMessage('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
      setShowLoginAlert(true);
      return;
    }

    if (!commentText.trim() || !postId || isSendingComment) return;

    setIsSendingComment(true);
    try {
      const newComment = await createComment(postId, commentText);
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('ส่งความคิดเห็นสำเร็จแล้ว!');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการส่งความคิดเห็น');
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId) return;
    try {
      await deleteComment(postId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('ลบความคิดเห็นเรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถลบความคิดเห็นได้');
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Copied!', {
          description: 'This article has been copied to your clipboard.',
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err: any) {
      console.error('Failed to copy link:', err);
      toast.error('ไม่สามารถคัดลอกลิงก์ได้ในขณะนี้');
    }
  };

  const handleShare = (platform: 'facebook' | 'linkedin' | 'twitter') => {
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/share.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://www.twitter.com/share?&url=${url}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const isLikedByCurrentUser = Boolean(user && post?.likedBy?.includes(user.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 flex-grow" id="post-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-accent mb-4"></div>
        <p className="text-custom-text-muted text-lg animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 flex-grow text-center px-4" id="post-error">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl max-w-md mb-6 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Error Loading Article</h3>
          <p className="text-sm opacity-90">{error || 'Article not found.'}</p>
        </div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold py-2.5 px-6 rounded-full transition-all duration-200 bg-custom-btn-signup-bg text-custom-btn-signup-text hover:opacity-90 shadow-md"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-6 w-full max-w-[800px] mx-auto py-4 animate-fade-in-down" id="view-post">
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] hover:border-custom-text-primary transition-all duration-200"
          id="btn-back-home"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <span className="bg-green-200 dark:bg-green-950/40 rounded-full px-3.5 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
          {post.category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-custom-text-primary text-start leading-[1.15]" id="post-title">
        {post.title}
      </h1>

      {/* Author and Date Meta Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-custom-border" id="post-meta">
        <div className="flex items-center text-sm">
          <img 
            className="w-10 h-10 rounded-full mr-3 border border-custom-border object-cover" 
            src={heroCatImg} 
            alt={post.author} 
          />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-custom-text-primary flex items-center gap-1.5">
              <User size={13} className="text-custom-text-muted" />
              {post.author}
            </span>
            <span className="text-xs text-custom-text-muted flex items-center gap-1.5 mt-0.5">
              <Calendar size={13} />
              {formatDate(post.date)}
            </span>
          </div>
        </div>

        <button 
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`flex items-center gap-2 border rounded-full py-1.5 px-4 text-sm cursor-pointer transition-all active:scale-95 ${
            isLikedByCurrentUser 
              ? 'bg-red-500/10 border-red-500/30 text-red-500' 
              : 'bg-custom-footer-bg hover:bg-[rgba(28,26,23,0.03)] border-custom-border text-custom-text-primary'
          }`}
          id="post-likes-top"
        >
          <Heart size={16} className={isLikedByCurrentUser ? 'text-red-500 fill-red-500' : 'text-red-500'} />
          <span className="font-semibold">{post.likes} likes</span>
        </button>
      </div>

      {/* Hero Cover Image */}
      {post.image && (
        <div className="w-full aspect-[16/9] overflow-hidden rounded-[20px] border border-custom-border shadow-md" id="post-cover-image">
          <img 
            className="w-full h-full object-cover" 
            src={post.image} 
            alt={post.title} 
          />
        </div>
      )}

      {/* Markdown Content */}
      <div className="markdown mt-4" id="post-markdown-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Actions Bar (Likes, Copy, Shares) */}
      <div className="flex items-center justify-between bg-custom-footer-bg border border-custom-border rounded-2xl p-4 mt-8 flex-wrap gap-4" id="post-actions-bar">
        {/* Left Side: Like Button */}
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`flex items-center gap-2 border rounded-full py-2 px-5 text-sm font-semibold cursor-pointer transition-all shadow-sm active:scale-95 ${
            isLikedByCurrentUser
              ? 'bg-red-500 border-red-500 text-white shadow-red-500/20'
              : 'bg-custom-navbar-bg hover:bg-custom-navbar-bg/85 border-custom-border text-custom-text-primary'
          }`}
          id="btn-like-post"
        >
          <Heart size={16} className={isLikedByCurrentUser ? 'fill-white text-white' : 'text-red-500'} />
          <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
        </button>

        {/* Right Side: Copy Link and Social Shares */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-custom-navbar-bg hover:bg-custom-navbar-bg/85 border border-custom-border rounded-full py-2 px-5 text-sm font-semibold text-custom-text-primary cursor-pointer transition-all shadow-sm active:scale-95"
            id="btn-copy-link"
          >
            <Copy size={14} className="text-custom-text-muted" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={() => handleShare('facebook')}
            className="w-9 h-9 rounded-full bg-custom-navbar-bg hover:bg-custom-navbar-bg/85 border border-custom-border flex items-center justify-center text-custom-text-primary transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Share on Facebook"
          >
            <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="w-9 h-9 rounded-full bg-custom-navbar-bg hover:bg-custom-navbar-bg/85 border border-custom-border flex items-center justify-center text-custom-text-primary transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Share on LinkedIn"
          >
            <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="w-9 h-9 rounded-full bg-custom-navbar-bg hover:bg-custom-navbar-bg/85 border border-custom-border flex items-center justify-center text-custom-text-primary transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Share on Twitter"
          >
            <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Comment Section */}
      <div className="flex flex-col gap-6 mt-6 text-left" id="comment-section">
        <h3 className="text-xl font-bold text-custom-text-primary flex items-center gap-2">
          <MessageSquare size={20} />
          Comments ({comments.length})
        </h3>
        
        <div className="flex flex-col items-end gap-3 w-full">
          <textarea
            placeholder={isLogin ? "แสดงความคิดเห็นของคุณที่นี่..." : "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={handleCommentInteraction}
            onClick={handleCommentInteraction}
            className="w-full text-sm font-medium p-4 min-h-[120px] rounded-[16px] border border-custom-border bg-custom-navbar-bg text-custom-text-primary outline-none transition-all duration-250 placeholder:text-custom-text-muted focus:border-custom-text-primary focus:shadow-[0_0_0_3px_rgba(28,26,23,0.05)] resize-none"
            id="comment-textarea"
          />
          <button
            onClick={handleSendComment}
            disabled={isSendingComment || !commentText.trim()}
            className="inline-flex items-center gap-2 text-sm font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn-send-comment"
          >
            <Send size={14} />
            <span>{isSendingComment ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}</span>
          </button>
        </div>

        {/* Comment List */}
        <div className="flex flex-col gap-4 mt-4">
          {comments.length === 0 ? (
            <p className="text-sm text-custom-text-muted italic text-center py-6 border border-dashed border-custom-border rounded-xl">
              ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นในบทความนี้!
            </p>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl border border-custom-border bg-custom-footer-bg/50 transition-all hover:border-custom-border/80"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-custom-btn-signup-bg text-custom-btn-signup-text flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                      comment.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-custom-text-primary">{comment.userName}</span>
                      <span className="text-xs text-custom-text-muted">
                        {new Date(comment.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-custom-text-primary mt-1.5 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {user && (user.id === comment.userId || user.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1.5 rounded-lg text-custom-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="ลบความคิดเห็น"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* shadcn AlertDialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="max-w-[400px] p-6 rounded-[24px] border border-custom-border bg-custom-navbar-bg text-custom-text-primary shadow-lg flex flex-col items-center">
          
          <AlertDialogCancel className="absolute right-4 top-4 rounded-full p-2 border-0 bg-transparent hover:bg-[rgba(28,26,23,0.05)] dark:hover:bg-[rgba(244,242,238,0.05)] text-custom-text-primary cursor-pointer transition-colors duration-200" size="icon-xs" variant="ghost">
            <X size={18} />
          </AlertDialogCancel>

          <AlertDialogHeader className="flex flex-col items-center text-center mt-4">
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-custom-text-primary">
              เข้าสู่ระบบเพื่อดำเนินการต่อ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-custom-text-secondary mt-2 px-2">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3.5 mt-6 items-center w-full">
            <button
              onClick={() => {
                setShowLoginAlert(false);
                navigate('/signup');
              }}
              className="w-full text-sm font-semibold py-3 px-6 rounded-full cursor-pointer bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text hover:opacity-90 transition-all text-center flex items-center justify-center"
            >
              สมัครสมาชิก
            </button>
            <div className="text-sm text-custom-text-secondary mt-1">
              มีบัญชีอยู่แล้ว?{' '}
              <button 
                onClick={() => {
                  setShowLoginAlert(false);
                  navigate('/login');
                }} 
                className="font-semibold text-custom-text-primary hover:underline bg-transparent border-0 cursor-pointer p-0 inline"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
