"use client";

import React, { useEffect, useRef } from "react";
import type { LogLine } from "@/lib/types";
import {
  CheckIcon, WarnIcon, ErrorIcon, DotIcon, ArrowIcon,
} from "./Icons";
import styles from "./LogBox.module.css";

const ICONS = {
  ok: <CheckIcon size={11} />,
  warn: <WarnIcon size={11} />,
  err: <ErrorIcon size={11} />,
  info: <DotIcon size={11} />,
  active: <ArrowIcon size={11} />,
} as const;

interface Props {
  lines: LogLine[];
}

export function LogBox({ lines }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div className={styles.box} ref={ref}>
      {lines.map((l) => (
        <div key={l.id} className={`${styles.line} ${styles[l.type]}`}>
          <span className={styles.icon}>{ICONS[l.type]}</span>
          <span>{l.msg}</span>
        </div>
      ))}
    </div>
  );
}
