import { h } from "preact";
import { useRef, useEffect } from "preact/hooks";
import { IconChevronRight16 } from "@create-figma-plugin/ui";
import styles from "../styles.module.css";

export default function FolderItem({
  title,
  count,
  items,
  preIcon,
  sufIcon,
  action,
  previewSrc,
  onVisible,
  onHidden,
}: {
  title: string;
  count: number;
  items: h.JSX.Element[];
  preIcon?: h.JSX.Element;
  sufIcon?: h.JSX.Element;
  action?: h.JSX.Element;
  previewSrc?: string;
  onVisible?: () => void;
  onHidden?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: number | null = null;

    if (!onVisible || !ref.current) return;
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
    <div class={styles.fontListContainer} ref={ref}>
      <details class={styles.fontList}>
        <summary class={styles.summary} style={{ fontFamily: title }}>
          <IconChevronRight16 />
          {preIcon}
          {previewSrc ? (
            <img src={previewSrc} style={{ height: "14px" }} />
          ) : (
            title
          )}
          {sufIcon}
        </summary>
        <div style={{ paddingTop: "5px", paddingBottom: "5px" }}>{items}</div>
      </details>
      {action}
    </div>
  );
}
