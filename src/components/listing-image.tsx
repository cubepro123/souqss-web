import { useDataSaver } from "@/hooks/use-data-saver";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  fit?: "cover" | "contain";
  fallback?: React.ReactNode;
};

/**
 * Image wrapper that respects the user's Data Saver preference.
 * When enabled, the network request is skipped and a lightweight placeholder
 * is rendered instead — saves bandwidth on metered/slow connections.
 */
export function ListingImage({ src, alt = "", className = "", fit = "cover", fallback }: Props) {
  const [dataSaver] = useDataSaver();

  if (!src || dataSaver) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground ${className}`}>
        {fallback ?? (
          <>
            <span className="text-3xl leading-none">📦</span>
            {dataSaver && src && <span className="text-[9px] font-bold mt-1 opacity-70">Data saver</span>}
          </>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-${fit} ${className}`}
    />
  );
}