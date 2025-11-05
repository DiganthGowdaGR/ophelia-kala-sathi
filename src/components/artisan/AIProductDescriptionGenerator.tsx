// AI-Powered Product Description Generator
import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { generateProductDescription } from '@/services/geminiService';

export default function AIProductDescriptionGenerator() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Textiles',
    materials: '',
    techniques: ''
  });
  const [generating, setGenerating] = useState(false);
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateDescription(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setCopied(false);
    
    try {
      const result = await generateProductDescription({
        name: formData.name,
        category: formData.category,
        materials: formData.materials,
        techniques: formData.techniques
      });
      
      setDescription(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate description');
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Description Generator</h3>
          <p className="text-sm text-gray-600">Create compelling product descriptions</p>
        </div>
      </div>

      <form onSubmit={generateDescription} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Handwoven Cotton Scarf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="Textiles">Textiles</option>
              <option value="Pottery">Pottery</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Woodwork">Woodwork</option>
              <option value="Metalwork">Metalwork</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materials
            </label>
            <input
              type="text"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="e.g., 100% organic cotton"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Techniques (Optional)
          </label>
          <input
            type="text"
            value={formData.techniques}
            onChange={(e) => setFormData({ ...formData, techniques: e.target.value })}
            placeholder="e.g., traditional hand-loom weaving"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Generate Description'}</span>
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Make sure VITE_GEMINI_API_KEY is configured
          </p>
        </div>
      )}

      {description && (
        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Generated Description</h4>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
