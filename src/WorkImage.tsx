import optimizedImages from "./data/curatedImages.json";

export function WorkImage({ src, alt, loading = "lazy", sizes, onOpen }: {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  sizes: string;
  onOpen?: () => void;
}) {
  const image = optimizedImages[src as keyof typeof optimizedImages];

  return (
    <a
      className={`work-image-link${image && image.height / image.width > 3 ? " is-long" : ""}`}
      href={image?.largeSrc ?? src}
      target="_blank"
      rel="noreferrer"
      aria-label={`查看大图：${alt}`}
      onClick={onOpen ? (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onOpen();
      } : undefined}
    >
      <img
        src={image?.src ?? src}
        srcSet={image && image.smallSrc !== image.src
          ? `${image.smallSrc} ${image.smallWidth}w, ${image.src} ${image.width}w`
          : undefined}
        sizes={sizes}
        width={image?.width}
        height={image?.height}
        alt={alt}
        loading={loading}
        decoding="async"
      />
    </a>
  );
}
