import { IconClose16, IconPlus24, IconFolder24 } from "@create-figma-plugin/ui";
import { h, Fragment } from "preact";
import styles from "../styles.module.css";
import FolderItem from "./FolderItem";
import FontCard from "./FontCard";
import { useEffect, useState } from "preact/hooks";
import MakeLabel from "./MakeLabel";
import { Label } from "../types";

export default function LabelPage({
  labels,
  fonts,
  onDelete,
  onDeleteFont,
  onCreate,
  requestPreview,
  subscribePreview,
}: {
  labels: Label[];
  fonts: Record<string, string[]>;
  onDelete: (id: string) => void;
  onDeleteFont: (name: string, id: string) => void;
  onCreate: (name: string, color: string, font?: string | undefined) => void;
  requestPreview: (family: string, style: string, text?: string) => void;
  subscribePreview: (key: string, cb: (url: string) => void) => void;
}) {
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest(`.${styles.labelDefault}`)) return;
      setShowLabel(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <Fragment>
      {labels.map((l) => (
        <FolderItem
          key={l.id}
          title={l.name}
          count={l.fonts.length}
          previewKey={`${l.name}`}
          requestPreview={() => {
            if (l.fonts.length > 0) requestPreview(l.name, l.fonts[0]);
          }}
          subscribePreview={subscribePreview}
          items={l.fonts.map((f) => (
            <FolderItem
              key={f}
              title={f}
              count={fonts[f]?.length || 0}
              previewKey={`${f}`}
              requestPreview={() => {
                const styles = fonts[f] || [];
                if (styles.length > 0) requestPreview(f, styles[0], f);
              }}
              subscribePreview={subscribePreview}
              items={(fonts[f] || []).map((style) => (
                <FontCard
                  key={style}
                  name={f}
                  style={style}
                  previewKey={`${f}::${style}`}
                  requestPreview={() => requestPreview(f, style)}
                  subscribePreview={subscribePreview}
                />
              ))}
              action={
                <button
                  class={styles.closeButton}
                  onClick={() => {
                    onDeleteFont(f, l.id);
                  }}
                >
                  <IconClose16 />
                </button>
              }
            />
          ))}
          preIcon={
            <span style={{ color: l.color }}>
              <IconFolder24 />
            </span>
          }
          action={
            <button class={styles.closeButton} onClick={() => onDelete(l.id)}>
              <IconClose16 />
            </button>
          }
        />
      ))}
      <div class={styles.labelDefault} onClick={() => setShowLabel(true)}>
        <IconPlus24 />
        {showLabel && (
          <MakeLabel
            onCreate={(name, color) => {
              onCreate(name, color);
              setShowLabel(false);
            }}
          />
        )}
      </div>
    </Fragment>
  );
}
