import type { Component } from "solid-js";

import Mosaic from "./Mosaic";

const App: Component = () => {
  return (
    <div class="flex flex-col h-full">
      <header class="shrink-0 px-3 py-4">RGB Mosaic</header>
      <Mosaic />
    </div>
  );
};

export default App;
