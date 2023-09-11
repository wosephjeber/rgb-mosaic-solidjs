import { createSignal, type Component } from "solid-js";

import Mosaic from "./Mosaic";
import Button from "./Button";

const App: Component = () => {
  const [started, setStarted] = createSignal<boolean>(false);

  return (
    <>
      {started() ? (
        <Mosaic />
      ) : (
        <div class="flex flex-col h-full justify-center items-center">
          <Button
            onClick={() => {
              setStarted(true);
            }}
          >
            Start
          </Button>
        </div>
      )}
    </>
  );
};

export default App;
