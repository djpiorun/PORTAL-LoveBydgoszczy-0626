import { useParams, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Facebook, Instagram, Download, Link as LinkIcon } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RealisticCandle from "@/components/obituaries/RealisticCandle";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const CrossIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 36" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0V10H4V14H10V36H14V14H20V10H14V0H10Z" />
  </svg>
);

export default function ObituaryPage() {
  const { slug } = useParams();
  const obituary = useQuery(api.obituaries.getObituaryBySlug, { slug: slug || "" });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!cardRef.current || !obituary) return;
    
    const toastId = toast.loading("Generowanie obrazu...");
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: obituary.type === 'nekrolog' ? '#fcfbf9' : '#0f172a',
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${obituary.firstName}_${obituary.lastName}_${obituary.type}.png`;
      link.click();
      toast.success("Obraz został pobrany", { id: toastId });
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Nie udało się pobrać obrazu", { id: toastId });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link skopiowany do schowka");
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleInstagramShare = () => {
    handleDownloadImage();
    setTimeout(() => {
      toast.success("Pobrano obraz. Możesz go teraz udostępnić na Instagramie.");
    }, 1000);
  };

  if (obituary === undefined) {
    return (
      <div className="min-h-screen bg-[#080c17] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (obituary === null) {
    return (
      <div className="min-h-screen bg-[#080c17] flex items-center justify-center text-slate-200 font-serif text-xl">
        Nie znaleziono wpisu.
      </div>
    );
  }

  const isDarkTheme = obituary.type !== 'nekrolog';
  const addedDate = new Date(obituary._creationTime).toLocaleDateString('pl-PL');

  const renderNekrolog = () => (
    <div ref={cardRef} className="max-w-2xl mx-auto bg-[#fcfbf9] text-black p-2 relative shadow-2xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
      <div className="border-[8px] border-black p-1">
        <div className="border-2 border-black p-8 sm:p-12 flex flex-col items-center text-center relative bg-white/80 backdrop-blur-sm">
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-black"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-black"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-black"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-black"></div>

          <CrossIcon className="w-10 h-16 mb-6 text-black" />

          <p className="text-lg sm:text-xl italic font-serif mb-8 text-gray-800">
            Z głębokim żalem zawiadamiamy, że w dniu {obituary.deathDate ? new Date(obituary.deathDate).toLocaleDateString('pl-PL') : '...'} zmarł{obituary.firstName.endsWith('a') ? 'a' : ''}
          </p>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold mb-4 uppercase tracking-wider text-black leading-tight">
            Śp.<br />{obituary.firstName} {obituary.lastName}
          </h1>

          {(obituary.age || obituary.birthDate || obituary.deathDate) && (
            <p className="text-xl font-serif mb-10 text-gray-800">
              przeżywszy {obituary.age || (obituary.birthDate && obituary.deathDate ? Math.floor((Number(new Date(obituary.deathDate)) - Number(new Date(obituary.birthDate))) / (1000 * 60 * 60 * 24 * 365.25)) : '...')} lat
            </p>
          )}

          <div className="w-32 h-px bg-black mx-auto mb-10"></div>

          <div className="whitespace-pre-wrap font-serif text-lg sm:text-xl leading-relaxed mb-12 max-w-xl mx-auto text-gray-900">
            {obituary.content}
          </div>

          {(obituary.funeralDate || obituary.funeralPlace || obituary.cemeteryPlace) && (
            <div className="font-serif text-lg sm:text-xl space-y-3 mb-16 text-gray-900">
              {obituary.funeralDate && (
                <p>Msza Święta żałobna odprawiona zostanie w dniu<br /><strong>{new Date(obituary.funeralDate).toLocaleDateString('pl-PL')}</strong> o godz. <strong>{obituary.funeralTime || '...'}</strong></p>
              )}
              {obituary.funeralPlace && <p>w <strong>{obituary.funeralPlace}</strong></p>}
              {obituary.cemeteryPlace && (
                <p>po czym nastąpi odprowadzenie Zmarł{obituary.firstName.endsWith('a') ? 'ej' : 'ego'} na<br /><strong>{obituary.cemeteryPlace}</strong>.</p>
              )}
            </div>
          )}

          <div className="w-32 h-px bg-black mx-auto mb-10"></div>

          <p className="italic font-serif text-xl text-gray-800">
            O pogrzebie zawiadamia pogrążona w smutku<br />
            <strong className="text-black mt-3 block text-2xl">{obituary.submitterRelation || 'Rodzina'}</strong>
          </p>

          <p className="text-xs text-gray-400 mt-8">Dodano: {addedDate}</p>

          <div className="mt-8 pt-4 border-t border-black/10 w-full text-center">
            <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Nekrologi dostępne na portalu LoveBydgoszcz.pl</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWspomnienie = () => (
    <div ref={cardRef} className="max-w-4xl mx-auto bg-slate-900/80 text-slate-200 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-amber-500/20 backdrop-blur-sm overflow-hidden">
      {/* Image with gradient overlay from top */}
      {obituary.image && (
        <div className="relative w-full h-[380px] overflow-hidden">
          <img
            src={obituary.image}
            alt=""
            crossOrigin="anonymous"
            className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
        </div>
      )}

      <div className="relative z-10 p-8 sm:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3 flex flex-col items-center">
          {!obituary.image && (
            <div className="mb-8 flex items-center justify-center">
              <RealisticCandle className="w-20 h-40 opacity-80" />
            </div>
          )}
          <div className="text-center font-serif">
            <h2 className="text-3xl font-bold uppercase mb-3 text-amber-400 tracking-wider">
              {obituary.firstName}<br />{obituary.lastName}
            </h2>
            <p className="text-slate-300 font-bold tracking-widest text-sm">
              {obituary.birthDate ? new Date(obituary.birthDate).getFullYear() : '*'}
              <span className="mx-2 text-amber-500/50">-</span>
              {obituary.deathDate ? new Date(obituary.deathDate).getFullYear() : '†'}
            </p>
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col">
          <div className="border-b border-amber-500/20 pb-6 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500/70 bg-amber-500/5 px-3 py-1 border border-amber-500/20 inline-block mb-4">Wspomnienie</span>
            {obituary.title && <h1 className="text-3xl sm:text-4xl font-serif font-bold mt-2 text-slate-100 leading-tight">{obituary.title}</h1>}
          </div>

          <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-300 flex-1 italic font-light">
            {obituary.content}
          </div>

            <div className="mt-12 pt-8 border-t border-amber-500/20 flex justify-between items-end font-serif">
              <p className="text-slate-500 text-xs font-sans">Dodano: {addedDate}</p>
              <div className="text-right">
                <p className="text-amber-500/60 text-xs uppercase tracking-widest mb-2">Wspomina</p>
                <p className="text-xl font-bold text-amber-400">{obituary.submitterName || obituary.submitterRelation || "Bliscy"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-amber-500/20 text-center w-full">
          <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">Nekrologi dostępne na portalu LoveBydgoszcz.pl</p>
        </div>
      </div>
    </div>
  );

  const renderPozegnanie = () => (
    <div ref={cardRef} className="max-w-3xl mx-auto bg-slate-900/80 text-slate-200 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-amber-500/20 backdrop-blur-sm overflow-hidden">
      {/* Image with gradient overlay from top */}
      {obituary.image && (
        <div className="relative w-full h-[360px] overflow-hidden">
          <img
            src={obituary.image}
            alt=""
            crossOrigin="anonymous"
            className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
        </div>
      )}

      <div className="relative z-10 p-8 sm:p-16 text-center">
        <div className="mb-10">
          <span className="inline-block px-5 py-2 rounded-full border border-amber-500/30 text-xs font-bold uppercase tracking-widest text-amber-500/80 bg-slate-900/80 backdrop-blur-sm">
            Pożegnanie
          </span>
        </div>

        {!obituary.image && (
          <div className="mb-10 flex items-center justify-center">
            <RealisticCandle className="w-16 h-32 opacity-80" />
          </div>
        )}

        {obituary.image && (
          <div className="w-36 h-36 mx-auto mb-10 rounded-full border-2 border-amber-500/30 p-1 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <img
              src={obituary.image}
              alt=""
              crossOrigin="anonymous"
              className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        )}

        <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-10 uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
          Śp. {obituary.firstName} {obituary.lastName}
        </h1>

        <div className="flex items-center justify-center gap-4 mb-12 opacity-60">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500"></div>
          <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>

        <div className="whitespace-pre-wrap font-serif text-xl sm:text-2xl leading-relaxed text-slate-300 max-w-2xl mx-auto mb-16 italic font-light">
          "{obituary.content}"
        </div>

        <div className="flex items-center justify-center gap-4 mb-12 opacity-60">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500"></div>
          <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>

        <div className="font-serif flex justify-between items-end">
          <p className="text-slate-500 text-xs font-sans">Dodano: {addedDate}</p>
          <div className="text-right">
            <p className="mb-2 text-slate-400 italic font-light text-sm">Z wyrazami głębokiego współczucia</p>
            <p className="text-2xl font-bold text-amber-400">{obituary.submitterName || obituary.submitterRelation || "Bliscy"}</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-amber-500/20 text-center w-full">
          <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">Nekrologi dostępne na portalu LoveBydgoszcz.pl</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col relative font-serif ${isDarkTheme ? 'text-slate-200' : 'text-black'}`}>
      <div className={`fixed inset-0 z-[-2] ${isDarkTheme ? 'bg-[#080c17]' : 'bg-[#e5e5e5]'}`}></div>

      {isDarkTheme ? (
        <>
          <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none z-[-1]"></div>
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>
        </>
      ) : (
        <>
          <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] opacity-40 pointer-events-none z-[-1]"></div>
          <div className="fixed inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none z-[-1]"></div>
        </>
      )}

      <SEO
        title={`${obituary.firstName} ${obituary.lastName} - ${obituary.type === 'nekrolog' ? 'Nekrolog' : obituary.type === 'wspomnienie' ? 'Wspomnienie' : 'Pożegnanie'} | Love Bydgoszcz`}
        description={obituary.shortDescription || ((obituary.content || "").substring(0, 150) + '...')}
        image={obituary.image}
      />
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/nekrolog"
            className={`inline-flex items-center text-sm font-bold uppercase tracking-widest mb-12 transition-colors border-b border-transparent pb-1 ${isDarkTheme ? 'text-amber-500 hover:text-amber-400 hover:border-amber-400' : 'text-black hover:text-gray-600 hover:border-black'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do tablicy
          </Link>

          {obituary.type === 'nekrolog' && renderNekrolog()}
          {obituary.type === 'wspomnienie' && renderWspomnienie()}
          {obituary.type === 'pozegnanie' && renderPozegnanie()}

          {/* Share Section */}
          <div className="max-w-3xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleFacebookShare}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isDarkTheme ? 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/20' : 'bg-[#1877F2] text-white hover:bg-[#1864D9] shadow-lg'}`}
            >
              <Facebook className="w-5 h-5" />
              Udostępnij
            </button>
            
            <button
              onClick={handleInstagramShare}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isDarkTheme ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border border-pink-500/20' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg'}`}
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </button>

            <button
              onClick={handleDownloadImage}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isDarkTheme ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' : 'bg-white text-black hover:bg-gray-50 shadow-lg border border-gray-200'}`}
            >
              <Download className="w-5 h-5" />
              Pobierz obraz
            </button>

            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${isDarkTheme ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' : 'bg-white text-black hover:bg-gray-50 shadow-lg border border-gray-200'}`}
            >
              <LinkIcon className="w-5 h-5" />
              Kopiuj link
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
