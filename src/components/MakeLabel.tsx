import { h } from "preact";
import styles from "../styles.module.css";
import ColorPallett from "./ColorPallett";
import { useState } from "preact/hooks";

export default function MakeLabel({
  onCreate,
}: {
  onCreate: (name: string, color: string) => void;
}) {
  const [color, setColor] = useState("");
  const [name, setName] = useState("");

  const pickColor = (c: string) => {
    setColor(color === c ? "" : c);
  };

  return (
    <div class={styles.MakeLabelContainer}>
      <input
        class={styles.labelInput}
        placeholder={"Write new Label"}
        onInput={(e) => setName(e.currentTarget.value)}
      ></input>
      <div style={{ display: "flex", alignItems: "center" }}>
        <ColorPallett
          colors={[
            "#18A0FB",
            "#7B61FF",
            "#F531B3",
            "#1BC47D",
            "#F24822",
            "#FFEB00",
            "#E5E5E5",
          ]}
          onSelect={pickColor}
          selectedColor={color}
        />
        <button
          onClick={() => {
            onCreate(name, color || "#E5E5E5");
          }}
          class={styles.makeLabel}
        >
          Make
        </button>
      </div>
    </div>
  );
}
