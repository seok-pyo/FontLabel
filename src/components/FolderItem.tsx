import { h } from "preact";
import { IconChevronRight16 } from "@create-figma-plugin/ui";
import styles from "../styles.module.css";

export default function FolderItem({
  title,
  count,
  items,
  preIcon,
  sufIcon,
  action,
}: {
  title: string;
  count: number;
  items: h.JSX.Element[];
  preIcon?: h.JSX.Element;
  sufIcon?: h.JSX.Element;
  action?: h.JSX.Element;
}) {
  return (
    <div class={styles.fontListContainer}>
      <details class={styles.fontList}>
        <summary class={styles.summary} style={{ fontFamily: title }}>
          <IconChevronRight16 />
          {preIcon}
          {`${title}(${count})`}
          {sufIcon}
        </summary>
        <div style={{ paddingTop: "5px", paddingBottom: "5px" }}>{items}</div>
      </details>
      {action}
    </div>
  );
}
