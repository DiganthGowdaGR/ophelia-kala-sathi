import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, Palette, BarChart3, Lightbulb, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface AgentTask {
  id: string;
  task_type: string;
  input_data: any;
  output_data: any;
  status: string;
  priority: number;
  created_at: string;
  completed_at?: string;
  ai_agents?: {
    agent_type: string;
  };
}

const agents: Agent[] = [
  {
    id: 'brand',
    name: 'Brand Agent',
    role: 'Brand Strategy',
    icon: Brain,
    color: 'purple',
    description: 'Crafts compelling brand stories and maintains brand consistency'
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    role: 'Marketing Strategy',
    icon: TrendingUp,
    color: 'blue',
    description: 'Develops data-driven marketing campaigns and growth strategies'
  },
  {
    id: 'creative',
    name: 'Creative Agent',
    role: 'Content Creation',
    icon: Palette,
    color: 'pink',
    description: 'Generates stunning visuals and engaging content'
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    role: 'Data Intelligence',
    icon: BarChart3,
    color: 'green',
    description: 'Analyzes performance metrics and provides actionable insights'
  },
  {
    id: 'mentor',
    name: 'Mentor Agent',
    role: 'Business Guidance',
    icon: Lightbulb,
    color: 'amber',
    description: 'Offers strategic advice and business mentorship'
  }
];

export default function AiAgentControlPage() {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [coordinatedResponse, setCoordinatedResponse] = useState<any>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the user's ai_agents first
      const { data: agentData, error: agentError } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('artisan_id', user.id);

      if (agentError) throw agentError;
      
      if (!agentData || agentData.length === 0) {
        setTasks([]);
        return;
      }

      const agentIds = agentData.map(a => a.id);

      // Get tasks for these agents
      const { data, error } = await supabase
        .from('agent_tasks')
        .select('*, ai_agents!inner(agent_type)')
        .in('agent_id', agentIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSubmitTask = async () => {
    if (!taskInput.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the agent_id for the selected agent type
      const { data: agentData, error: agentError } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('artisan_id', user.id)
        .eq('agent_type', selectedAgent.id)
        .single();

      if (agentError || !agentData) throw new Error('Agent not found');

      // Call AI multi-agent brain edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'ai-multi-agent-brain',
        {
          body: {
            task: taskInput,
            primaryAgent: selectedAgent.id,
            artisanId: user.id
          }
        }
      );

      if (functionError) throw functionError;

      setCoordinatedResponse(functionData);

      // Insert task record with correct schema
      const { error: insertError } = await supabase
        .from('agent_tasks')
        .insert({
          agent_id: agentData.id,
          task_type: 'general_query',
          input_data: { query: taskInput },
          output_data: functionData,
          status: 'completed',
          priority: 5,
          completed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Reload tasks
      await loadTasks();
      setTaskInput('');
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to process task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700 border-purple-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      pink: 'bg-pink-100 text-pink-700 border-pink-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      amber: 'bg-amber-100 text-amber-700 border-amber-300'
    };
    return colors[color] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/artisan/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Multi-Agent Control Center</h1>
          <p className="text-gray-600 mt-2">Coordinate with 5 specialized AI agents to grow your business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Agent</h2>
              <div className="space-y-3">
                {agents.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedAgent.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? getColorClasses(agent.color)
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-xs mt-1 opacity-80">{agent.role}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task Input & Response */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ask {selectedAgent.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{selectedAgent.description}</p>
              <div className="space-y-4">
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder={`Ask the ${selectedAgent.name} for help...`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <button
                  onClick={handleSubmitTask}
                  disabled={loading || !taskInput.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Task
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Coordinated Response */}
            {coordinatedResponse && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coordinated AI Response</h3>
                <div className="space-y-4">
                  {coordinatedResponse.agents?.map((agentResponse: any, index: number) => {
                    const agent = agents.find(a => a.id === agentResponse.agent);
                    if (!agent) return null;
                    const Icon = agent.icon;
                    return (
                      <div key={index} className={`p-4 rounded-lg border ${getColorClasses(agent.color)}`}>
                        <div className="flex items-center mb-2">
                          <Icon className="h-5 w-5 mr-2" />
                          <span className="font-semibold">{agent.name}</span>
                        </div>
                        <p className="text-sm opacity-90">{agentResponse.response}</p>
                        {agentResponse.actionItems && agentResponse.actionItems.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {agentResponse.actionItems.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs opacity-80 flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks yet. Submit your first task above!</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            {getStatusIcon(task.status)}
                            <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                              {task.ai_agents?.agent_type || 'Unknown'} Agent
                            </span>
                            <span className="ml-auto text-xs text-gray-500">
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{task.input_data?.query || task.task_type}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
