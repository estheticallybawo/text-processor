
"use client"
import styles from "./LoadingScreen.module.css";
import { useState, useEffect, } from "react";


const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500); // Simulated loading time
    return () => clearTimeout(timer);
  }, []);

const LoadingScreen = () => {
  return (
    <>
    <div className={styles.loadingScreen}>
      <div className={styles.spinner}></div>
    </div>
    </>
  );
};

export default LoadingScreen;
