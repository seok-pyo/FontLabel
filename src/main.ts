import { showUI } from "@create-figma-plugin/utilities";

export default async function () {
  showUI({ width: 360, height: 480 });

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
  };
}
