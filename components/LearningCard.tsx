
import React, { useState } from 'react';
import { WordItem, SentenceItem } from '../types';
import { speakText } from '../services/geminiService';

interface Props {
  item: WordItem | SentenceItem;
  type: 'word' | 'sentence';
}

const LearningCard: React.FC<Props> = ({ item, type }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    setIsSpeaking(true);
    const textToSpeak = type === 'word' ? (item as WordItem).word : (item as SentenceItem).english;
    try {
      await speakText(textToSpeak);
    } finally {
      setIsSpeaking(false);
    }
  };

  if (type === 'word') {
    const word = item as WordItem;
    return (
      <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl p-5 md:p-10 border-b-8 border-sky-400 relative overflow-hidden w-full">
        <div className="flex justify-between items-start mb-3 md:mb-6 relative z-10">
          <span className="text-[9px] md:text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 shadow-sm">Vocabulary</span>
          <button 
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`p-2.5 md:p-4 rounded-xl md:rounded-3xl shadow-lg transition-all ${isSpeaking ? 'bg-gray-100 scale-95' : 'bg-sky-500 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
        <h2 className="text-3xl md:text-6xl font-display font-black text-gray-800 mb-1 md:mb-2 break-words leading-tight">{word.word}</h2>
        <p className="text-xs md:text-lg text-sky-500 font-bold italic mb-4 md:mb-6 bg-sky-50 inline-block px-2.5 py-0.5 rounded-lg md:rounded-xl">/ {word.phonetic} /</p>
        <div className="space-y-3 md:space-y-6 relative z-10">
          <div>
            <p className="text-lg md:text-2xl font-black text-gray-700 leading-snug break-words">{word.meaning}</p>
          </div>
          <div className="bg-emerald-50/50 p-3.5 md:p-6 rounded-[1rem] md:rounded-[2rem] border-2 border-dashed border-emerald-100">
            <p className="text-[8px] md:text-[9px] text-emerald-400 uppercase font-black mb-1 tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> Island Example
            </p>
            <p className="text-sm md:text-xl text-gray-600 font-medium italic leading-relaxed break-words">"{word.example}"</p>
          </div>
        </div>
      </div>
    );
  }

  const sentence = item as SentenceItem;
  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl p-5 md:p-10 border-b-8 border-emerald-400 relative overflow-hidden w-full">
      <div className="flex justify-between items-start mb-3 md:mb-6 relative z-10">
        <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">Conversation</span>
        <button 
          onClick={handleSpeak}
          disabled={isSpeaking}
          className={`p-2.5 md:p-4 rounded-xl md:rounded-3xl shadow-lg transition-all ${isSpeaking ? 'bg-gray-100 scale-95' : 'bg-emerald-500 active:scale-95'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>
      <p className="text-lg md:text-3xl font-display font-black text-gray-800 mb-4 md:mb-6 leading-tight italic break-words">"{sentence.english}"</p>
      <div className="space-y-3 md:space-y-6 relative z-10">
        <div>
          <p className="text-lg md:text-2xl font-black text-gray-700 leading-snug break-words">{sentence.korean}</p>
        </div>
        <div className="bg-sky-50/50 p-3.5 md:p-6 rounded-[1rem] md:rounded-[2rem] border-2 border-dashed border-sky-100">
          <p className="text-[8px] md:text-[9px] text-sky-400 uppercase font-black mb-1 tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-sky-400 animate-pulse"></span> Situation
          </p>
          <p className="text-xs md:text-lg text-gray-600 font-medium italic leading-snug break-words">{sentence.situation}</p>
        </div>
      </div>
    </div>
  );
};

export default LearningCard;
