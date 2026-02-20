import { h } from "preact";
import styles from "../styles.module.css";
import { useEffect, useRef, useState } from "preact/hooks";

export default function FontCard({
  name,
  style,
  previewKey,
  subscribePreview,
  requestPreview,
}: {
  name: string;
  style?: string;
  previewKey: string;
  subscribePreview: (key: string, cb: (url: string) => void) => void;
  requestPreview: () => void;
}) {
  const [src, setSrc] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribePreview(previewKey, setSrc);
    // 구독이 되는 건 FontCard 컴포넌트가 마운트되었을떄, 즉 화면에 나왔을 때,
    // subscribePreview를 return 하게 되면,
    // 콜백함수를 등록을 하면서,
    // unmount 됐을 때 콜백을 삭제하는 로직을 실행하면서,
    // 콜백함수를 실행한다. > previewsRef.current[key]에 이미 URL이 있을 떄만 실행된다.
    // 처음 마운트 시 프리뷰가 아직 안 왔으면, 실행되지 않고,
  }, [previewKey]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) requestPreview();
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      class={styles.fontCard}
      onClick={() => {
        parent.postMessage(
          {
            pluginMessage: { type: "apply-font", family: name, style: style },
          },
          "*"
        );
      }}
    >
      {src ? (
        <img src={src} style={{ height: "14px", objectFit: "contain" }} />
      ) : (
        <span style={{ fontFamily: name }}>
          {" "}
          {name} {style}
        </span>
      )}
    </div>
  );
}
