import type { Component } from "solid-js";

import styles from "./App.module.css";

import Mosaic from "./Mosaic";

const App: Component = () => {
  return (
    <div class={styles.app}>
      <header class={styles.header}>RGB Mosaic</header>
      <Mosaic />
    </div>
  );
};

export default App;
