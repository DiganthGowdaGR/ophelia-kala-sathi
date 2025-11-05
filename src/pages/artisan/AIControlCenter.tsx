// AI Control Center - Main Dashboard for All AI Features
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, TrendingUp, Shield, Sparkles, Zap, BarChart3, Globe, Brain } from 'lucide-react';

export default function AIControlCenter() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [aiStatus, setAiStatus] = useState({ active: 20, processing: 3, healthy: true });

  const aiCategories = [
    {
      id: 'art-intelligence',
      title: 'AI Art Intelligence',
      description: 'Style analysis, quality control, and market research',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      features: 5,
      path: '/dashboard/ai/art-intelligence',
      metrics: { accuracy: '94%', processed: '2.3k', active: true }
    },
    {
      id: 'business-intelligence',
      title: 'Business Intelligence',
      description: 'Supply chain, inventory, risk assessment, and analytics',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      features: 4,
      path: '/dashboard/ai/business-intelligence',
      metrics: { savings: '$12.5k', efficiency: '85%', active: true }
    },
    {
      id: 'creative-heritage',
      title: 'Creative & Heritage',
      description: 'Authentication, preservation, and cultural storytelling',
      icon: Globe,
      color: 'from-amber-500 to-orange-500',
      features: 5,
      path: '/dashboard/ai/creative-heritage',
      metrics: { authenticated: '156', preserved: '89', active: true }
    },
    {
      id: 'automation',
      title: 'Intelligent Automation',
      description: 'Workflow optimization, customer service, and compliance',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      features: 6,
      path: '/dashboard/ai/automation',
      metrics: { automated: '78%', response: '2.3s', active: true }
    }
  ];

  const recentAiActivity = [
    { action: 'Style Analysis', product: 'Ceramic Vase #234', result: 'Contemporary • 92% confidence', time: '2 min ago', status: 'success' },
    { action: 'Quality Control', product: 'Handwoven Textile #189', result: 'Passed QC • 87/100 score', time: '5 min ago', status: 'success' },
    { action: 'Price Optimization', product: 'Silver Jewelry #456', result: 'Suggested $165 (+15%)', time: '8 min ago', status: 'info' },
    { action: 'Market Research', category: 'Home Decor', result: 'High demand detected', time: '12 min ago', status: 'warning' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-indigo-600" />
                AI Control Center
              </h1>
              <p className="text-slate-600 mt-1">Advanced AI-powered business intelligence and automation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active AI Features</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{aiStatus.active}</p>
                <p className="text-xs text-green-600 mt-1">All operational</p>
              </div>
              <Activity className="w-10 h-10 text-indigo-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Processing Now</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{aiStatus.processing}</p>
                <p className="text-xs text-blue-600 mt-1">Real-time analysis</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">AI Accuracy</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">94.2%</p>
                <p className="text-xs text-emerald-600 mt-1">+2.3% this month</p>
              </div>
              <Shield className="w-10 h-10 text-emerald-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Cost Savings</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">$18.4k</p>
                <p className="text-xs text-amber-600 mt-1">This quarter</p>
              </div>
              <Sparkles className="w-10 h-10 text-amber-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* AI Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {aiCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => navigate(category.path)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} bg-opacity-10`}>
                      <Icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">Active</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">{category.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500">{category.features} AI Features</span>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Explore →
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="mt-4 flex gap-4">
                    {Object.entries(category.metrics).filter(([k]) => k !== 'active').map(([key, value]) => (
                      <div key={key} className="flex-1">
                        <p className="text-xs text-slate-500 capitalize">{key}</p>
                        <p className="text-sm font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent AI Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent AI Activity</h3>
          <div className="space-y-3">
            {recentAiActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.product || activity.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-700">{activity.result}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
