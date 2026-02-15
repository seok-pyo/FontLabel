import { h } from "preact";
import styles from "../styles.module.css";

export default function MakeLabel() {
  return (
    <div class={styles.MakeLabelContainer}>
      <input class={styles.labelInput} placeholder={"Write new Label"}></input>
    </div>
  );
}
