import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut } from "lucide-react";
import curatedImages from "./data/curatedImages.json";

export function WorkLightbox({ images, descriptions, title, initialIndex, onDismiss }: {
  images: string[];
  descriptions: string[];
  title: string;
  initialIndex: number;
  onDismiss: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const zoomButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const src = images[index];
  const image = curatedImages[src as keyof typeof curatedImages];
  const largeSrc = image?.largeSrc ?? src;
  const isLong = image && image.height / image.width > 3;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  const resetScroll = () => bodyRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });

  const navigate = (direction: number) => {
    if (images.length < 2) return;
    setIndex((current) => (current + direction + images.length) % images.length);
    setZoomed(false);
    resetScroll();
  };

  const dismiss = () => {
    dialogRef.current?.close();
    onDismiss();
  };

  const toggleZoom = () => {
    const next = !zoomed;
    setZoomed(next);
    if (next) bodyRef.current?.focus({ preventScroll: true });
    else {
      resetScroll();
      zoomButtonRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <dialog
      className="work-lightbox"
      ref={dialogRef}
      aria-label={title + " 大图浏览"}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        event.preventDefault();
        if (zoomed) {
          const body = bodyRef.current;
          if (body) body.scrollBy({ left: direction * Math.round(body.clientWidth / 4), behavior: "instant" });
        } else {
          navigate(direction);
        }
      }}
    >
      <div className="lightbox-toolbar">
        <div className="lightbox-caption"><span>{title}</span><span role="status" aria-live="polite">{index + 1} / {images.length}</span></div>
        <div className="lightbox-tools">
          <button ref={zoomButtonRef} type="button" aria-label="放大查看" aria-pressed={zoomed} onClick={toggleZoom}>
            {zoomed ? <ZoomOut size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}
          </button>
          <button ref={closeButtonRef} type="button" aria-label="关闭大图" onClick={dismiss}><X size={22} aria-hidden="true" /></button>
        </div>
      </div>
      <div
        className={"lightbox-body" + (zoomed ? " is-zoomed" : "") + (isLong ? " is-long" : "")}
        ref={bodyRef}
        tabIndex={zoomed || isLong ? 0 : -1}
        role="region"
        aria-label="作品图片"
      >
        <img key={src} src={largeSrc} alt={descriptions[index]} decoding="async" />
      </div>
      <div className="lightbox-footer">
        <button type="button" onClick={() => navigate(-1)} disabled={images.length < 2}><ArrowLeft size={18} aria-hidden="true" />上一张</button>
        <a href={largeSrc} target="_blank" rel="noreferrer" aria-label="在新标签页查看高清图">查看高清图</a>
        <button type="button" onClick={() => navigate(1)} disabled={images.length < 2}>下一张<ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </dialog>
  );
}
