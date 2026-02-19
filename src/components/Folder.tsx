import { Fragment, h } from "preact";
import FontCard from "./FontCard";
import styles from "../styles.module.css";
import { IconPlus16 } from "@create-figma-plugin/ui";
import { useEffect, useState } from "preact/hooks";
import LabelPop from "./LabelPop";
import MakeLabel from "./MakeLabel";
import FolderItem from "./FolderItem";

export default function Folder({
  fonts,
  onCreate,
  onAddToLabel,
  labels,
  previews,
  requestPreview,
  addVisible,
  removeVisible,
}: {
  fonts: Record<string, string[]>;
  onCreate: (name: string, color: string, font: string) => void;
  onAddToLabel: (name: string, id: string) => void;
  labels: { id: string; name: string; color: string; fonts: string[] }[];
  previews: Record<string, string>;
  requestPreview: (family: string, style: string, text?: string) => void;
  addVisible: (key: string, callback: () => void) => void;
  removeVisible: (key: string) => void;
}) {
  const [fontInfo, setFontInfo] = useState("");
  const [mode, setMode] = useState<"makeLabel" | "viewLabel" | null>(null);

  const onSelect = (option: string) => {
    if (option === "Make a Label") {
      setMode("makeLabel");
    }
    if (option === "Add to Label") {
      setMode("viewLabel");
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!document.contains(target)) {
        return;
      }

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
          <FolderItem
            title={family}
            count={style.length}
            sufIcon={
              <Fragment>
                {labels
                  .filter((l) => l.fonts.includes(family))
                  .map((l) => (
                    <div
                      class={styles.colorCircle}
                      style={{ backgroundColor: l.color }}
                    ></div>
                  ))}
              </Fragment>
            }
            onVisible={() =>
              addVisible(family, () => requestPreview(family, style[0], family))
            }
            onHidden={() => removeVisible(family)}
            previewSrc={previews[family]}
            // onVisible={() => requestPreview(family, style[0], family)}
            items={style.map((s) => (
              <FontCard
                name={family}
                style={s}
                previewSrc={previews[`${family}::${s}`]}
                onVisible={() =>
                  addVisible(`${family}::${s}`, () => requestPreview(family, s))
                }
                onHidden={() => removeVisible(`${family}::${s}`)}
              />
            ))}
            action={
              <Fragment>
                <button
                  class={
                    fontInfo === family
                      ? `${styles.plusButton} ${styles.plusOpen}`
                      : styles.plusButton
                  }
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
                {mode === "makeLabel" && fontInfo === family ? (
                  <MakeLabel
                    onCreate={(name, color) => {
                      onCreate(name, color, family);
                      setFontInfo(""); // Label 창 끄기
                      setMode(null); // makeLabel 창 끄기
                    }}
                  />
                ) : (
                  ""
                )}
                {mode === "viewLabel" && fontInfo === family ? (
                  <div
                    class={styles.popContainer}
                    style={{ right: "155px", top: "24px" }}
                  >
                    {labels.map((l) => (
                      <div
                        class={styles.popOption}
                        onClick={() => {
                          setFontInfo("");
                          setMode(null);
                          onAddToLabel(family, l.id);
                        }}
                      >{`${l.name}(${l.fonts.length})`}</div>
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </Fragment>
            }
          />
        </div>
      ))}
    </Fragment>
  );
}
