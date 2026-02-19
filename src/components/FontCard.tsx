import { h } from "preact";
import styles from "../styles.module.css";
import { useEffect, useRef } from "preact/hooks";

export default function FontCard({
  name,
  style,
  previewSrc,
  onVisible,
  onHidden,
}: {
  name: string;
  style?: string;
  previewSrc: string;
  onVisible: () => void;
  onHidden?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible?.();
        } else {
          onHidden?.();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      class={styles.fontCard}
      onClick={() => {
        parent.postMessage(
          {
            pluginMessage: { type: "apply-font", family: name, style: style },
          },
          "*"
        );
      }}
    >
      {previewSrc ? (
        <img
          src={previewSrc}
          style={{ height: "14px", objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontFamily: name }}>
          {" "}
          {name} {style}
        </span>
      )}
    </div>
  );
}
