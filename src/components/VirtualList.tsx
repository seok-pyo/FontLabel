import { h } from "preact";
import { useRef, useState, useEffect } from "preact/hooks";

// 이 컴포넌트가 하는 일
// 1. 스크롤 컨테이너를 만들고
// 2. scrollTop을 추적해서
// 3. 보이는 범위의 아이템만 renderItem(index)로 렌더

interface VirtualProps {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  initialScrollTop?: number;
  onScrollChange?: (scrollTop: number) => void;
  renderItem: (index: number) => h.JSX.Element;
}

export default function VirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
  initialScrollTop,
  onScrollChange,
  renderItem,
}: VirtualProps) {
  const [scrollTop, setScrollTop] = useState(initialScrollTop ?? 0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 마운트 시 설정 === useEffect ?
  // containerRef.current === 실제 DOM ?
  useEffect(() => {
    if (containerRef.current && initialScrollTop)
      containerRef.current.scrollTop = initialScrollTop;
  }, []);

  // 1. 인덱스 계산
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1, // 범위 초과 방지
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // 2. 패딩 계산
  const paddingTop = startIndex * itemHeight;
  const paddingBottom = Math.max(0, (itemCount - endIndex - 1) * itemHeight);

  // 3. 보이는 아이템만 배열로 만들기
  const items: h.JSX.Element[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    items.push(renderItem(i));
  }

  // 4. JSX 리턴
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflowY: "auto" }}
      onScroll={(e) => {
        const top = e.currentTarget.scrollTop;
        setScrollTop(top);
        onScrollChange?.(top);
      }}
    >
      <div style={{ paddingTop, paddingBottom }}>{items}</div>
    </div>
  );
}
