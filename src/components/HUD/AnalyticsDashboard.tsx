import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { X } from 'lucide-react';

Chart.register(...registerables);

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [monitorStatus, setMonitorStatus] = useState<any>(null);
  const [evolutionProgress, setEvolutionProgress] = useState<any>(null);
  const [skillsDashboard, setSkillsDashboard] = useState<any>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, monitorRes, evolutionRes, skillsRes] = await Promise.all([
          fetch('/api/analytics/user'),
          fetch('/api/monitor/status'),
          fetch('/api/evolution/progress'),
          fetch('/api/skills/dashboard'),
        ]);
        const [userData, monitorData, evolutionData, skillsData] = await Promise.all([
          userRes.json(), monitorRes.json(), evolutionRes.json(), skillsRes.json()
        ]);
        setUserAnalytics(userData);
        setMonitorStatus(monitorData);
        setEvolutionProgress(evolutionData);
        setSkillsDashboard(skillsData);
      } catch (e) {
        setError('Failed to load analytics data.');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Example chart data (replace with real data mapping)
  const agentCollabData = {
    labels: userAnalytics?.collaboration_labels || ['Agent A', 'Agent B', 'Agent C'],
    datasets: [
      {
        label: 'Collaborations',
        data: userAnalytics?.collaboration_counts || [12, 19, 7],
        backgroundColor: 'rgba(34,211,238,0.7)',
        borderColor: 'rgba(34,211,238,1)',
        borderWidth: 1,
      },
    ],
  };

  const suggestionAdoptionData = {
    labels: ['Accepted', 'Ignored'],
    datasets: [
      {
        data: [userAnalytics?.suggestions_accepted || 0, userAnalytics?.suggestions_ignored || 0],
        backgroundColor: ['#22d3ee', '#64748b'],
        borderWidth: 1,
      },
    ],
  };

  const systemImprovementData = {
    labels: (evolutionProgress?.history || []).map((e: any) => e.timestamp?.slice(0, 10)),
    datasets: [
      {
        label: 'Performance Score',
        data: (evolutionProgress?.history || []).map((e: any) => e.performance_score),
        fill: false,
        borderColor: '#22d3ee',
        tension: 0.1,
      },
    ],
  };

  const skillGrowthData = {
    labels: (skillsDashboard?.skills || []).map((s: any) => s.name),
    datasets: [
      {
        label: 'Mastery Score',
        data: (skillsDashboard?.skills || []).map((s: any) => s.mastery_score),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-cyan-300 focus:outline-none">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-cyan-200 mb-2">Analytics & Insights</h2>
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-cyan-200">Loading analytics...</div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Agent Collaboration Patterns</h3>
              <Bar data={agentCollabData} options={{ plugins: { legend: { display: false } } }} />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Suggestion Adoption Rates</h3>
              <Doughnut data={suggestionAdoptionData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col md:col-span-2">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">System Improvement Trends</h3>
              <Line data={systemImprovementData} options={{ plugins: { legend: { position: 'top' } } }} />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col md:col-span-2">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Skill Growth</h3>
              <Bar data={skillGrowthData} options={{ plugins: { legend: { display: false } } }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 