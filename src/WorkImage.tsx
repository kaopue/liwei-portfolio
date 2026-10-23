import optimizedImages from "./data/optimizedImages.json";

export function WorkImage({ src, alt, loading = "lazy", sizes }: {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  sizes: string;
}) {
  const image = optimizedImages[src as keyof typeof optimizedImages];

  return (
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
  );
}
