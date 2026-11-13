import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { MainScene, FinalStats, OutcomeType } from './game/MainScene';
import { i18nData, SupportedLang } from './i18n/translations';
import { soundFx } from './audio/soundFx';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  HelpCircle, 
  RotateCcw, 
  Globe, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Heart,
  Sword,
  X
} from 'lucide-react';

const LANGUAGE_OPTIONS: { code: SupportedLang; label: string; flag: string }[] = [
  { code: 'zh_tw', label: '繁體中文', flag: '🇹🇼' },
  { code: 'zh_cn', label: '简体中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' }
];

export default function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<MainScene | null>(null);

  const [currentLang, setCurrentLang] = useState<SupportedLang>('en');
  const [isMuted, setIsMuted] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [gameOutcome, setGameOutcome] = useState<OutcomeType>(null);
  const [finalStats, setFinalStats] = useState<FinalStats>({ enemiesDefeated: 0, timeSurvivedSeconds: 0 });

  const t = i18nData[currentLang];

  // Language switch handler
  const handleLanguageChange = (newLang: SupportedLang) => {
    setCurrentLang(newLang);
    document.title = i18nData[newLang].gameTitle;
    if (sceneRef.current) {
      sceneRef.current.setLanguage(newLang);
    }
  };

  const handleOutcome = useCallback((outcome: OutcomeType, stats: FinalStats) => {
    setFinalStats(stats);
    setGameOutcome(outcome);
  }, []);

  // Initialize Phaser Game instance with robust lifecycle guards
  useEffect(() => {
    if (!gameContainerRef.current) return;
    if (phaserGameRef.current) return;

    // Clear any residual canvas in container
    gameContainerRef.current.innerHTML = '';

    const mainScene = new MainScene();
    sceneRef.current = mainScene;
    mainScene.setCallbacks(handleOutcome);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: 960,
      height: 600,
      pixelArt: true,
      backgroundColor: '#0c0f14',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: mainScene
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    game.events.once('ready', () => {
      mainScene.setLanguage(currentLang);
    });

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
      sceneRef.current = null;
    };
  }, [handleOutcome]);

  // Restart game seamlessly without full reload
  const restartGame = () => {
    setGameOutcome(null);
    if (sceneRef.current) {
      sceneRef.current.restartGameScene();
      sceneRef.current.updateBarsUI();
    }
  };

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    const elem = document.getElementById('game-wrapper');
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Virtual inputs for touch devices
  const handleTouchDpad = (vx: number, vy: number) => {
    if (sceneRef.current) {
      sceneRef.current.setVirtualMovement(vx, vy);
    }
  };

  const handleTouchRoll = () => {
    if (sceneRef.current) {
      sceneRef.current.triggerVirtualRoll();
    }
  };

  const handleTouchAttackDown = () => {
    if (sceneRef.current) {
      sceneRef.current.triggerVirtualAttackStart();
    }
  };

  const handleTouchAttackUp = () => {
    if (sceneRef.current) {
      sceneRef.current.triggerVirtualAttackRelease();
    }
  };

  const handleTouchDagger = () => {
    if (sceneRef.current) {
      sceneRef.current.triggerVirtualDagger();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090c] flex flex-col items-center justify-center p-2 sm:p-4 text-slate-200 select-none font-sans overflow-x-hidden">
      {/* Outer Card Wrapper */}
      <div 
        id="game-wrapper" 
        className="relative w-full max-w-[960px] aspect-[16/10] bg-[#0b0e14] rounded-lg border-2 border-[#222e3d] shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top Control Bar */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 bg-[#0d121aa6] backdrop-blur-md border-b border-[#222f3e80]">
          {/* Title Crest */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
            <h1 className="text-xs sm:text-sm font-extrabold tracking-wider text-slate-100 uppercase font-serif drop-shadow">
              {t.gameTitle}
            </h1>
          </div>

          {/* Action Buttons & Language Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-[#141b24] px-2 py-1 rounded border border-[#2b3a4a] text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400 hidden sm:inline" />
              <label htmlFor="langSelect" className="text-[10px] text-slate-400 uppercase font-bold hidden sm:inline">
                {t.langLabel}
              </label>
              <select
                id="langSelect"
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
                className="bg-[#0b0e14] text-cyan-400 font-bold text-xs py-0.5 px-1.5 rounded border border-[#304154] outline-none cursor-pointer hover:border-cyan-500 transition-colors"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? t.soundOff : t.soundOn}
              className="p-1.5 rounded bg-[#141b24] border border-[#2b3a4a] text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Help / Manual */}
            <button
              onClick={() => setShowHelpModal(true)}
              title={t.howToPlay}
              className="p-1.5 rounded bg-[#141b24] border border-[#2b3a4a] text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title={t.fullscreen}
              className="p-1.5 rounded bg-[#141b24] border border-[#2b3a4a] text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition-all cursor-pointer hidden sm:block"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* HUD In-Game Overlay - High performance direct DOM elements */}
        <div id="ui-overlay" className="absolute top-12 left-3 z-20 pointer-events-none flex flex-col gap-1.5 w-[210px] sm:w-[250px] font-mono select-none">
          {/* HP Bar */}
          <div className="bg-[#0e131cd9] p-2 rounded border border-[#293748] shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 text-red-400">
                <Heart className="w-3 h-3 fill-red-500" /> {t.hp}
              </span>
              <span id="hp-text" className="text-slate-200">4 / 4</span>
            </div>
            <div className="w-full h-2.5 bg-[#12161f] rounded overflow-hidden p-0.5 border border-[#1f2937]">
              <div 
                id="hp-fill"
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-sm transition-all duration-150"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Stamina Bar */}
          <div className="bg-[#0e131cd9] p-2 rounded border border-[#293748] shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-3 h-3 fill-emerald-500" /> {t.stamina}
              </span>
              <span id="stamina-text" className="text-slate-200">100%</span>
            </div>
            <div className="w-full h-2.5 bg-[#12161f] rounded overflow-hidden p-0.5 border border-[#1f2937]">
              <div 
                id="stamina-fill"
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-sm transition-all duration-75"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Astral Energy */}
          <div className="bg-[#0e131cd9] p-2 rounded border border-[#293748] shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
              <span className="flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3 h-3 fill-cyan-400" /> {t.astral}
              </span>
              <span id="astral-text" className="text-slate-200">4 / 4</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div id="astral-slot-0" className="flex-1 h-2 rounded-xs border bg-cyan-400 border-cyan-300 shadow-[0_0_6px_#00e5ff] transition-all duration-150" />
              <div id="astral-slot-1" className="flex-1 h-2 rounded-xs border bg-cyan-400 border-cyan-300 shadow-[0_0_6px_#00e5ff] transition-all duration-150" />
              <div id="astral-slot-2" className="flex-1 h-2 rounded-xs border bg-cyan-400 border-cyan-300 shadow-[0_0_6px_#00e5ff] transition-all duration-150" />
              <div id="astral-slot-3" className="flex-1 h-2 rounded-xs border bg-cyan-400 border-cyan-300 shadow-[0_0_6px_#00e5ff] transition-all duration-150" />
            </div>
          </div>

          {/* Charging Heavy Strike status banner */}
          <div 
            id="charge-banner" 
            style={{ display: 'none' }}
            className="px-2 py-1 bg-red-950/80 border border-red-500/80 text-red-200 text-[10px] rounded animate-pulse font-bold items-center gap-1.5 shadow-md"
          >
            <Sword className="w-3 h-3 text-red-400" />
            <span>CHARGING CLEAVE... (RELEASE TO STRIKE)</span>
          </div>
        </div>

        {/* Dark Souls Styled Boss Health Bar (Top Center) */}
        <div 
          id="boss-hud-container" 
          className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-[280px] sm:w-[460px] pointer-events-none flex flex-col items-center"
        >
          <div className="flex items-center justify-between w-full px-2 mb-1">
            <span id="boss-name-label" className="text-xs sm:text-sm font-black tracking-widest text-emerald-300 uppercase font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {t.bossName}
            </span>
            <span id="boss-hp-text" className="text-[10px] sm:text-xs text-slate-400 font-mono font-bold">
              30 / 30
            </span>
          </div>
          <div className="w-full h-3 sm:h-3.5 bg-[#090c10] border-2 border-[#37474f] rounded-xs overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.8)] relative">
            <div 
              id="boss-hp-fill"
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150 shadow-[0_0_8px_#ef4444]"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Bottom Controls Legend Hint */}
        <div id="controls-hint" className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-1.5 bg-[#0a0e14cc] backdrop-blur-md rounded-full border border-[#243344] text-[11px] sm:text-xs text-slate-300 font-medium whitespace-nowrap shadow-md hidden sm:block">
          {t.controls}
        </div>

        {/* Mobile On-Screen Touch Controls */}
        <div className="sm:hidden absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-3 pb-4">
          <div className="flex justify-between items-end w-full">
            {/* D-Pad */}
            <div className="pointer-events-auto grid grid-cols-3 gap-1 w-28 h-28 bg-black/40 p-1.5 rounded-full border border-slate-700/60 backdrop-blur-xs">
              <div />
              <button 
                onMouseDown={() => handleTouchDpad(0, -1)} 
                onTouchStart={() => handleTouchDpad(0, -1)}
                onTouchEnd={() => handleTouchDpad(0, 0)}
                className="bg-slate-800/90 active:bg-cyan-600 text-slate-200 text-xs font-bold rounded flex items-center justify-center cursor-pointer"
              >▲</button>
              <div />
              <button 
                onMouseDown={() => handleTouchDpad(-1, 0)}
                onTouchStart={() => handleTouchDpad(-1, 0)}
                onTouchEnd={() => handleTouchDpad(0, 0)}
                className="bg-slate-800/90 active:bg-cyan-600 text-slate-200 text-xs font-bold rounded flex items-center justify-center cursor-pointer"
              >◀</button>
              <div className="bg-slate-900/80 rounded-full" />
              <button 
                onMouseDown={() => handleTouchDpad(1, 0)}
                onTouchStart={() => handleTouchDpad(1, 0)}
                onTouchEnd={() => handleTouchDpad(0, 0)}
                className="bg-slate-800/90 active:bg-cyan-600 text-slate-200 text-xs font-bold rounded flex items-center justify-center cursor-pointer"
              >▶</button>
              <div />
              <button 
                onMouseDown={() => handleTouchDpad(0, 1)}
                onTouchStart={() => handleTouchDpad(0, 1)}
                onTouchEnd={() => handleTouchDpad(0, 0)}
                className="bg-slate-800/90 active:bg-cyan-600 text-slate-200 text-xs font-bold rounded flex items-center justify-center cursor-pointer"
              >▼</button>
              <div />
            </div>

            {/* Action Buttons */}
            <div className="pointer-events-auto flex flex-col gap-2">
              <button
                onTouchStart={handleTouchRoll}
                className="w-13 h-13 rounded-full bg-emerald-700/80 active:bg-emerald-500 border border-emerald-400/80 text-white font-bold text-xs shadow-lg flex items-center justify-center cursor-pointer"
              >
                ROLL
              </button>
              <div className="flex gap-2">
                <button
                  onTouchStart={handleTouchAttackDown}
                  onTouchEnd={handleTouchAttackUp}
                  className="w-13 h-13 rounded-full bg-red-700/80 active:bg-red-500 border border-red-400/80 text-white font-bold text-xs shadow-lg flex items-center justify-center cursor-pointer"
                >
                  SLASH
                </button>
                <button
                  onTouchStart={handleTouchDagger}
                  className="w-13 h-13 rounded-full bg-cyan-700/80 active:bg-cyan-500 border border-cyan-400/80 text-white font-bold text-xs shadow-lg flex items-center justify-center cursor-pointer"
                >
                  DAGGER
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Phaser Canvas Container */}
        <div 
          ref={gameContainerRef} 
          id="game-container"
          className="w-full h-full flex items-center justify-center cursor-crosshair overflow-hidden [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:object-contain" 
        />

        {/* Souls-Style Battle Outcome Modal */}
        {gameOutcome && (
          <div id="modal-overlay" className="absolute inset-0 z-40 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-[480px] w-full bg-[#111721] border-2 border-[#2c3e50] rounded-lg p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
              {/* Language Selector inside Modal */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0b0f16] px-2 py-1 rounded border border-[#2b3a4a] text-xs">
                <Globe className="w-3 h-3 text-cyan-400" />
                <select
                  value={currentLang}
                  onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
                  className="bg-transparent text-cyan-400 font-bold text-xs outline-none cursor-pointer"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="bg-[#111721] text-slate-200">
                      {opt.flag} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Outcome Title Banner */}
              <div className="mt-2 mb-4">
                {gameOutcome === 'victory' ? (
                  <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-widest text-[#00e676] drop-shadow-[0_0_12px_rgba(0,230,118,0.5)]">
                    {t.victoryTitle}
                  </h2>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-widest text-[#ef4444] drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                    {t.defeatTitle}
                  </h2>
                )}
              </div>

              {/* Lore description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-serif px-2">
                {gameOutcome === 'victory' ? t.victoryDesc : t.defeatDesc}
              </p>

              {/* Battle Stats Summary */}
              <div className="grid grid-cols-2 gap-2 mb-6 bg-[#0c1017] p-3 rounded border border-[#1e2a38] text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-slate-400">{t.timeSurvived}</span>
                  <span className="text-cyan-400 font-bold text-sm">{finalStats.timeSurvivedSeconds}s</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">{t.enemiesDefeated}</span>
                  <span className="text-amber-400 font-bold text-sm">{finalStats.enemiesDefeated}</span>
                </div>
              </div>

              {/* Restart Button */}
              <button
                onClick={restartGame}
                className="w-full py-3 px-6 rounded bg-gradient-to-r from-[#2980b9] to-[#3498db] hover:from-[#3498db] hover:to-[#2980b9] text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {t.restartBtn}
              </button>
            </div>
          </div>
        )}

        {/* Combat Manual / Help Modal */}
        {showHelpModal && (
          <div className="absolute inset-0 z-40 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-[520px] w-full bg-[#111721] border border-[#2c3e50] rounded-lg p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#223142] pb-3 mb-4">
                <h3 className="text-base sm:text-lg font-bold font-serif text-cyan-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  {t.helpTitle}
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#1a2330] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-h-[60vh] overflow-y-auto pr-1">
                <p className="italic text-slate-400 font-serif border-l-2 border-cyan-500 pl-3">
                  "{t.lore}"
                </p>

                <div className="bg-[#0b0e14] p-3 rounded border border-[#1f2b38] space-y-2 font-mono text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">[WASD]</span>
                    <span>8-Way Movement locomotion with camera target lock.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">[SPACE]</span>
                    <span>Shadow Roll: 220ms invincible frames (i-frames) through enemy attacks. Costs 25 Stamina.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">[LMB Click]</span>
                    <span>Arbiter Slash: Rapid melee swipe (1 dmg). Recharges +1 Astral Energy on hit.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">[LMB Hold]</span>
                    <span>Charged Heavy Strike: Hold &gt;450ms for a devastating crimson cleave (3 dmg + forward dash).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">[RMB Click]</span>
                    <span>Astral Dagger: Fires ethereal crystal dagger (2 dmg). Consumes 1 Astral Energy.</span>
                  </div>
                </div>

                <div className="bg-emerald-950/40 p-2.5 rounded border border-emerald-700/50 text-emerald-200 text-xs">
                  {t.tips}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#223142] flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-5 py-2 rounded bg-[#212f3f] hover:bg-[#2b3d52] text-slate-200 text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  {t.helpClose}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
