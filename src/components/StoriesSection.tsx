import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import StoryViewer from "./StoryViewer";
import { Sparkles, Play } from "lucide-react";

export default function StoriesSection() {
  const stories = useQuery(api.stories.getActive);
  const reelsForStories = useQuery(api.reels.listForStories);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);

  // Convert reels to story-compatible format for StoryViewer
  const reelStories = (reelsForStories ?? []).map((reel) => ({
    _id: reel._id,
    title: reel.title,
    author: reel.author ?? "Love Bydgoszcz",
    coverImage: reel.coverImage ?? "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80",
    items: [
      {
        type: (reel.sourceType === "facebook" ? "facebook_reel" : "video") as "video" | "facebook_reel",
        url: reel.embedUrl ?? reel.videoUrl,
        duration: 30,
        text: reel.description,
        link: reel.videoUrl,
      },
    ],
  }));

  const hasContent = (stories && stories.length > 0) || (reelsForStories && reelsForStories.length > 0);
  if (!hasContent && stories !== undefined && reelsForStories !== undefined) return null;

  const allStories = [...(stories ?? [])];
  const storiesCount = allStories.length;

  return (
    <section className="relative z-10 overflow-visible border-b border-border/40 bg-transparent pb-5 pt-6">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-primary">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-foreground/70">Relacje i Stories</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 pt-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden snap-x">
          {/* Regular stories */}
          {(stories ?? []).map((story, index) => (
            <motion.button
              key={story._id}
              type="button"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0 outline-none"
              onClick={() => setActiveStoryIndex(index)}
            >
              <div className="relative">
                <div className="h-[4.2rem] w-[4.2rem] rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-primary to-rose-500 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <div className="h-full w-full rounded-full border-2 border-background overflow-hidden bg-muted">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background shadow-sm" />
              </div>
              <div className="w-[4.5rem] text-center">
                <p className="text-[10px] font-bold truncate text-foreground/75 group-hover:text-foreground transition-colors leading-tight">
                  {story.author}
                </p>
                <p className="text-[9px] truncate text-muted-foreground leading-tight mt-0.5">
                  {story.title}
                </p>
              </div>
            </motion.button>
          ))}

          {/* Reels shown in stories */}
          {(reelsForStories ?? []).map((reel, index) => (
            <motion.button
              key={reel._id}
              type="button"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.32, delay: (storiesCount + index) * 0.06 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="group flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0 outline-none"
              onClick={() => setActiveReelId(reel._id)}
            >
              <div className="relative">
                {/* Rose/pink gradient ring to distinguish reels from stories */}
                <div className="h-[4.2rem] w-[4.2rem] rounded-full p-[2.5px] bg-gradient-to-tr from-rose-500 via-pink-500 to-orange-400 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <div className="h-full w-full rounded-full border-2 border-background overflow-hidden bg-muted">
                    {reel.coverImage ? (
                      <img
                        src={reel.coverImage}
                        alt={reel.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Play icon badge to indicate it's a video reel */}
                <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-background shadow-sm flex items-center justify-center">
                  <Play className="h-1.5 w-1.5 text-white fill-white ml-px" />
                </div>
              </div>
              <div className="w-[4.5rem] text-center">
                <p className="text-[10px] font-bold truncate text-foreground/75 group-hover:text-foreground transition-colors leading-tight">
                  {reel.author ?? "Rolka"}
                </p>
                <p className="text-[9px] truncate text-muted-foreground leading-tight mt-0.5">
                  {reel.title}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Regular story viewer */}
      {activeStoryIndex !== null && stories && (
        <StoryViewer
          stories={stories}
          initialStoryIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}

      {/* Reel viewer (shown as a story) */}
      {activeReelId !== null && (
        <StoryViewer
          stories={reelStories}
          initialStoryIndex={reelStories.findIndex(r => r._id === activeReelId)}
          onClose={() => setActiveReelId(null)}
        />
      )}
    </section>
  );
}