// AI Profile Optimization Component
import { useState } from 'react';
import { Sparkles, TrendingUp, Award, Target, Lightbulb } from 'lucide-react';
import { getProfileOptimizationSuggestions, generateOptimizedBio } from '@/services/geminiService';

interface ProfileOptimization {
  bioScore: number;
  bioSuggestions: string[];
  skillSuggestions: string[];
  overallScore: number;
  priorityImprovements: string[];
}

export default function AIProfileOptimizer({
  bio = '',
  skills = [],
  yearsExperience = 0,
  portfolioCount = 0,
  onBioGenerated
}: {
  bio?: string;
  skills?: string[];
  yearsExperience?: number;
  portfolioCount?: number;
  onBioGenerated?: (bio: string) => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [optimization, setOptimization] = useState<ProfileOptimization | null>(null);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeProfile() {
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await getProfileOptimizationSuggestions({
        bio,
        skills,
        productCount: portfolioCount,
        rating: 4.5 // Default rating
      });
      
      setOptimization(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze profile');
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateBio() {
    setGeneratingBio(true);
    setError(null);
    
    try {
      const result = await generateOptimizedBio({
        name: 'Artisan',
        skills,
        yearsExperience,
        uniqueValue: skills.length > 0 ? skills[0] : 'artisan crafts'
      });
      
      if (onBioGenerated) {
        onBioGenerated(result);
      }
      
      // Re-analyze with new bio
      setOptimization(prev => prev ? {
        ...prev,
        bioScore: Math.min(prev.bioScore + 20, 100)
      } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate bio');
    } finally {
      setGeneratingBio(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getScoreGradient(score: number) {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-orange-600';
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl shadow-lg p-6 border border-violet-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Profile Optimizer</h3>
            <p className="text-sm text-gray-600">Gemini-powered profile analysis</p>
          </div>
        </div>
        
        <button
          onClick={analyzeProfile}
          disabled={analyzing}
          className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Analyzing...' : 'Analyze Profile'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!optimization && !analyzing && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Profile not analyzed yet</p>
          <p className="text-sm text-gray-500">Get AI-powered suggestions to improve your profile</p>
        </div>
      )}

      {optimization && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-5 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className={`w-6 h-6 ${getScoreColor(optimization.overallScore)}`} />
                <p className={`text-4xl font-bold ${getScoreColor(optimization.overallScore)}`}>
                  {optimization.overallScore}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-2">Overall Score</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(optimization.overallScore)} transition-all`}
                  style={{ width: `${optimization.overallScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Award className={`w-6 h-6 ${getScoreColor(optimization.bioScore)}`} />
                <p className={`text-4xl font-bold ${getScoreColor(optimization.bioScore)}`}>
                  {optimization.bioScore}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-2">Bio Quality</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(optimization.bioScore)} transition-all`}
                  style={{ width: `${optimization.bioScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Priority Improvements */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-gray-900">Priority Improvements</h4>
            </div>
            <ul className="space-y-2">
              {optimization.priorityImprovements.map((improvement, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bio Suggestions */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h4 className="font-bold text-gray-900">Bio Improvements</h4>
              </div>
              <button
                onClick={generateBio}
                disabled={generatingBio}
                className="text-sm bg-violet-600 text-white px-3 py-1 rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
              >
                {generatingBio ? 'Generating...' : 'Generate Bio'}
              </button>
            </div>
            <ul className="space-y-2">
              {optimization.bioSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-violet-600 font-bold mt-1">•</span>
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skill Suggestions */}
          <div className="bg-white rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-fuchsia-600" />
              <h4 className="font-bold text-gray-900">Skill Recommendations</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {optimization.skillSuggestions.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
