import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut } from "lucide-react";
import curatedImages from "./data/curatedImages.json";

export function WorkLightbox({ images, title, initialIndex, onDismiss }: {
  images: string[];
  title: string;
  initialIndex: number;
  onDismiss: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const src = images[index];
  const image = curatedImages[src as keyof typeof curatedImages];
  const largeSrc = image?.largeSrc ?? src;
  const isLong = image && image.height / image.width > 3;

  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  const navigate = (direction: number) => {
    setIndex((current) => (current + direction + images.length) % images.length);
    setZoomed(false);
    bodyRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  return (
    <dialog className="work-lightbox" ref={dialogRef} aria-label={`${title} 大图浏览`} onCancel={(event) => { event.preventDefault(); onDismiss(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          navigate(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
      <div className="lightbox-toolbar">
        <div className="lightbox-caption"><span>{title}</span><span role="status" aria-live="polite">{index + 1} / {images.length}</span></div>
        <div className="lightbox-tools">
          <button type="button" aria-label={zoomed ? "适应屏幕" : "放大看细节"} aria-pressed={zoomed} onClick={() => setZoomed((current) => !current)}>{zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}</button>
          <button type="button" aria-label="关闭大图" onClick={onDismiss} autoFocus><X size={22} /></button>
        </div>
      </div>
      <div className={`lightbox-body${zoomed ? " is-zoomed" : ""}${isLong ? " is-long" : ""}`} ref={bodyRef}>
        <img key={src} src={largeSrc} alt={`${title}，第 ${index + 1} 张作品`} decoding="async" />
      </div>
      <div className="lightbox-footer">
        <button type="button" onClick={() => navigate(-1)} disabled={images.length < 2}><ArrowLeft size={18} aria-hidden="true" />上一张</button>
        <a href={largeSrc} target="_blank" rel="noreferrer">打开原图</a>
        <button type="button" onClick={() => navigate(1)} disabled={images.length < 2}>下一张<ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </dialog>
  );
}
