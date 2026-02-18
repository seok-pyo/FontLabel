import { h } from "preact";
import styles from "../styles.module.css";
import { IconCheck24 } from "@create-figma-plugin/ui";

export default function ColorPallett({
  colors,
  onSelect,
  selectedColor,
}: {
  colors: string[];
  onSelect: (color: string) => void;
  selectedColor: string;
}) {
  return (
    <div style={{ display: "flex", gap: "4px", margin: "8px" }}>
      {colors.map((c) => (
        <div
          class={styles.colorCircle}
          style={{
            backgroundColor: c,
            outline: c === selectedColor ? "2px solid white" : "none",
          }}
          onClick={() => onSelect(c)}
        >
          {c === selectedColor && (
            <div style={{ color: "#222222" }}>
              <IconCheck24 />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
