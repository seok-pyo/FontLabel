import { h, Fragment } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { render } from "@create-figma-plugin/ui";
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
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const pendingQueue = useRef<string[]>([]);

  const visibleItems = useRef<Map<string, () => void>>(new Map());
  const scrollTimer = useRef<number | null>(null);
  const isScrolling = useRef(false);

  const requestPreview = (family: string, style: string, text?: string) => {
    const displayKey = text || `${family} ${style}`;
    const key = text ? `${family}` : `${family}::${style}`;

    if (previews[key]) return;
    if (pendingQueue.current.includes(key)) return;
    pendingQueue.current.push(key);

    parent.postMessage(
      {
        pluginMessage: {
          type: "render-preview",
          family,
          style: style,
          text: displayKey,
          key,
        },
      },
      "*"
    );
  };

  const addVisible = (key: string, callback: () => void) => {
    visibleItems.current.set(key, callback);
    if (!isScrolling.current) callback();
  };

  const removeVisible = (key: string) => {
    visibleItems.current.delete(key);
  };

  const flushVisible = () => {
    visibleItems.current.forEach((cb) => cb());
  };

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
    const onScroll = () => {
      isScrolling.current = true;
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        isScrolling.current = false;
        flushVisible();
      }, 150);
    };
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);

  useEffect(() => {
    window.onmessage = (e) => {
      if (e.data.pluginMessage.type === "fonts") {
        setFonts(e.data.pluginMessage.fonts);
      }
      if (e.data.pluginMessage.type === "labels") {
        setLabels(e.data.pluginMessage.labels);
      }

      if (e.data.pluginMessage.type === "preview") {
        const { key, image } = e.data.pluginMessage;
        // const key = `${family}::${style}`;
        const blob = new Blob([image], {
          type: "image/svg+xml",
        });
        const url = URL.createObjectURL(blob); // 메모리에 있는 데이터를 마치 파일처럼 접근할 수 있는 임시 URL을 생성
        setPreviews((prev) => ({ ...prev, [key]: url }));
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
          previews={previews}
          requestPreview={requestPreview}
          fonts={filteredFonts}
          onCreate={onCreate}
          labels={labels}
          onAddToLabel={onAddToLabel}
          addVisible={addVisible}
          removeVisible={removeVisible}
        />
      )}
      {tab === "label" && (
        <LabelPage
          labels={filterdLabels}
          fonts={fonts}
          onDelete={onDelete}
          onDeleteFont={onDeleteFont}
          onCreate={onCreate}
          previews={previews}
          requestPreview={requestPreview}
          addVisible={addVisible}
          removeVisible={removeVisible}
        />
      )}
      {tab === "settings" && <Settings />}
      <Navigation setTab={setTab} />
    </Fragment>
  );
}

export default render(Plugin);
