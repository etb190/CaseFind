import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { fetchCase } from '../services/api';
import { CaseRecord } from '../types';
import { ArrowLeft, Copy, Check, Printer, AlertCircle, RefreshCw } from 'lucide-react';

export const CasePage: React.FC = () => {
  const { path, goBack, navigate } = useRouter();
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Extract ID from `/case/<id>` - treated as opaque string
  const caseId = useMemo(() => {
    const prefix = '/case/';
    if (path.startsWith(prefix)) {
      return decodeURIComponent(path.slice(prefix.length));
    }
    return '';
  }, [path]);

  // Track scroll depth progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadCase = () => {
    if (!caseId) {
      setError('Case not found');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchCase(caseId)
      .then((data) => {
        setCaseData(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Couldn't reach the server. Try again.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  // Format legal citation for clipboard
  const formattedCitation = useMemo(() => {
    if (!caseData) return '';
    const year = caseData.date_filed ? caseData.date_filed.slice(0, 4) : '';
    const primaryCite = caseData.citations?.[0] || '';
    if (primaryCite) {
      return `${caseData.case_name}, ${primaryCite}${year ? ` (${year})` : ''}`;
    }
    return `${caseData.case_name}${year ? ` (${year})` : ''}`;
  }, [caseData]);

  const handleCopyCitation = async () => {
    if (!formattedCitation) return;
    try {
      await navigator.clipboard.writeText(formattedCitation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = formattedCitation;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fontSizeClass = {
    sm: 'text-base leading-[1.75]',
    base: 'text-lg leading-[1.85]',
    lg: 'text-xl leading-[1.9]',
    xl: 'text-2xl leading-[2.0]',
  }[fontSize];

  // Split opinion into paragraphs
  const paragraphs = useMemo(() => {
    if (!caseData?.text) return [];
    return caseData.text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  }, [caseData?.text]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50/40 dark:bg-stone-950 transition-colors py-12">
        <div className="max-w-[72ch] mx-auto px-4 sm:px-6 animate-pulse">
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-24 mb-6" />
          <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mb-4" />
          <div className="h-4 bg-stone-100 dark:bg-stone-800/60 rounded w-1/2 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-stone-100 dark:bg-stone-800/40 rounded w-full" />
            <div className="h-4 bg-stone-100 dark:bg-stone-800/40 rounded w-full" />
            <div className="h-4 bg-stone-100 dark:bg-stone-800/40 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-stone-50/40 dark:bg-stone-950 px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 font-interface mb-2">
            {error === 'Case not found' ? 'Case Not Found' : "Couldn't reach the server. Try again."}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-interface mb-6">
            {error === 'Case not found'
              ? 'The requested court opinion could not be located in the database.'
              : error}
          </p>
          <div className="flex justify-center gap-3">
            {error !== 'Case not found' && (
              <button
                onClick={loadCase}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium font-interface rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            )}
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-medium font-interface rounded-lg transition-colors cursor-pointer"
            >
              Back to search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/30 dark:bg-stone-950 transition-colors pb-24">
      
      {/* Reading Progress Bar (top sticky) */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-stone-800 dark:bg-stone-200 z-30 transition-all no-print"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Sticky Action Utility Bar */}
      <div className="sticky top-16 z-20 w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-2.5 transition-colors no-print">
        <div className="max-w-[76ch] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 text-xs font-interface">
          
          {/* Back Button */}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to results</span>
          </button>

          {/* Action buttons (Copy citation, Print, Font Size) */}
          <div className="flex items-center gap-2">
            
            {/* Font size control */}
            <div className="hidden sm:flex items-center border border-stone-200 dark:border-stone-700 rounded-md overflow-hidden bg-stone-50 dark:bg-stone-800">
              <button
                type="button"
                onClick={() => setFontSize((s) => (s === 'xl' ? 'lg' : s === 'lg' ? 'base' : 'sm'))}
                title="Decrease font size"
                className="px-2 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                A-
              </button>
              <span className="text-[10px] uppercase font-mono px-1.5 text-stone-400">
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => setFontSize((s) => (s === 'sm' ? 'base' : s === 'base' ? 'lg' : 'xl'))}
                title="Increase font size"
                className="px-2 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                A+
              </button>
            </div>

            {/* Copy Citation Button */}
            <button
              onClick={handleCopyCitation}
              title="Copy citation to clipboard"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium transition-colors cursor-pointer ${
                copied
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Citation Copied' : 'Copy Citation'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              title="Print opinion"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Reading Container: ~70 characters wide column */}
      <main className="max-w-[72ch] mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        
        {/* Case Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 font-interface mb-2 text-balance leading-tight">
            {caseData.case_name}
          </h1>
          {caseData.case_name_full && caseData.case_name_full !== caseData.case_name && (
            <p className="text-sm text-stone-500 dark:text-stone-400 font-interface italic">
              {caseData.case_name_full}
            </p>
          )}
        </div>

        {/* Header Strip with Court, Date, and Citations */}
        <section
          aria-label="Case Metadata"
          className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 mb-10 transition-colors shadow-2xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-interface">
            <div>
              <span className="text-stone-400 dark:text-stone-500 block uppercase tracking-wider text-[10px] mb-1">
                Court
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                {caseData.court}
              </span>
            </div>

            <div>
              <span className="text-stone-400 dark:text-stone-500 block uppercase tracking-wider text-[10px] mb-1">
                Date Filed
              </span>
              <span className="text-stone-700 dark:text-stone-300 text-sm">
                {caseData.date_filed}
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-stone-400 dark:text-stone-500 block uppercase tracking-wider text-[10px] mb-1">
                  Official Citations
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-code">
                  {caseData.citations?.map((cite, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-xs text-stone-800 dark:text-stone-200"
                    >
                      {cite}
                    </span>
                  ))}
                  {caseData.citation_count !== undefined && (
                    <span className="text-xs font-interface text-stone-500 dark:text-stone-400 font-medium ml-1">
                      (Cited by {caseData.citation_count})
                    </span>
                  )}
                </div>
              </div>

              {(caseData.jurisdiction || caseData.status) && (
                <div className="text-right">
                  <span className="text-stone-400 dark:text-stone-500 block uppercase tracking-wider text-[10px] mb-1">
                    Status
                  </span>
                  <span className="text-stone-600 dark:text-stone-300 font-medium">
                    {[caseData.jurisdiction, caseData.status].filter(Boolean).join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Opinion Text: Comfortable Reading Column (~70ch wide, generous line spacing, preserved paragraph breaks) */}
        <article className="opinion-content font-opinion text-stone-800 dark:text-stone-200">
          <div className="opinion-body">
            {paragraphs.map((paragraph, index) => {
              const isJudicialHeader = /^(MR\.\s+)?(CHIEF\s+)?JUSTICE\s+[A-Z\s]+(,\s+JR\.)?\s+delivered/i.test(paragraph) ||
                /^Before\s+[A-Z\s,]+Circuit Judges/i.test(paragraph);

              if (isJudicialHeader) {
                return (
                  <p
                    key={index}
                    className={`font-interface font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wide text-xs sm:text-sm pt-2 pb-4 border-b border-stone-200 dark:border-stone-800 mb-6`}
                  >
                    {paragraph}
                  </p>
                );
              }

              return (
                <p
                  key={index}
                  className={`${fontSizeClass} mb-6 tracking-normal`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Opinion End Marker */}
        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-interface text-stone-500 dark:text-stone-400 no-print">
          <div>
            <span>End of Official Record</span>
            {caseData.citations?.[0] && (
              <> · <span className="font-code">{caseData.citations[0]}</span></>
            )}
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-stone-900 dark:hover:text-stone-200 underline cursor-pointer"
          >
            Back to top ↑
          </button>
        </div>

      </main>
    </div>
  );
};
