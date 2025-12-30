/**
 * Store Player: gestione audio player e UI player mobile.
 *
 * Funzionalità:
 * - Playlist audio con riproduzione automatica traccia successiva
 * - Controllo volume (0 = pausa, >0 = play automatico)
 * - Gestione stato player mobile (showPlayer, video background)
 * - Auto-avanzamento a traccia successiva al termine
 */
import { defineStore } from "pinia";
import floating from "@/assets/media/music/1-floating_portal.mp3";
import brookesia from "@/assets/media/music/2-brookesia.mp3";
import clamoris from "@/assets/media/music/3-clamoris_vincula.mp3";
import weep from "@/assets/media/music/4-weep.mp3";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    isPlaying: false,
    volume: 0,
    currentTrack: "floating",
    trackOrder: ["floating", "brookesia", "clamoris", "weep"],
    audioMap: {
      floating: {
        title: "floating portal",
        track: new Audio(floating),
      },
      brookesia: {
        title: "brookesia",
        track: new Audio(brookesia),
      },
      clamoris: {
        title: "clamoris vincula",
        track: new Audio(clamoris),
      },
      weep: {
        title: "weep",
        track: new Audio(weep),
      },
    },
    isVideoLoaded: false,
    showPlayer: false,
  }),

  actions: {
    // Registra listener "ended" per auto-avanzamento traccia
    initListeners() {
      this.trackOrder.forEach((key, index) => {
        const audio = this.audioMap[key].track;
        audio.addEventListener("ended", () => {
          if (this.volume === 0) return;

          const nextIndex = (index + 1) % this.trackOrder.length;
          const nextKey = this.trackOrder[nextIndex];

          this.selectTrack(nextKey);
        });
      });
    },

    playCurrent() {
      const current = this.audioMap[this.currentTrack]?.track;
      if (!current) return;

      current.volume = this.volume;
      current.play();
      this.isPlaying = true;
    },

    stopAll() {
      Object.values(this.audioMap).forEach(({ track }) => {
        track.pause();
        track.currentTime = 0;
      });
      this.isPlaying = false;
    },

    selectTrack(key) {
      if (!this.audioMap[key]) return;
      if (key === this.currentTrack && this.isPlaying) return;

      this.stopAll();
      this.currentTrack = key;

      if (this.volume === 0) this.volume = 0.2;
      this.playCurrent();
    },

    // Controllo volume: 0 = pausa, >0 = play automatico
    setVolume(vol) {
      this.volume = vol;

      const current = this.audioMap[this.currentTrack]?.track;
      if (!current) return;

      current.volume = vol;

      if (vol === 0) {
        current.pause();
        this.isPlaying = false;
      } else {
        this.playCurrent();
      }
    },

    togglePlayer() {
      this.showPlayer = !this.showPlayer;
    },

    closePlayer() {
      this.showPlayer = false;
    },

    openPlayer() {
      this.showPlayer = true;
    },

    setVideoLoaded(loaded) {
      this.isVideoLoaded = loaded;
    },

    pause() {
      const current = this.audioMap[this.currentTrack]?.track;
      if (!current) return;

      current.pause();
      this.isPlaying = false;
    },
  },
});
