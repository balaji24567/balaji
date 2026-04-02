import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw } from 'lucide-react';

// --- Dummy Music Data ---
const TRACKS = [
  {
    id: 1,
    title: "SYS.REQ.01 // NEON_DRIFT",
    artist: "ENTITY_A",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/glitch1/200/200"
  },
  {
    id: 2,
    title: "SYS.REQ.02 // VOID_WALKER",
    artist: "ENTITY_B",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/glitch2/200/200"
  },
  {
    id: 3,
    title: "SYS.REQ.03 // NULL_POINTER",
    artist: "ENTITY_C",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/glitch3/200/200"
  }
];

// --- Snake Game Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 60;

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("AUDIO_ERR:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("AUDIO_ERR:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying]);

  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (!isGameStarted && !gameOver && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
         setIsGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameStarted, gameOver]);

  useEffect(() => {
    if (gameOver || !isGameStarted) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, generateFood, highScore, isGameStarted]);

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Glitch & Static Overlays */}
      <div className="absolute inset-0 bg-static opacity-20 pointer-events-none z-50 mix-blend-screen"></div>
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,255,0.06),rgba(0,255,255,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
      
      <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} loop={false} />

      {/* Left Panel: Terminal Music Player */}
      <div className="w-full md:w-96 bg-black border-b-4 md:border-b-0 md:border-r-4 border-fuchsia-600 p-6 flex flex-col justify-between z-10 relative animate-tear">
        <div>
          <h1 className="text-4xl md:text-5xl font-pixel tracking-tighter mb-8 text-fuchsia-500 animate-glitch-text uppercase">
            SYS.CORE
          </h1>
          
          <div className="relative group mb-6 border-2 border-cyan-400 p-1 bg-black">
            <img 
              src={currentTrack.cover} 
              alt="DATA_VISUAL" 
              className="relative w-full aspect-square object-cover filter grayscale contrast-150 mix-blend-luminosity"
              referrerPolicy="no-referrer"
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-exclusion">
                 <div className="w-full h-full border-4 border-fuchsia-500 animate-pulse"></div>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black text-cyan-400 px-2 py-1 text-xs border border-cyan-400">
              REC // {isPlaying ? 'ACTIVE' : 'STANDBY'}
            </div>
          </div>

          <div className="space-y-2 mb-8 border-l-4 border-fuchsia-600 pl-4">
            <h2 className="text-2xl font-bold text-cyan-300 uppercase tracking-widest">{currentTrack.title}</h2>
            <p className="text-lg text-fuchsia-400 font-mono uppercase">ID: {currentTrack.artist}</p>
          </div>

          <div className="flex items-center justify-between border-y-2 border-cyan-800 py-4">
            <button onClick={prevTrack} className="p-2 text-cyan-500 hover:text-fuchsia-500 hover:bg-cyan-900/30 transition-colors border border-transparent hover:border-fuchsia-500">
              <SkipBack size={32} />
            </button>
            <button 
              onClick={togglePlay} 
              className="p-4 bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[4px_4px_0px_#ff00ff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="p-2 text-cyan-500 hover:text-fuchsia-500 hover:bg-cyan-900/30 transition-colors border border-transparent hover:border-fuchsia-500">
              <SkipForward size={32} />
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-lg text-cyan-500">
            <button onClick={toggleMute} className="hover:text-fuchsia-500 transition-colors">
              {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </button>
            <span className="font-pixel text-xs uppercase">{isMuted ? 'AUDIO_OFF' : 'AUDIO_ON'}</span>
          </div>
          <div className="flex space-x-2">
            {[1,2,3,4].map(i => (
              <div 
                key={i} 
                className={`w-3 bg-fuchsia-500 transition-all duration-75 ${isPlaying && !isMuted ? 'animate-pulse' : 'h-2'}`}
                style={{ height: isPlaying && !isMuted ? `${Math.random() * 24 + 8}px` : '8px', animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative bg-black">
        
        {/* Score Board */}
        <div className="w-full max-w-2xl flex justify-between items-end mb-6 z-10 border-b-2 border-cyan-800 pb-2">
          <div>
            <p className="text-cyan-600 text-sm font-pixel uppercase mb-2">DATA_COLLECTED</p>
            <p className="text-4xl font-pixel text-cyan-400 animate-glitch-fast">{score}</p>
          </div>
          <div className="text-right">
            <p className="text-fuchsia-600 text-sm font-pixel uppercase mb-2">MAX_CAPACITY</p>
            <p className="text-2xl font-pixel text-fuchsia-500">{highScore}</p>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative z-10 p-2 bg-black border-4 border-fuchsia-600 shadow-[8px_8px_0px_#00ffff]">
          <div 
            className="bg-black relative overflow-hidden"
            style={{
              width: 'min(75vw, 500px)',
              height: 'min(75vw, 500px)',
              backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
            }}
          >
            {/* Grid Cells */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const snakeIdx = snake.findIndex(segment => segment.x === x && segment.y === y);
              const isSnakeHead = snakeIdx === 0;
              const isSnakeBody = snakeIdx > 0;
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    left: `${(x * 100) / GRID_SIZE}%`,
                    top: `${(y * 100) / GRID_SIZE}%`,
                  }}
                >
                  {isSnakeHead && (
                    <div className="w-full h-full bg-fuchsia-500 border border-fuchsia-300 z-20 relative shadow-[0_0_10px_#ff00ff]"></div>
                  )}
                  {isSnakeBody && (() => {
                    const opacity = Math.max(0.3, 1 - (snakeIdx / snake.length));
                    return (
                      <div 
                        className="w-full h-full bg-fuchsia-700 border border-fuchsia-900 z-10 relative"
                        style={{ opacity }}
                      ></div>
                    );
                  })()}
                  {isFood && (
                        <div className="w-full h-full bg-cyan-400 border-2 border-white animate-pulse z-10 relative shadow-[0_0_15px_#00ffff]"></div>
                  )}
                </div>
              );
            })}

            {/* Overlays */}
            {!isGameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 z-30 border-4 border-cyan-500 m-4">
                <h3 className="text-2xl md:text-3xl font-pixel text-fuchsia-500 mb-6 animate-glitch-text uppercase">AWAITING_INPUT</h3>
                <p className="text-cyan-400 mb-8 font-mono text-xl uppercase">Execute directional command</p>
                <div className="grid grid-cols-3 gap-2 text-cyan-500 font-pixel">
                  <div className="col-start-2 w-12 h-12 border-2 border-cyan-500 flex items-center justify-center bg-cyan-900/30">W</div>
                  <div className="col-start-1 w-12 h-12 border-2 border-cyan-500 flex items-center justify-center bg-cyan-900/30">A</div>
                  <div className="col-start-2 w-12 h-12 border-2 border-cyan-500 flex items-center justify-center bg-cyan-900/30">S</div>
                  <div className="col-start-3 w-12 h-12 border-2 border-cyan-500 flex items-center justify-center bg-cyan-900/30">D</div>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 z-30 border-4 border-red-600 m-4 animate-tear">
                <h3 className="text-3xl md:text-4xl font-pixel text-red-500 mb-4 animate-glitch-text uppercase">FATAL_ERROR</h3>
                <p className="text-fuchsia-400 mb-8 font-mono text-xl uppercase">Data loss: <span className="text-white font-bold">{score}</span></p>
                <button 
                  onClick={resetGame}
                  className="flex items-center space-x-3 px-6 py-4 bg-black border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-all shadow-[4px_4px_0px_#ff0000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                >
                  <RefreshCw size={24} />
                  <span className="font-pixel text-sm uppercase">REBOOT_SYS</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls Hint */}
        <div className="mt-8 text-fuchsia-600 text-sm font-pixel md:hidden text-center z-10 uppercase">
          <p>KEYBOARD_REQ</p>
        </div>
      </div>
    </div>
  );
}
