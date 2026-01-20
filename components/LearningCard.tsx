
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
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 border-b-8 border-sky-400 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 shadow-sm">Vocabulary</span>
          <button 
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-lg transition-all ${isSpeaking ? 'bg-gray-100 scale-95' : 'bg-sky-500 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
        <h2 className="text-4xl md:text-6xl font-display font-black text-gray-800 mb-2 truncate">{word.word}</h2>
        <p className="text-sm md:text-lg text-sky-500 font-bold italic mb-6 bg-sky-50 inline-block px-3 py-1 rounded-xl">/ {word.phonetic} /</p>
        <div className="space-y-4 md:space-y-6 relative z-10">
          <div>
            <p className="text-xl md:text-2xl font-black text-gray-700 leading-snug">{word.meaning}</p>
          </div>
          <div className="bg-emerald-50/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-emerald-100">
            <p className="text-[9px] text-emerald-400 uppercase font-black mb-1 tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Island Example
            </p>
            <p className="text-base md:text-xl text-gray-600 font-medium italic leading-relaxed">"{word.example}"</p>
          </div>
        </div>
      </div>
    );
  }

  const sentence = item as SentenceItem;
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 border-b-8 border-emerald-400 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">Conversation</span>
        <button 
          onClick={handleSpeak}
          disabled={isSpeaking}
          className={`p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-lg transition-all ${isSpeaking ? 'bg-gray-100 scale-95' : 'bg-emerald-500 active:scale-95'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>
      <p className="text-xl md:text-3xl font-display font-black text-gray-800 mb-6 leading-tight italic">"{sentence.english}"</p>
      <div className="space-y-4 md:space-y-6 relative z-10">
        <div>
          <p className="text-xl md:text-2xl font-black text-gray-700 leading-snug">{sentence.korean}</p>
        </div>
        <div className="bg-sky-50/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-sky-100">
          <p className="text-[9px] text-sky-400 uppercase font-black mb-1 tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span> Situation
          </p>
          <p className="text-sm md:text-lg text-gray-600 font-medium italic leading-snug">{sentence.situation}</p>
        </div>
      </div>
    </div>
  );
};

export default LearningCard;
