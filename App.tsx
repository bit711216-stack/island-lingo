
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, DailyLesson, WordItem, SentenceItem } from './types';
import { fetchDailyLesson } from './services/geminiService';
import LearningCard from './components/LearningCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [lesson, setLesson] = useState<DailyLesson | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Finding the perfect island for you...');
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);
  const [streak, setStreak] = useState(0);

  // South Pacific / Tropical Scenic backgrounds
  const backgroundUrl = useMemo(() => {
    switch (appState) {
      case AppState.HOME:
        return 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&q=80&w=2000'; // Bora Bora Beach
      case AppState.LEARNING:
        return 'https://images.unsplash.com/photo-1544149503-0949d0f01904?auto=format&fit=crop&q=80&w=2000'; // Tropical Palms
      case AppState.QUIZ:
        return 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=2000'; // Ocean Sunset
      case AppState.RESULT:
        return 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=2000'; // Crystal Lagoon
      case AppState.LOADING:
        return 'https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&q=80&w=2000'; // Calm Waves
      default:
        return 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&q=80&w=2000';
    }
  }, [appState]);

  useEffect(() => {
    const lastDate = localStorage.getItem('lastLessonDate');
    const currentStreak = parseInt(localStorage.getItem('lessonStreak') || '0');
    setStreak(currentStreak);
  }, [appState]);

  const goHome = () => {
    setAppState(AppState.HOME);
    setCurrentStep(0);
    setScore(0);
    setFeedback(null);
  };

  const completeLesson = () => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastLessonDate');
    let currentStreak = parseInt(localStorage.getItem('lessonStreak') || '0');

    if (lastDate !== today) {
      currentStreak += 1;
      localStorage.setItem('lastLessonDate', today);
      localStorage.setItem('lessonStreak', currentStreak.toString());
      setStreak(currentStreak);
    }
    setAppState(AppState.RESULT);
  };

  const startJourney = async () => {
    setAppState(AppState.LOADING);
    setLoadingMsg('Preparing your island welcome drink...');
    try {
      const dailyLesson = await fetchDailyLesson();
      setLesson(dailyLesson);
      setAppState(AppState.LEARNING);
      setCurrentStep(0);
    } catch (err) {
      alert("The tide is too high! Please try again later.");
      setAppState(AppState.HOME);
    }
  };

  const handleNextStep = () => {
    if (!lesson) return;
    const totalSteps = lesson.words.length + lesson.sentences.length;
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setAppState(AppState.QUIZ);
      setCurrentStep(0);
      prepareQuiz(0);
    }
  };

  const prepareQuiz = (stepIndex: number) => {
    if (!lesson) return;
    const isWordQuiz = stepIndex < 5;
    let correctAnswer = '';
    let pool: string[] = [];

    if (isWordQuiz) {
      const currentWord = lesson.words[stepIndex];
      correctAnswer = currentWord.meaning;
      pool = lesson.words.map(w => w.meaning);
    } else {
      const currentSentence = lesson.sentences[stepIndex - 5];
      correctAnswer = currentSentence.korean;
      pool = lesson.sentences.map(s => s.korean);
    }

    const options = [correctAnswer, ...pool.filter(p => p !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3)];
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  const handleQuizAnswer = (answer: string) => {
    if (!lesson || feedback?.show) return;
    const isWordQuiz = currentStep < 5;
    const correctAnswer = isWordQuiz 
      ? lesson.words[currentStep].meaning 
      : lesson.sentences[currentStep - 5].korean;

    const isCorrect = answer === correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    setFeedback({ isCorrect, show: true });

    setTimeout(() => {
      if (currentStep < 9) {
        setCurrentStep(prev => prev + 1);
        prepareQuiz(currentStep + 1);
      } else {
        completeLesson();
      }
    }, 1500);
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
      <div className="mb-10 relative">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[4rem] border border-white/30 shadow-2xl animate-sway">
          <div className="bg-emerald-500/90 text-white px-6 py-2 rounded-full shadow-lg mb-6 inline-block font-bold tracking-wider text-xs uppercase">
            🌴 {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
          <h1 className="text-7xl font-display font-black text-white mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">Island Lingo</h1>
          <p className="text-white font-medium text-xl italic drop-shadow-md max-w-sm mx-auto leading-relaxed">
            "Your tropical escape to fluent travel English."
          </p>
        </div>
      </div>
      
      <button 
        onClick={startJourney}
        className="travel-gradient text-white px-14 py-6 rounded-[2rem] text-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-4 active:scale-95 group border-b-4 border-emerald-700"
      >
        <span>Check-in to Resort</span>
        <span className="text-3xl group-hover:rotate-12 transition-transform">🍹</span>
      </button>

      <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg w-full bg-emerald-900/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-emerald-400/30 shadow-2xl text-white">
        <div className="text-center border-r border-white/20">
          <div className="text-3xl font-black text-emerald-200">5</div>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Shells</div>
        </div>
        <div className="text-center border-r border-white/20">
          <div className="text-3xl font-black text-emerald-200">5</div>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Waves</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-yellow-300">{streak}</div>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Sun Days</div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
      <div className="relative">
         <div className="w-32 h-32 border-[10px] border-white/10 border-t-yellow-400 rounded-full animate-spin mb-10 shadow-2xl"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-pulse">🥥</div>
      </div>
      <p className="text-3xl font-black text-white drop-shadow-lg">{loadingMsg}</p>
      <p className="text-white/80 mt-4 font-bold tracking-widest uppercase text-sm">Loading your paradise...</p>
    </div>
  );

  const renderLearning = () => {
    if (!lesson) return null;
    const isWord = currentStep < 5;
    const item = isWord ? lesson.words[currentStep] : lesson.sentences[currentStep - 5];
    const progress = ((currentStep + 1) / 10) * 100;

    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="glass p-8 rounded-[3rem] shadow-2xl border-white/50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🌺</div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-4xl font-display font-black text-gray-800">🏝️ {lesson.theme}</h2>
              <p className="text-emerald-600 font-black text-xs tracking-[0.2em] uppercase mt-2">Island Exploration {currentStep + 1} / 10</p>
            </div>
            <button onClick={goHome} className="bg-white/80 p-4 rounded-2xl shadow-md hover:bg-red-50 transition-all text-gray-400 hover:text-red-500 border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="w-full bg-gray-100/80 h-4 rounded-full mt-8 overflow-hidden shadow-inner border border-white">
            <div className="travel-gradient h-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <LearningCard item={item} type={isWord ? 'word' : 'sentence'} />

        <div className="mt-10 flex justify-end">
          <button 
            onClick={handleNextStep}
            className="travel-gradient text-white px-14 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all active:translate-y-0 flex items-center gap-3"
          >
            {currentStep === 9 ? 'Island Master Quiz' : 'Next Discovery'}
            <span className="text-2xl">🐚</span>
          </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lesson) return null;
    const isWordQuiz = currentStep < 5;
    const currentItem = isWordQuiz ? lesson.words[currentStep] : lesson.sentences[currentStep - 5];
    const question = isWordQuiz ? currentItem.word : (currentItem as SentenceItem).english;

    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="glass p-12 rounded-[4rem] shadow-2xl text-center mb-10 border-white/60 relative">
          <div className="absolute top-4 left-4 text-4xl opacity-20 rotate-12">🏄</div>
          <span className="text-xs font-black text-sky-600 uppercase tracking-[0.3em] bg-sky-50 px-6 py-2 rounded-full mb-8 inline-block border border-sky-100">Island Guide Quiz</span>
          <h2 className="text-4xl font-display font-black text-gray-800 mb-8 leading-tight">Can you translate this?</h2>
          <div className="bg-emerald-600/5 p-10 rounded-[2.5rem] border-4 border-dotted border-emerald-200">
             <p className="text-4xl font-black text-emerald-800 font-display italic">"{question}"</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {quizOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleQuizAnswer(option)}
              disabled={feedback?.show}
              className={`p-8 text-left rounded-[2rem] border-2 transition-all font-black text-xl shadow-xl ${
                feedback?.show 
                  ? option === (isWordQuiz ? (currentItem as WordItem).meaning : (currentItem as SentenceItem).korean)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : feedback.isCorrect === false && option === feedback.show ? 'border-red-500 bg-red-50 text-red-700' : 'bg-white/40 border-transparent opacity-30'
                  : 'bg-white/95 border-white hover:border-sky-400 hover:bg-white hover:scale-[1.02]'
              }`}
            >
              <span className="inline-block w-10 h-10 rounded-2xl bg-sky-100 text-center leading-10 mr-5 text-base font-black text-sky-500">{idx + 1}</span>
              {option}
            </button>
          ))}
        </div>

        {feedback?.show && (
          <div className={`mt-10 p-8 rounded-[3rem] text-center font-black animate-bounce shadow-2xl glass border-2 ${feedback.isCorrect ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}>
            <span className="text-3xl block mb-2">{feedback.isCorrect ? '🌟 BRAVO!' : '📍 HINT'}</span>
            {feedback.isCorrect ? 'You have the island spirit!' : 'The locals say: "' + (isWordQuiz ? (currentItem as WordItem).meaning : (currentItem as SentenceItem).korean) + '"'}
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
      <div className="glass rounded-[4rem] shadow-2xl p-14 max-w-lg w-full relative overflow-hidden border-white/70">
        <div className="absolute top-0 left-0 w-full h-5 travel-gradient"></div>
        <div className="text-9xl mb-8 animate-sway inline-block">🍍</div>
        <h2 className="text-5xl font-display font-black text-gray-800 mb-4">Mahalo!</h2>
        <p className="text-gray-600 font-bold text-lg mb-12 leading-relaxed italic">You've successfully explored the island of <b>{lesson?.theme}</b>.</p>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-sky-500/10 p-8 rounded-[3rem] border-2 border-sky-100 shadow-inner">
            <p className="text-[11px] text-sky-500 uppercase font-black mb-2 tracking-[0.2em]">Mastery</p>
            <p className="text-5xl font-black text-sky-600">{score * 10}%</p>
          </div>
          <div className="bg-yellow-500/10 p-8 rounded-[3rem] border-2 border-yellow-100 shadow-inner">
            <p className="text-[11px] text-yellow-600 uppercase font-black mb-2 tracking-[0.2em]">Sun Streak</p>
            <p className="text-5xl font-black text-yellow-600">{streak} <span className="text-xl">d</span></p>
          </div>
        </div>

        <button 
          onClick={goHome}
          className="w-full bg-gray-900 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-black transition-all shadow-2xl hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4"
        >
          <span>Return to Beach</span>
          <span className="text-3xl">🏖️</span>
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-scenic text-gray-800 pb-24 relative"
      style={{ backgroundImage: `url('${backgroundUrl}')` }}
    >
      <div className="absolute inset-0 overlay-tropical pointer-events-none"></div>

      <nav className="relative p-6 flex justify-between items-center max-w-6xl mx-auto z-[100]">
        <button 
          onClick={goHome} 
          className="flex items-center gap-4 hover:opacity-95 transition-all focus:outline-none group glass-dark p-3 pr-8 rounded-[2rem] border-white/20 shadow-2xl"
        >
          <div className="w-14 h-14 travel-gradient rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-[15deg] transition-transform">
            <span className="text-3xl">🌺</span>
          </div>
          <span className="text-4xl font-black tracking-tighter text-white font-display italic">IslandLingo</span>
        </button>
        
        <div className="flex items-center gap-5">
          <button 
            onClick={goHome}
            className="glass-dark p-4 px-8 text-white hover:bg-white hover:text-gray-900 rounded-[2rem] transition-all shadow-2xl flex items-center gap-3 font-black group cursor-pointer border-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="md:block hidden text-lg">Main Beach</span>
          </button>
          <div className="bg-yellow-400 text-gray-900 px-6 py-4 rounded-[2rem] shadow-2xl text-xl font-black flex items-center gap-2 border-b-4 border-yellow-600 animate-pulse">
            ☀️ {streak}
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {appState === AppState.HOME && renderHome()}
        {appState === AppState.LOADING && renderLoading()}
        {appState === AppState.LEARNING && renderLearning()}
        {appState === AppState.QUIZ && renderQuiz()}
        {appState === AppState.RESULT && renderResult()}
      </main>

      {(appState === AppState.LEARNING || appState === AppState.QUIZ) && (
        <div className="fixed bottom-10 left-0 w-full px-8 flex justify-center z-[50]">
           <div className="glass max-w-lg w-full p-6 rounded-[3rem] border-white/60 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center mb-4">
                <div className="text-[11px] font-black text-gray-500 tracking-[0.3em] uppercase">Current Expedition</div>
                <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{Math.round((appState === AppState.QUIZ ? 10 : currentStep) * 10)}% EXPLORED</div>
              </div>
              <div className="h-4 bg-gray-100/60 rounded-full overflow-hidden border border-white shadow-inner">
                <div 
                  className="h-full travel-gradient transition-all duration-1000 ease-out" 
                  style={{ width: `${(appState === AppState.QUIZ ? 10 : currentStep) * 10}%` }}
                />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
