import {
  IconAdjust24,
  IconFolder24,
  IconHome24,
  IconLibrary24,
} from "@create-figma-plugin/ui";
import { h } from "preact";
import styles from "../styles.module.css";

export default function Navigation({
  setTab,
}: {
  setTab: (page: "home" | "label" | "settings") => void;
}) {
  return (
    <div class={styles.nav}>
      <IconHome24 onClick={() => setTab("home")} />
      <IconLibrary24 onClick={() => setTab("label")} />
      {/* <IconAdjust24 onClick={() => setTab("settings")} /> */}
    </div>
  );
}
