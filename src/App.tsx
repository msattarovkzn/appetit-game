import React, { useState } from 'react';
import { GameScreen, GameResult, CourierType } from './types/game';
import { StartScreen }    from './components/StartScreen';
import { CourierSelect }  from './components/CourierSelect';
import { RulesScreen }    from './components/RulesScreen';
import { GameCanvas }     from './components/GameCanvas';
import { ResultScreen }   from './components/ResultScreen';
import { getStats }       from './utils/analytics';

export function App() {
  const [screen,  setScreen]  = useState<GameScreen>('start');
  const [result,  setResult]  = useState<GameResult | null>(null);
  const [courier, setCourier] = useState<CourierType>('male');

  const handleGameEnd = (r: GameResult) => {
    setResult(r);
    setScreen('result');
  };

  const handleSelectCourier = (c: CourierType) => {
    setCourier(c);
    setScreen('rules');
  };

  const handlePlayAgain = () => {
    setResult(null);
    setScreen('courier-select');
  };

  return (
    <>
      {screen === 'start'          && <StartScreen   onStart={() => setScreen('courier-select')} bestScore={getStats().bestScore} />}
      {screen === 'courier-select' && <CourierSelect onSelect={handleSelectCourier} />}
      {screen === 'rules'          && <RulesScreen   onPlay={() => setScreen('game')} />}
      {screen === 'game'           && <GameCanvas    onGameEnd={handleGameEnd} courierType={courier} />}
      {screen === 'result' && result && <ResultScreen result={result} onPlayAgain={handlePlayAgain} />}
    </>
  );
}
