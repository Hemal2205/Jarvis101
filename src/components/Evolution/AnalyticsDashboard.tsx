import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

const AnalyticsDashboard: React.FC = () => {
  const [collab, setCollab] = useState<any>(null);
  const [outcomes, setOutcomes] = useState<any>(null);
  const [consensus, setConsensus] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    fetch('/api/evolution/analytics/collaboration').then(r => r.json()).then(setCollab);
    fetch('/api/evolution/analytics/suggestion_outcomes').then(r => r.json()).then(setOutcomes);
    fetch('/api/evolution/analytics/consensus').then(r => r.json()).then(setConsensus);
    fetch('/api/evolution/analytics/agent_activity').then(r => r.json()).then(setActivity);
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700">Analytics & Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Collaboration per agent */}
        <div>
          <h3 className="font-semibold mb-2">Collaborations per Agent</h3>
          {collab && (
            <Bar
              data={{
                labels: collab.per_agent.map((a: any) => `Agent ${a.agent_id}`),
                datasets: [{ label: 'Collaborations', data: collab.per_agent.map((a: any) => a.count), backgroundColor: '#6366f1' }]
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          )}
        </div>
        {/* Suggestion outcomes over time */}
        <div>
          <h3 className="font-semibold mb-2">Suggestion Outcomes Over Time</h3>
          {outcomes && (
            <Line
              data={{
                labels: Array.from(new Set([...outcomes.applied.map((a: any) => a.date), ...outcomes.rejected.map((r: any) => r.date)])),
                datasets: [
                  { label: 'Applied', data: outcomes.applied.map((a: any) => a.count), borderColor: '#10b981', backgroundColor: '#6ee7b7', fill: false },
                  { label: 'Rejected', data: outcomes.rejected.map((r: any) => r.count), borderColor: '#ef4444', backgroundColor: '#fca5a5', fill: false }
                ]
              }}
              options={{ responsive: true }}
            />
          )}
        </div>
        {/* Consensus status pie chart */}
        <div>
          <h3 className="font-semibold mb-2">Consensus Status</h3>
          {consensus && (
            <Pie
              data={{
                labels: ['Positive', 'Negative', 'None'],
                datasets: [{
                  data: [consensus.positive, consensus.negative, consensus.none],
                  backgroundColor: ['#10b981', '#ef4444', '#a3a3a3']
                }]
              }}
              options={{ responsive: true }}
            />
          )}
        </div>
        {/* Agent activity */}
        <div>
          <h3 className="font-semibold mb-2">Agent Activity</h3>
          {activity && (
            <Bar
              data={{
                labels: activity.messages.map((a: any) => `Agent ${a.agent_id}`),
                datasets: [
                  { label: 'Messages', data: activity.messages.map((a: any) => a.count), backgroundColor: '#6366f1' },
                  { label: 'Votes', data: activity.votes.map((a: any) => a.count), backgroundColor: '#f59e42' },
                  { label: 'Assignments', data: activity.assignments.map((a: any) => a.count), backgroundColor: '#10b981' }
                ]
              }}
              options={{ responsive: true, plugins: { legend: { display: true } } }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 