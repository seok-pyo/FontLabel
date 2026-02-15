import { h } from "preact";
import styles from "../styles.module.css";

export default function FontCard({
  name,
  style,
}: {
  name: string;
  style: string;
}) {
  return (
    <div class={styles.fontCard}>
      {name} {style}
    </div>
  );
}
