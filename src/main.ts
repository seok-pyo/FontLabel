import { showUI } from "@create-figma-plugin/utilities";

export default async function () {
  showUI({ width: 365, height: 480 });

  figma.ui.onmessage = async (msg) => {
    if (msg.type === "ready") {
      const fonts = await figma.listAvailableFontsAsync();

      const grouped: Record<string, string[]> = {};

      for (const f of fonts) {
        const { family, style } = f.fontName;
        if (!grouped[family]) grouped[family] = [];
        grouped[family].push(style);
      }

      figma.ui.postMessage({ type: "fonts", fonts: grouped });
    }
    if (msg.type === "load-labels") {
      const labels = (await figma.clientStorage.getAsync("labels")) || [];
      figma.ui.postMessage({ type: "labels", labels });
    }
    if (msg.type === "save-labels") {
      await figma.clientStorage.setAsync("labels", msg.labels);
    }

    if (msg.type === "apply-font") {
      const selection = figma.currentPage.selection;
      for (const node of selection) {
        if (node.type === "TEXT") {
          await figma.loadFontAsync({ family: msg.family, style: msg.style });
          node.fontName = { family: msg.family, style: msg.style };
        }
      }
    }

    if (msg.type === "render-preview") {
      console.log(
        "request!- - - - - - - - - - - - - - - - - - - - - - - - - - - - "
      );

      const node = figma.createText();
      await figma.loadFontAsync({ family: msg.family, style: msg.style });
      node.fontName = { family: msg.family, style: msg.style };
      node.characters = msg.text || msg.family;
      node.fontSize = 14;
      node.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

      const bytes = await node.exportAsync({
        format: "SVG",
      }); // svg 파일의 문자열을 숫자로 생성
      node.remove();

      if (bytes.length < 100) return;

      let svgString = "";
      for (let i = 0; i < bytes.length; i += 8192) {
        svgString += String.fromCharCode.apply(
          null,
          Array.from(bytes.slice(i, i + 8192))
        );
      }

      figma.ui.postMessage({
        type: "preview",
        key: msg.key,
        image: svgString,
      });
      // console.log(`${msg.family}`, Date.now() - start);
    }
  };
}
