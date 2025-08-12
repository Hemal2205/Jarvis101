import React from 'react';
import { SystemPanel } from './SystemPanel';
import MonitoringDashboard from '../Monitoring/MonitoringDashboard';
import { BrainStatus } from './BrainStatus';
import { CommandInterface } from './CommandInterface';

export const HUD: React.FC = () => {
  return (
    <div className="hud-main-content grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      <div className="space-y-8">
        <SystemPanel />
        <BrainStatus />
      </div>
      <div className="space-y-8">
        <MonitoringDashboard />
        <CommandInterface />
      </div>
    </div>
  );
};