import { h } from "preact";
import { useState } from "preact/hooks";
import { render, Button, TextboxNumeric } from "@create-figma-plugin/ui";
import styles from "./styles.module.css";

function Plugin() {
  const [count, setCount] = useState("5");

  return (
    <div>
      <div class={styles.header}>
        <h2>RC</h2>
        <TextboxNumeric value={count} onValueInput={setCount} />
      </div>
      <Button
        onClick={() =>
          parent.postMessage(
            {
              pluginMessage: {
                type: "create-shapes",
                count: parseInt(count, 10),
              },
            },
            "*"
          )
        }
      >
        Create
      </Button>
      <Button
        onClick={() =>
          parent.postMessage({ pluginMessage: { type: "cancel" } }, "*")
        }
      >
        Cancel
      </Button>
    </div>
  );
}

export default render(Plugin);
