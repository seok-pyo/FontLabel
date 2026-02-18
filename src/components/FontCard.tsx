import { h } from "preact";
import styles from "../styles.module.css";

export default function FontCard({
  name,
  style,
}: {
  name: string;
  style?: string;
}) {
  return (
    <div
      class={styles.fontCard}
      style={{ fontFamily: name }}
      onClick={() => {
        parent.postMessage(
          {
            pluginMessage: { type: "apply-font", family: name, style: style },
          },
          "*"
        );
      }}
    >
      {name} {style}
    </div>
  );
}
