import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { FormData, GeneratedContent, SavedQuiz, QuizQuestion } from './types';
import Header from './components/Header';
import InputForm from './components/InputForm';
import LoadingSpinner from './components/LoadingSpinner';
import MarkdownRenderer from './components/MarkdownRenderer';
import InteractiveQuiz from './components/InteractiveQuiz';
import ExportControls from './components/ExportControls';
import { generateEducationalContent } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'ai-teacher-question-bank';

// --- QuestionBank Component Definition ---
interface QuestionBankProps {
  quizzes: SavedQuiz[];
  onLoad: (quiz: SavedQuiz) => void;
  onDelete: (quizId: string) => void;
  isLoading: boolean;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ quizzes, onLoad, onDelete, isLoading }) => {
  return (
    <div className="mt-8">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Question Bank</h2>
        {quizzes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Your saved quizzes will appear here.</p>
        ) : (
          <ul className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            {quizzes.map(quiz => (
              <li key={quiz.id} className="p-3 bg-slate-700 rounded-md border border-slate-600">
                <p className="font-semibold text-slate-200 truncate" title={quiz.topic}>{quiz.topic}</p>
                <p className="text-xs text-slate-400">
                  {quiz.questions.length} questions - {new Date(quiz.savedAt).toLocaleDateString()}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button 
                    onClick={() => onLoad(quiz)} 
                    disabled={isLoading}
                    className="flex-1 text-xs px-2 py-1 bg-indigo-500 text-white font-semibold rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => onDelete(quiz.id)} 
                    disabled={isLoading}
                    className="flex-1 text-xs px-2 py-1 bg-slate-600 text-slate-200 font-semibold rounded hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);

  useEffect(() => {
    try {
      const storedQuizzes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedQuizzes) {
        setSavedQuizzes(JSON.parse(storedQuizzes));
      }
    } catch (e) {
      console.error("Failed to load quizzes from local storage", e);
    }
  }, []);

  const reversedQuizzes = useMemo(() => [...savedQuizzes].reverse(), [savedQuizzes]);

  const handleSaveQuiz = useCallback((questions: QuizQuestion[], topic: string) => {
    const newQuiz: SavedQuiz = { 
      id: crypto.randomUUID(), 
      topic, 
      questions, 
      savedAt: new Date().toISOString() 
    };
    const updatedQuizzes = [...savedQuizzes, newQuiz];
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQuizzes));
  }, [savedQuizzes]);
  
  const handleLoadQuiz = useCallback((quiz: SavedQuiz) => {
    setGeneratedContent({ type: 'quiz', content: quiz.questions });
    setCurrentTopic(quiz.topic);
    setError(null);
  }, []);

  const handleDeleteQuiz = useCallback((quizId: string) => {
    const updatedQuizzes = savedQuizzes.filter(q => q.id !== quizId);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQuizzes));
  }, [savedQuizzes]);

  const handleGenerateContent = useCallback(async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const content = await generateEducationalContent(formData);
      setGeneratedContent(content);
      setCurrentTopic(formData.topic);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const renderContent = () => {
    if (!generatedContent) return null;

    if (generatedContent.type === 'quiz') {
      return <InteractiveQuiz data={generatedContent.content} topic={currentTopic} onSaveQuiz={handleSaveQuiz} />;
    }
    
    if (generatedContent.type === 'markdown') {
      return <MarkdownRenderer content={generatedContent.content} />;
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-8">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-100 mb-4">Create Your Material</h2>
                    <InputForm onSubmit={handleGenerateContent} isLoading={isLoading} />
                </div>
                <QuestionBank 
                  quizzes={reversedQuizzes} 
                  onLoad={handleLoadQuiz} 
                  onDelete={handleDeleteQuiz}
                  isLoading={isLoading}
                />
            </div>
          </aside>

          <section className="lg:col-span-8 xl:col-span-9">
            <div className="bg-slate-800 min-h-[calc(100vh-10rem)] p-6 sm:p-8 rounded-xl shadow-lg relative">
              {generatedContent?.type === 'markdown' && !isLoading && (
                <ExportControls content={generatedContent.content} topic={currentTopic} />
              )}
              {isLoading && <LoadingSpinner />}
              {error && <div className="text-red-300 bg-red-900/50 border border-red-500/50 p-4 rounded-md">{error}</div>}
              {!isLoading && !error && !generatedContent && (
                 <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v1.5M12 9.75v6.5M12 16.253v1.5M12 3.75l-.16.01M12.75 3.75a.75.75 M12 21.25l-.16.01M12.75 21.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM4.135 8.648l.01.16M4.135 15.352l.01-.16M19.865 8.648l-.01.16M19.865 15.352l-.01-.16M8.648 4.135l.16.01M15.352 4.135l-.16.01M8.648 19.865l.16-.01M15.352 19.865l-.16-.01" />
                    </svg>
                    <h3 className="text-xl font-semibold text-slate-200">Welcome, Educator!</h3>
                    <p className="mt-2 max-w-md">Use the form to generate content, or load a saved quiz from your Question Bank.</p>
                </div>
              )}
              {renderContent()}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default App;