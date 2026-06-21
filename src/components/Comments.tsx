import { useCallback, useEffect, useState } from "react";
import { Heart, Send, MessageCircle, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createComment, fetchComments, likeComment } from "@/lib/comments-api";

interface CommentsProps {
  targetId: string;
  targetType: string;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "przed chwilą";
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  return `${days} dni temu`;
}

interface CommentType {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  likes: number;
  status?: string;
  parentId?: string | null;
}

const normalizeComment = (comment: any): CommentType => ({
  id: comment.id,
  authorName: comment.author_name,
  content: comment.content,
  createdAt: comment.created_at ? new Date(comment.created_at).getTime() : Date.now(),
  likes: comment.likes ?? 0,
  status: comment.status ?? undefined,
  parentId: comment.parent_id ?? null,
});

interface ReplyFormProps {
  targetId: string;
  targetType: string;
  parentId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function ReplyForm({ targetId, targetType, parentId, onClose, onSaved }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createComment({
        target_id: targetId,
        target_type: targetType,
        author_name: authorName.trim() || "",
        content: content.trim(),
        parent_id: parentId,
      });
      setContent("");
      await onSaved();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 ml-4 pl-3 border-l-2 border-primary/30"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Twój podpis (opcjonalnie)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="bg-slate-50 text-sm px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-1/2 font-medium text-slate-700 placeholder:text-slate-400"
        />
        <div className="flex items-center gap-2 bg-slate-50 rounded-full border border-slate-200 p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
          <input
            type="text"
            placeholder="Napisz odpowiedź..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 font-semibold"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${content.trim() ? "bg-primary text-white shadow-md hover:scale-105 active:scale-95" : "bg-slate-200 text-slate-400"}`}
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

interface CommentItemProps {
  comment: CommentType;
  replies: CommentType[];
  targetId: string;
  targetType: string;
  depth?: number;
  onSaved: () => Promise<void>;
}

function CommentItem({ comment, replies, targetId, targetType, depth = 0, onSaved }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const hasAuthor = comment.authorName && comment.authorName.trim() !== "" && comment.authorName !== "Anonim";

  const handleLike = async () => {
    await likeComment(comment.id);
    await onSaved();
  };

  return (
    <div className={`flex gap-3 group ${depth > 0 ? "ml-8 mt-2" : ""}`}>
      {hasAuthor ? (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border border-primary/20 flex-shrink-0 flex items-center justify-center text-primary text-sm font-bold shadow-sm">
          {comment.authorName.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400 text-sm shadow-sm">
          <MessageCircle className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`rounded-2xl ${depth > 0 ? "rounded-tl-none" : "rounded-tl-none"} p-3 border shadow-sm ${depth > 0 ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            {hasAuthor ? (
              <span className="font-bold text-sm text-slate-800">{comment.authorName}</span>
            ) : (
              <span className="text-xs text-slate-400 italic">anonimowo</span>
            )}
            <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 ml-2">
          {depth === 0 && (
            <button
              onClick={() => setReplyOpen((o) => !o)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-primary transition-colors"
            >
              <CornerDownRight className="w-3 h-3" /> Odpowiedz
            </button>
          )}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${comment.likes > 0 ? "fill-red-500 text-red-500" : ""}`} />
            {comment.likes > 0 && <span className={comment.likes > 0 ? "text-red-500" : ""}>{comment.likes}</span>}
          </button>
        </div>
        <AnimatePresence>
          {replyOpen && (
            <ReplyForm
              targetId={targetId}
              targetType={targetType}
              parentId={comment.id}
              onClose={() => setReplyOpen(false)}
              onSaved={onSaved}
            />
          )}
        </AnimatePresence>
        {replies.length > 0 && (
          <div className="mt-2 space-y-2 border-l-2 border-slate-100 pl-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                targetId={targetId}
                targetType={targetType}
                depth={1}
                onSaved={onSaved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Comments({ targetId, targetType }: CommentsProps) {
  const [comments, setComments] = useState<CommentType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchComments(targetId, targetType);
      const data = Array.isArray(response) ? response : response ?? [];
      const items = data.map(normalizeComment);
      setComments(items);
    } catch {
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!isMounted) return;
      await loadComments();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [loadComments]);

  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        target_id: targetId,
        target_type: targetType,
        author_name: authorName.trim() || "",
        content: content.trim(),
      });
      setContent("");
      await loadComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const topLevel = (comments ?? []).filter((c) => !c.parentId);
  const repliesMap: Record<string, CommentType[]> = {};
  (comments ?? []).forEach((c) => {
    if (c.parentId) {
      const key = c.parentId as string;
      if (!repliesMap[key]) repliesMap[key] = [];
      repliesMap[key].push(c as CommentType);
    }
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : topLevel.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
            <MessageCircle className="w-12 h-12 text-slate-400" />
            <p className="text-slate-500 font-medium">Brak komentarzy.<br />Bądź pierwszą osobą, która skomentuje!</p>
          </div>
        ) : (
          topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment as CommentType}
              replies={(repliesMap[comment.id as string] ?? []) as CommentType[]}
              targetId={targetId}
              targetType={targetType}
              onSaved={loadComments}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Twój podpis (opcjonalnie)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="bg-slate-50 text-sm px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-1/2 font-medium text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-2 bg-slate-50 rounded-full border border-slate-200 p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white transition-all">
            <input
              type="text"
              placeholder="Napisz komentarz..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${content.trim() ? "bg-primary text-white shadow-md hover:scale-105 active:scale-95" : "bg-slate-200 text-slate-400"}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
