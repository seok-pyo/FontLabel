import { Fragment, h } from "preact";
import FontCard from "./FontCard";
import styles from "../styles.module.css";
import { IconChevronRight16, IconPlus16 } from "@create-figma-plugin/ui";
import { useEffect, useState } from "preact/hooks";
import LabelPop from "./LabelPop";
import MakeLabel from "./MakeLabel";

export default function Folder({ fonts }: { fonts: Record<string, string[]> }) {
  const [fontInfo, setFontInfo] = useState("");
  const [mode, setMode] = useState<"makeLabel" | null>(null);

  const onSelect = (option: string) => {
    if (option !== "Make a Label") {
      return;
    }
    setMode("makeLabel");
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.closest(`.${styles.popContainer}`) ||
        target.closest("button") ||
        // label option 이벤트 버블링
        target.closest(`.${styles.MakeLabelContainer}`)
      ) {
        return;
      }
      setFontInfo("");
      setMode(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <Fragment>
      {Object.entries(fonts).map(([family, style]) => (
        <div class={styles.fontListContainer}>
          <details key={family} class={styles.fontList}>
            <summary class={styles.summary}>
              <IconChevronRight16 />
              {`${family}(${style.length})`}
            </summary>
            {style.map((s) => (
              <FontCard name={family} style={s} />
            ))}
          </details>
          <button
            class={fontInfo === family ? styles.plusOpen : ""}
            onClick={() => {
              setFontInfo(fontInfo === family ? "" : family);
              setMode(null);
            }}
          >
            <IconPlus16 />
          </button>
          {fontInfo === family && mode !== "makeLabel" ? (
            <LabelPop
              options={["Make a Label", "Add to Label"]}
              onSelect={onSelect}
            />
          ) : (
            ""
          )}
          {mode === "makeLabel" && fontInfo === family ? <MakeLabel /> : ""}
        </div>
      ))}
    </Fragment>
  );
}
