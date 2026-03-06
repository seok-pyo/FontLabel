import { h, Fragment } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { render } from "@create-figma-plugin/ui";
import styles from "./styles.module.css";
import Folder from "./components/Folder";
import Navigation from "./components/Navigation";
import LabelPage from "./components/LabelPage";
import Settings from "./components/Settings";
import { Label } from "./types";

function Plugin() {
  const [value, setValue] = useState("");
  const [fonts, setFonts] = useState<Record<string, string[]>>({});
  const [labels, setLabels] = useState<Label[]>([]);
  const [tab, setTab] = useState<"home" | "label" | "settings">("home");

  const pendingTime = useRef<Record<string, number>>({});

  const previewsRef = useRef<Record<string, string>>({});
  const listenersRef = useRef<Map<string, Set<(url: string) => void>>>(
    new Map()
  );

  const scrollTopRef = useRef(0);

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

  // const pendingQueue = useRef<string[]>([]); // Array.includes는 배열을 처음부터 끝까지 순회하는 O(n) 연산. set으로 수정해준다.
  const pendingQueue = useRef<Set<string>>(new Set());

  const requestPreview = (family: string, style: string, text?: string) => {
    const displayKey = text || `${family} ${style}`;
    const key = text ? `${family}` : `${family}::${style}`;

    if (previewsRef.current[key]) return; // sub/pub 패턴 캐시
    if (pendingQueue.current.has(key)) return;
    pendingTime.current[key] = performance.now();
    pendingQueue.current.add(key);

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
      const msg = e.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === "fonts") {
        const fontData = e.data.pluginMessage.fonts;
        setFonts(fontData); // setFonts를 하게 되면 렌더링이 진행되므로, 렌더링 시간에 포함.
      }
      if (msg.type === "labels") {
        setLabels(e.data.pluginMessage.labels);
      }

      if (msg.type === "preview") {
        const { key, image } = e.data.pluginMessage;

        const waited = performance.now() - pendingTime.current[key];

        const blob = new Blob([image], {
          type: "image/svg+xml",
        });
        const url = URL.createObjectURL(blob);

        if (previewsRef.current[key]) {
          URL.revokeObjectURL(previewsRef.current[key]);
        }

        previewsRef.current[key] = url;
        listenersRef.current.get(key)?.forEach((cb) => cb(url));
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
          scrollTop={scrollTopRef.current}
          onScrollChange={(top) => {
            scrollTopRef.current = top;
          }}
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
      <Navigation setTab={setTab} currentTab={tab} />
    </Fragment>
  );
}

export default render(Plugin);
