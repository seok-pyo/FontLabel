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
  currentTab,
}: {
  setTab: (page: "home" | "label" | "settings") => void;
  currentTab: string;
}) {
  return (
    <div class={styles.nav}>
      <IconHome24
        class={`${styles.navItem} ${currentTab === "home" ? styles.navActive : ""}`}
        onClick={() => setTab("home")}
      />
      <IconLibrary24
        class={`${styles.navItem} ${currentTab === "label" ? styles.navActive : ""}`}
        onClick={() => setTab("label")}
      />
    </div>
  );
}
