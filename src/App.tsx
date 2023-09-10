import type { Component } from "solid-js";

import styles from "./App.module.css";

const App: Component = () => {
  return (
    <div class={styles.app}>
      <header class={styles.header}>RGB Mosaic</header>
    </div>
  );
};

export default App;
