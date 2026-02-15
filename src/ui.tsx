import { h, Fragment } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import {
  render,
  Button,
  TextboxNumeric,
  TextboxAutocomplete,
} from "@create-figma-plugin/ui";
import styles from "./styles.module.css";
import Folder from "./components/Folder";

function Plugin() {
  const [value, setValue] = useState("");
  const [fonts, setFonts] = useState<Record<string, string[]>>({});

  useEffect(() => {
    window.onmessage = (e) => {
      if (e.data.pluginMessage.type === "fonts") {
        // const options = e.data.pluginMessage.fonts.map(
        //   (f: { fontName: { family: string; style: string } }) => ({
        //     value: f.fontName.family,
        //     style: f.fontName.style,
        //   })
        // );
        // setFonts(options);
        setFonts(e.data.pluginMessage.fonts);
      }
    };
    parent.postMessage({ pluginMessage: { type: "ready" } }, "*");
  }, []);

  return (
    <Fragment>
      <div class={styles.directory}>
        <TextboxAutocomplete
          onInput={(e) => {
            setValue(e.currentTarget.value);
          }}
          placeholder="/SOURCES"
          options={[]}
          value={value}
        />
      </div>
      <Folder fonts={fonts} />
    </Fragment>
  );
}

export default render(Plugin);
