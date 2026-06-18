import { motion } from "framer-motion";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";

export default function SocialWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-2 w-full"
    >
      <a href="#" className="w-full flex items-center justify-between bg-[#1877F2] text-white p-1.5 px-3 rounded-xl hover:bg-[#1864D9] transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1 rounded-lg group-hover:scale-110 transition-transform">
            <Facebook className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs">Facebook</span>
        </div>
        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">45.5k polubień</span>
      </a>
      
      <a href="#" className="w-full flex items-center justify-between bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] text-white p-1.5 px-3 rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md group">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1 rounded-lg group-hover:scale-110 transition-transform">
            <Instagram className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs">Instagram</span>
        </div>
        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">7.5k obserwujących</span>
      </a>
      
      <div className="flex items-center justify-center gap-2 mt-1">
        <a href="#" className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
          <Youtube className="w-3.5 h-3.5" />
        </a>
        <a href="#" className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
          <Twitter className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}