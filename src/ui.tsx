import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { render, TextboxAutocomplete } from "@create-figma-plugin/ui";
import styles from "./styles.module.css";
import Folder from "./components/Folder";
import Navigation from "./components/Navigation";
import LabelPage from "./components/LabelPage";
import Settings from "./components/Settings";

interface Label {
  id: string;
  name: string;
  color: string;
  fonts: string[];
}

function Plugin() {
  const [value, setValue] = useState("");
  const [fonts, setFonts] = useState<Record<string, string[]>>({});
  const [labels, setLabels] = useState<Label[]>([]);
  const [tab, setTab] = useState<"home" | "label" | "settings">("home");

  const onCreate = (name: string, color: string, font?: string) => {
    const newLabels = [
      ...labels,
      { id: Date.now().toString(), name, color, fonts: font ? [font] : [] },
    ];

    setLabels(newLabels);
    parent.postMessage(
      { pluginMessage: { type: "save-labels", labels: newLabels } },
      "*"
    );
  };

  const onDelete = (id: string) => {
    const newLabels = labels.filter((l) => l.id !== id);
    setLabels(newLabels);
    parent.postMessage(
      { pluginMessage: { type: "save-labels", labels: newLabels } },
      "*"
    );
  };

  const onDeleteFont = (name: string, labelID: string) => {
    const newLabels = labels.map((l) => {
      if (l.id !== labelID) return l;
      return { ...l, fonts: l.fonts.filter((f) => f !== name) };
    });
    setLabels(newLabels);
    parent.postMessage(
      {
        pluginMessage: { type: "save-labels", labels: newLabels },
      },
      "*"
    );
  };

  const onAddToLabel = (font: string, id: string) => {
    const newLabels = labels.map((l) => {
      if (l.id !== id) return l;
      if (l.fonts.includes(font)) return l;
      return { ...l, fonts: [...l.fonts, font] };
    });
    setLabels(newLabels);
    parent.postMessage(
      {
        pluginMessage: { type: "save-labels", labels: newLabels },
      },
      "*"
    );
  };

  useEffect(() => {
    window.onmessage = (e) => {
      if (e.data.pluginMessage.type === "fonts") {
        setFonts(e.data.pluginMessage.fonts);

        const style = document.createElement("style");
        let css = "";
        for (const family of Object.keys(e.data.pluginMessage.fonts)) {
          css += `@font-face { font-family: "${family}"; src: local("${family}"); }\n`;
        }
        style.textContent = css;
        document.head.appendChild(style);

        const families = Object.keys(e.data.pluginMessage.fonts);
        const na = families.filter((f) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          const testStr = "abcdefg";
          ctx.font = "16px monospace";
          const fallback = ctx.measureText(testStr).width;
          ctx.font = `16px "${f}", monospace`;
          const test = ctx.measureText(testStr).width;
          return fallback === test; // 폭이 같으면 = 미리보기 안 됨
        });
        console.log(`전체: ${families.length}, 미리보기 안됨: ${na.length}`);
        console.log("안 되는 폰트:", na);
      }
      if (e.data.pluginMessage.type === "labels") {
        setLabels(e.data.pluginMessage.labels);
      }
    };
    parent.postMessage({ pluginMessage: { type: "ready" } }, "*");
    parent.postMessage({ pluginMessage: { type: "load-labels" } }, "*");
  }, []);

  const filteredFonts = value
    ? Object.fromEntries(
        Object.entries(fonts).filter(([family]) =>
          family.toLowerCase().includes(value.toLowerCase())
        )
      )
    : fonts;

  const filterdLabels = value
    ? labels.filter(
        (l) =>
          l.name.toLowerCase().includes(value.toLowerCase()) ||
          l.fonts.some((f) => f.toLowerCase().includes(value.toLowerCase()))
      )
    : labels;

  return (
    <Fragment>
      <div class={styles.directory}>
        <input
          placeholder={"/SEARCH"}
          onInput={(e) => {
            setValue(e.currentTarget.value);
          }}
        ></input>
      </div>
      <div style={{ height: "12px" }}></div>

      {tab === "home" && (
        <Folder
          fonts={filteredFonts}
          onCreate={onCreate}
          labels={labels}
          onAddToLabel={onAddToLabel}
        />
      )}
      {tab === "label" && (
        <LabelPage
          labels={filterdLabels}
          fonts={fonts}
          onDelete={onDelete}
          onDeleteFont={onDeleteFont}
          onCreate={onCreate}
        />
      )}
      {tab === "settings" && <Settings />}
      <Navigation setTab={setTab} />
    </Fragment>
  );
}

export default render(Plugin);
