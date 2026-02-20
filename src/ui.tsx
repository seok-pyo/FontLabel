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

  const previewsRef = useRef<Record<string, string>>({});
  const listenersRef = useRef<Map<string, Set<(url: string) => void>>>(
    new Map()
  );

  console.log(listenersRef);
  console.log(listenersRef.current);

  const subscribePreview = (key: string, callback: (url: string) => void) => {
    if (!listenersRef.current.has(key)) {
      listenersRef.current.set(key, new Set());
    }
    listenersRef.current.get(key)!.add(callback);

    if (previewsRef.current[key]) {
      callback(previewsRef.current[key]);
    }

    return () => {
      listenersRef.current.get(key)?.delete(callback);
    };
  };

  const pendingQueue = useRef<string[]>([]);

  const requestPreview = (family: string, style: string, text?: string) => {
    const displayKey = text || `${family} ${style}`;
    const key = text ? `${family}` : `${family}::${style}`;

    if (previewsRef.current[key]) return;
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
    const start = performance.now();

    window.onmessage = (e) => {
      if (e.data.pluginMessage.type === "fonts") {
        const fontData = e.data.pluginMessage.fonts;
        setFonts(fontData);
        requestAnimationFrame(() => {
          console.log(
            `[초기 로딩 시간] ${(performance.now() - start).toFixed(1)}ms`
          );
        });
      }
      if (e.data.pluginMessage.type === "labels") {
        setLabels(e.data.pluginMessage.labels);
      }

      if (e.data.pluginMessage.type === "preview") {
        // const start = performance.now();

        const { key, image } = e.data.pluginMessage;
        const blob = new Blob([image], {
          type: "image/svg+xml",
        });
        const url = URL.createObjectURL(blob);

        previewsRef.current[key] = url;
        listenersRef.current.get(key)?.forEach((cb) => cb(url));

        // requestAnimationFrame(() => {
        //   const elapsed = performance.now() - start;
        //   console.log(`[UI Block] ${elapsed.toFixed(1)}`);
        // });
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
          requestPreview={requestPreview}
          fonts={filteredFonts}
          onCreate={onCreate}
          labels={labels}
          onAddToLabel={onAddToLabel}
          subscribePreview={subscribePreview}
        />
      )}
      {tab === "label" && (
        <LabelPage
          labels={filterdLabels}
          fonts={fonts}
          onDelete={onDelete}
          onDeleteFont={onDeleteFont}
          onCreate={onCreate}
          requestPreview={requestPreview}
          subscribePreview={subscribePreview}
        />
      )}
      {tab === "settings" && <Settings />}
      <Navigation setTab={setTab} />
    </Fragment>
  );
}

export default render(Plugin);
