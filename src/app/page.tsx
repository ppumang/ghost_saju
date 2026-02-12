"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useIntroSequence } from "@/hooks/useIntroSequence";
import IntroScene from "@/components/IntroScene";
import VideoScene from "@/components/VideoScene";
import BirthForm from "@/components/BirthForm";
import LoadingScene from "@/components/LoadingScene";
import ResultScene from "@/components/ResultScene";
import SkipButton from "@/components/SkipButton";

export default function Home() {
  const {
    scene,
    fortuneResult,
    error,
    onIntroComplete,
    skip,
    startBirthForm,
    submitBirthData,
    restart,
  } = useIntroSequence();

  useEffect(() => {
    if (scene === "result") {
      document.body.style.background = "#0a0a0a";
      document.body.className = "scene-scroll";
      window.scrollTo(0, 0);
    } else {
      document.body.style.background = "#000000";
      document.body.className = "scene-locked";
    }
  }, [scene]);

  return (
    <>
      {scene === "intro" && (
        <video
          src="/videos/restored-video.mp4"
          preload="auto"
          muted
          playsInline
          style={{ display: "none" }}
          aria-hidden="true"
        />
      )}

      <AnimatePresence mode="wait">
        {scene === "intro" && (
          <IntroScene key="intro" onComplete={onIntroComplete} />
        )}
        {scene === "video" && (
          <VideoScene key="video" onProceed={startBirthForm} />
        )}
        {scene === "birthForm" && (
          <BirthForm key="birthForm" onSubmit={submitBirthData} error={error} />
        )}
        {scene === "loading" && <LoadingScene key="loading" />}
        {scene === "result" && fortuneResult && (
          <ResultScene
            key="result"
            sections={fortuneResult.sections}
            readingId={fortuneResult.readingId}
            onRestart={restart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scene === "intro" && <SkipButton key="skip" onClick={skip} />}
      </AnimatePresence>
    </>
  );
}
