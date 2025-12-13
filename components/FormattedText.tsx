import React, { useState } from 'react';
import { Copy, Check, Lightbulb, Volume2, StopCircle } from 'lucide-react';

interface FormattedTextProps {
  text: string;
  isUser: boolean;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, isUser }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Arabic Saudi Arabia
    utterance.rate = 0.9; // Slightly slower for professionalism
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const renderTable = (tableBlock: string, key: number) => {
    const rows = tableBlock.trim().split('\n');
    const headers = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
    const dataRows = rows.slice(2).map(row => row.split('|').filter(c => c.trim() !== '').map(c => c.trim()));

    return (
      <div key={key} className="my-4 sm:my-5 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-surface-dark">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 sm:px-5 sm:py-4 text-right font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 dark:border-gray-700 first:border-r-0 border-r border-gray-100 dark:border-gray-800 last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {dataRows.map((row, i) => (
                <tr key={i} className={`
                  transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10
                  ${i % 2 === 0 ? 'bg-white dark:bg-surface-dark' : 'bg-gray-50/50 dark:bg-white/5'}
                `}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 sm:px-5 sm:py-3.5 whitespace-nowrap text-gray-700 dark:text-gray-300 border-r border-transparent last:border-r-0">
                      <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(cell) }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const content = (
    <>
      {/* Action Buttons */}
      <div className={`absolute top-0 ${isUser ? 'right-auto left-[-40px] sm:left-[-50px]' : 'left-[-40px] sm:left-[-50px]'} flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full text-gray-400 hover:text-primary-light dark:hover:text-primary-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          title="نسخ النص"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        {!isUser && (
          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-full transition-all ${isSpeaking ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-primary-light dark:hover:text-primary-dark hover:bg-black/5 dark:hover:bg-white/5'}`}
            title={isSpeaking ? "إيقاف القراءة" : "قراءة النص"}
          >
            {isSpeaking ? <StopCircle className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {text.split('\n\n').map((paragraph, idx) => {
        // Table Detection
        if (paragraph.trim().startsWith('|') && paragraph.includes('---')) {
            return renderTable(paragraph, idx);
        }

        // Heading 2 Detection
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base sm:text-lg font-bold text-primary-light dark:text-primary-dark mt-5 sm:mt-6 mb-3 sm:mb-4 border-b border-primary-light/20 pb-1 inline-block">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }

        // Blockquote / Expert Tip
        if (paragraph.startsWith('> ')) {
            return (
                <div key={idx} className="my-3 sm:my-4 relative print:border-l-4 print:border-gray-800">
                     <blockquote className="border-r-4 border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/10 p-3 sm:p-4 rounded-l-xl text-text-light dark:text-text-dark relative pr-4">
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2 text-primary-light dark:text-primary-dark font-bold text-xs sm:text-sm">
                            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>رأي الخبير:</span>
                        </div>
                        <p className="italic text-xs sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                             {paragraph.replace('> ', '')}
                        </p>
                    </blockquote>
                </div>
            );
        }
        
        // Lists
        if (paragraph.includes('\n- ') || paragraph.includes('\n* ') || paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
            const lines = paragraph.split('\n');
            const listItems: string[] = [];
            
            lines.forEach(line => {
                if(line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    listItems.push(line.trim().replace(/^[\-\*]\s+/, ''));
                }
            });

            if (listItems.length > 0) {
                 return (
                    <ul key={idx} className="list-disc list-inside space-y-2 sm:space-y-2.5 marker:text-primary-light dark:marker:text-primary-dark my-3 sm:my-4 text-gray-700 dark:text-gray-300">
                        {listItems.map((item, i) => (
                             <li key={i} className="text-sm sm:text-base pl-2" dangerouslySetInnerHTML={{__html: formatInlineStyles(item)}} />
                        ))}
                    </ul>
                 )
            }
        }

        return (
          <p 
            key={idx} 
            className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark mb-3 sm:mb-4"
            dangerouslySetInnerHTML={{ __html: formatInlineStyles(paragraph) }}
          />
        );
      })}
    </>
  );

  if (isUser) {
    return (
      <div className="group relative">
        {content}
      </div>
    );
  }

  return <div className="group relative">{content}</div>;
};

const formatInlineStyles = (text: string): string => {
  let formatted = text;
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  formatted = formatted.replace(/\n/g, '<br />');
  return formatted;
};