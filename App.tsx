
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
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean; selectedAnswer?: string } | null>(null);
  const [streak, setStreak] = useState(0);

  const backgroundUrl = useMemo(() => {
    switch (appState) {
      case AppState.HOME:
        return 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&q=80&w=2000';
      case AppState.LEARNING:
        return 'https://images.unsplash.com/photo-1544149503-0949d0f01904?auto=format&fit=crop&q=80&w=2000';
      case AppState.QUIZ:
        return 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=2000';
      case AppState.RESULT:
        return 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=2000';
      case AppState.LOADING:
        return 'https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&q=80&w=2000';
      default:
        return 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&q=80&w=2000';
    }
  }, [appState]);

  useEffect(() => {
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
    setLoadingMsg('Preparing your welcome drink...');
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
    setFeedback({ isCorrect, show: true, selectedAnswer: answer });

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
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 py-8 overflow-hidden">
      <div className="mb-8 relative w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-white/30 shadow-2xl animate-sway">
          <div className="bg-emerald-500/90 text-white px-4 py-1.5 rounded-full shadow-lg mb-4 inline-block font-bold tracking-wider text-[10px] uppercase">
            🌴 {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
          <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-3 drop-shadow-lg">Island Lingo</h1>
          <p className="text-white font-medium text-base md:text-xl italic drop-shadow-md max-w-[200px] md:max-w-[250px] mx-auto leading-relaxed opacity-90">
            "Your tropical escape to fluent English."
          </p>
        </div>
      </div>
      
      <button 
        onClick={startJourney}
        className="travel-gradient text-white px-8 md:px-14 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] text-lg md:text-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3 active:scale-95 group border-b-4 border-emerald-700 w-full max-w-xs justify-center"
      >
        <span>Check-in Now</span>
        <span className="text-2xl group-hover:rotate-12 transition-transform">🍹</span>
      </button>

      <div className="mt-10 grid grid-cols-3 gap-2 md:gap-6 w-full max-w-sm bg-emerald-900/40 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-emerald-400/30 shadow-2xl text-white">
        <div className="text-center border-r border-white/20">
          <div className="text-xl md:text-3xl font-black text-emerald-200">5</div>
          <div className="text-[8px] md:text-[9px] uppercase font-bold tracking-widest opacity-80 mt-1">Shells</div>
        </div>
        <div className="text-center border-r border-white/20">
          <div className="text-xl md:text-3xl font-black text-emerald-200">5</div>
          <div className="text-[8px] md:text-[9px] uppercase font-bold tracking-widest opacity-80 mt-1">Waves</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-3xl font-black text-yellow-300">{streak}</div>
          <div className="text-[8px] md:text-[9px] uppercase font-bold tracking-widest opacity-80 mt-1">Sun Days</div>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <div className="relative">
         <div className="w-20 h-20 md:w-32 md:h-32 border-[6px] md:border-[10px] border-white/10 border-t-yellow-400 rounded-full animate-spin mb-8 shadow-2xl"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl animate-pulse">🥥</div>
      </div>
      <p className="text-xl md:text-3xl font-black text-white drop-shadow-lg max-w-xs mx-auto">{loadingMsg}</p>
      <p className="text-white/80 mt-4 font-bold tracking-widest uppercase text-[10px]">Loading paradise...</p>
    </div>
  );

  const renderLearning = () => {
    if (!lesson) return null;
    const isWord = currentStep < 5;
    const item = isWord ? lesson.words[currentStep] : lesson.sentences[currentStep - 5];

    return (
      <div className="w-full max-w-md mx-auto py-6 px-4 pb-36 overflow-x-hidden">
        <div className="glass p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border-white/50 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex-1 pr-2">
              <h2 className="text-xl md:text-4xl font-display font-black text-gray-800 truncate">🏝️ {lesson.theme}</h2>
              <p className="text-emerald-600 font-black text-[9px] md:text-[10px] tracking-wider uppercase mt-1">Expedition {currentStep + 1} / 10</p>
            </div>
            <button onClick={goHome} className="bg-white/80 p-2 rounded-lg md:rounded-xl shadow-md hover:bg-red-50 transition-all text-gray-400 hover:text-red-500 border border-gray-100 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <LearningCard item={item} type={isWord ? 'word' : 'sentence'} />

        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleNextStep}
            className="travel-gradient text-white w-full py-4 md:py-6 rounded-[1.25rem] md:rounded-[2.5rem] font-black text-base md:text-xl shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-2"
          >
            {currentStep === 9 ? 'Take Master Quiz' : 'Next Discovery'}
            <span className="text-lg">🐚</span>
          </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lesson) return null;
    const isWordQuiz = currentStep < 5;
    const currentItem = isWordQuiz ? lesson.words[currentStep] : lesson.sentences[currentStep - 5];
    const question = isWordQuiz ? (currentItem as WordItem).word : (currentItem as SentenceItem).english;
    const correctAnswer = isWordQuiz ? (currentItem as WordItem).meaning : (currentItem as SentenceItem).korean;

    return (
      <div className="w-full max-w-md mx-auto py-6 px-4 pb-36 overflow-x-hidden">
        <div className="glass p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-2xl text-center mb-6 border-white/60 relative">
          <span className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full mb-4 md:mb-6 inline-block border border-sky-100">Guide Quiz</span>
          <h2 className="text-xl md:text-3xl font-display font-black text-gray-800 mb-4 md:mb-6 leading-tight">Translate this:</h2>
          <div className="bg-emerald-600/5 p-4 md:p-8 rounded-[1.25rem] border-2 border-dotted border-emerald-200">
             <p className="text-xl md:text-3xl font-black text-emerald-800 font-display italic leading-snug break-words">"{question}"</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {quizOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleQuizAnswer(option)}
              disabled={feedback?.show}
              className={`p-4 md:p-6 text-left rounded-[1.25rem] border-2 transition-all font-black text-sm md:text-lg shadow-lg flex items-center ${
                feedback?.show 
                  ? option === correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : feedback.isCorrect === false && option === feedback.selectedAnswer ? 'border-red-500 bg-red-50 text-red-700' : 'bg-white/40 border-transparent opacity-30'
                  : 'bg-white/95 border-white active:scale-95'
              }`}
            >
              <span className="inline-block w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-sky-100 text-center leading-6 md:leading-8 mr-3 md:mr-4 text-[10px] md:text-xs font-black text-sky-500 flex-shrink-0">{idx + 1}</span>
              <span className="break-words">{option}</span>
            </button>
          ))}
        </div>

        {feedback?.show && (
          <div className={`mt-6 p-4 md:p-6 rounded-[1.5rem] text-center font-black animate-bounce shadow-2xl glass border-2 ${feedback.isCorrect ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}>
            <span className="text-lg md:text-xl block mb-1">{feedback.isCorrect ? '🌟 BRAVO!' : '📍 LOCAL HINT'}</span>
            <p className="text-xs md:text-sm opacity-90">{feedback.isCorrect ? 'You have the spirit!' : 'The answer is: ' + correctAnswer}</p>
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 py-8">
      <div className="glass rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-8 md:p-14 max-w-sm w-full relative overflow-hidden border-white/70">
        <div className="absolute top-0 left-0 w-full h-3 md:h-4 travel-gradient"></div>
        <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-sway inline-block">🍍</div>
        <h2 className="text-3xl md:text-5xl font-display font-black text-gray-800 mb-2">Mahalo!</h2>
        <p className="text-gray-600 font-bold text-sm md:text-base mb-8 md:mb-10 leading-relaxed italic opacity-80">You've explored <b>{lesson?.theme}</b>.</p>
        
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
          <div className="bg-sky-500/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-sky-100">
            <p className="text-[9px] md:text-[10px] text-sky-500 uppercase font-black mb-1 tracking-wider">Mastery</p>
            <p className="text-2xl md:text-4xl font-black text-sky-600">{score * 10}%</p>
          </div>
          <div className="bg-yellow-500/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-yellow-100">
            <p className="text-[9px] md:text-[10px] text-yellow-600 uppercase font-black mb-1 tracking-wider">Streak</p>
            <p className="text-2xl md:text-4xl font-black text-yellow-600">{streak}d</p>
          </div>
        </div>

        <button 
          onClick={goHome}
          className="w-full bg-gray-900 text-white py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.5rem] font-black text-lg md:text-xl hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Main Beach</span>
          <span className="text-xl md:text-2xl">🏖️</span>
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-scenic text-gray-800 relative flex flex-col overflow-x-hidden"
      style={{ backgroundImage: `url('${backgroundUrl}')` }}
    >
      <div className="absolute inset-0 overlay-tropical pointer-events-none"></div>

      <nav className="relative p-4 md:p-6 flex justify-between items-center max-w-4xl mx-auto z-[100] w-full">
        <button onClick={goHome} className="flex items-center gap-2 md:gap-3 hover:opacity-95 transition-all focus:outline-none glass-dark p-1.5 md:p-2 pr-4 md:pr-5 rounded-full border-white/20 shadow-xl">
          <div className="w-8 h-8 md:w-12 md:h-12 travel-gradient rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl md:text-3xl">🌺</span>
          </div>
          <span className="text-xl md:text-3xl font-black text-white font-display italic">IslandLingo</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-yellow-400 text-gray-900 px-3 md:px-4 py-2 md:py-2.5 rounded-full shadow-lg text-xs md:text-base font-black flex items-center gap-1.5 md:gap-2 border-b-2 border-yellow-600">
            ☀️ {streak}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col w-full overflow-x-hidden">
        {appState === AppState.HOME && renderHome()}
        {appState === AppState.LOADING && renderLoading()}
        {appState === AppState.LEARNING && renderLearning()}
        {appState === AppState.QUIZ && renderQuiz()}
        {appState === AppState.RESULT && renderResult()}
      </main>

      {(appState === AppState.LEARNING || appState === AppState.QUIZ) && (
        <div className="fixed bottom-6 left-0 w-full px-4 md:px-6 flex justify-center z-[50]">
           <div className="glass max-w-[280px] md:max-w-xs w-full p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-white/60 shadow-2xl">
              <div className="flex justify-between items-center mb-1.5 md:mb-2 px-1">
                <div className="text-[8px] md:text-[9px] font-black text-gray-500 tracking-wider uppercase">Progress</div>
                <div className="text-[8px] md:text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{Math.round((appState === AppState.QUIZ ? 10 : currentStep) * 10)}%</div>
              </div>
              <div className="h-2 md:h-2.5 bg-gray-100/60 rounded-full overflow-hidden border border-white shadow-inner">
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
