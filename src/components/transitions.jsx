"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PageTransitionOverlay({ isActive, onMidTransition, onFinish }) {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (isActive) setPhase("closing");
  }, [isActive]);

  const topAnim = {
    closing: { height: "50%" },
    opening: { height: "0%" },
  };

  const bottomAnim = topAnim;

  const handleTopComplete = () => {
    if (phase === "closing") {
      onMidTransition?.();
      setTimeout(() => setPhase("opening"), 150);
    } else if (phase === "opening") {
      setPhase("idle");
      onFinish?.();
    }
  };

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 right-0 bg-black"
        initial={{ height: "0%" }}
        animate={topAnim[phase]}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onAnimationComplete={handleTopComplete}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black"
        initial={{ height: "0%" }}
        animate={bottomAnim[phase]}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}
