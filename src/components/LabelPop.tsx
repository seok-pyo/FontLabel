import { h } from "preact";
import styles from "../styles.module.css";

export default function LabelPop({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (option: string) => void;
}) {
  return (
    <div class={styles.popContainer}>
      {options.map((opt) => (
        <div onClick={() => onSelect(opt)} class={styles.popOption}>
          {opt}
        </div>
      ))}
    </div>
  );
}
