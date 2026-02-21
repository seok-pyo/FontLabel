import { h } from "preact";
import { useRef, useEffect, useState } from "preact/hooks";
import { IconChevronRight16 } from "@create-figma-plugin/ui";
import styles from "../styles.module.css";

export default function FolderItem({
  title,
  count,
  items,
  preIcon,
  sufIcon,
  action,
  previewKey,
  subscribePreview,
  requestPreview,
}: {
  title: string;
  count: number;
  items: h.JSX.Element[];
  preIcon?: h.JSX.Element;
  sufIcon?: h.JSX.Element;
  action?: h.JSX.Element;
  previewKey?: string;
  subscribePreview?: (key: string, cb: (url: string) => void) => void;
  requestPreview?: () => void;
}) {
  const [src, setSrc] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!subscribePreview || !previewKey) return;
    return subscribePreview(previewKey, setSrc);
  }, [previewKey]);

  useEffect(() => {
    if (!requestPreview) return;
    requestPreview();
  }, []);

  return (
    <div class={styles.fontListContainer}>
      <details
        class={styles.fontList}
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary class={styles.summary} style={{ fontFamily: title }}>
          <IconChevronRight16 />
          {preIcon}
          {src ? <img src={src} style={{ height: "14px" }} /> : title}
          {sufIcon}
        </summary>
        {open && (
          <div style={{ paddingTop: "5px", paddingBottom: "5px" }}>{items}</div>
        )}
      </details>
      {action}
    </div>
  );
}
