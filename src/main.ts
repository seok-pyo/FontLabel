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
  };
}
