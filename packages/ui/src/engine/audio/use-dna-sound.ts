import { useCallback } from "react";
import { sovereignSound, type DnaSoundProfile } from "./sound-engine";

export function useDnaSound(dna: string = "dx") {
  const profile = (dna as DnaSoundProfile) || "dx";

  const playClick = useCallback(() => {
    sovereignSound.playClick(profile);
  }, [profile]);

  const playHover = useCallback(() => {
    sovereignSound.playHover(profile);
  }, [profile]);

  const setMuted = useCallback((muted: boolean) => {
    sovereignSound.setMuted(muted);
  }, []);

  return {
    playClick,
    playHover,
    setMuted,
    isMuted: sovereignSound.isMuted(),
  };
}
