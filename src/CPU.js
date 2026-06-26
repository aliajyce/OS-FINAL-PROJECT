import React, { useState } from 'react';
import './CPU.css';

const ALGORITHMS = [
  { value: '', label: 'Select Algorithm' },
  { value: 'FCFS', label: 'FCFS' },
  { value: 'PREEMPTIVE_SJF', label: 'Preemptive Shortest Job First' },
  { value: 'NON_PREEMPTIVE_SJF', label: 'Non-Preemptive Shortest Job First' },
  { value: 'PREEMPTIVE_PRIORITY', label: 'Preemptive Priority' },
  { value: 'NON_PREEMPTIVE_PRIORITY', label: 'Non-Preemptive Priority' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
];

const NEEDS = {
  FCFS:                   { burst: true, arrival: true, priority: false, quantum: false },
  PREEMPTIVE_SJF:        { burst: true, arrival: true, priority: false, quantum: false },
  NON_PREEMPTIVE_SJF:    { burst: true, arrival: true, priority: false, quantum: false },
  PREEMPTIVE_PRIORITY:   { burst: true, arrival: true, priority: true,  quantum: false },
  NON_PREEMPTIVE_PRIORITY:{ burst: true, arrival: true, priority: true, quantum: false },
  ROUND_ROBIN:           { burst: true, arrival: true, priority: false, quantum: true  },
};

// ── Scheduling Algorithms ──────────────────────────────────────────────────

function runFCFS(processes) {
  const procs = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  const gantt = [];
  procs.forEach(p => {
    if (time < p.arrival) time = p.arrival;
    gantt.push({ pid: p.id, start: time, end: time + p.burst });
    p.start = time;
    p.finish = time + p.burst;
    p.wait = p.start - p.arrival;
    p.turnaround = p.finish - p.arrival;
    time += p.burst;
  });
  return { procs, gantt };
}

function runNonPreemptiveSJF(processes) {
  const procs = processes.map(p => ({ ...p }));
  let time = 0, done = 0, gantt = [];
  const completed = new Array(procs.length).fill(false);
  while (done < procs.length) {
    const available = procs.filter((p, i) => !completed[i] && p.arrival <= time);
    if (!available.length) { time++; continue; }
    available.sort((a, b) => a.burst - b.burst);
    const p = available[0];
    const idx = procs.indexOf(p);
    gantt.push({ pid: p.id, start: time, end: time + p.burst });
    p.start = time;
    p.finish = time + p.burst;
    p.wait = p.start - p.arrival;
    p.turnaround = p.finish - p.arrival;
    time += p.burst;
    completed[idx] = true;
    done++;
  }
  return { procs, gantt };
}

function runPreemptiveSJF(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burst, finish: 0, start: -1 }));
  let time = 0, done = 0, gantt = [], last = null;
  const totalProcesses = procs.length;
  
  while (done < totalProcesses) {
    const available = procs.filter(p => p.remaining > 0 && p.arrival <= time);
    if (!available.length) { time++; continue; }
    available.sort((a, b) => a.remaining - b.remaining);
    const p = available[0];
    
    if (p.start === -1) p.start = time;
    
    if (!last || last.pid !== p.id) {
      gantt.push({ pid: p.id, start: time, end: time + 1 });
      last = gantt[gantt.length - 1];
    } else {
      last.end++;
    }
    
    p.remaining--;
    time++;
    
    if (p.remaining === 0) {
      p.finish = time;
      p.wait = p.finish - p.arrival - p.burst;
      p.turnaround = p.finish - p.arrival;
      done++;
    }
  }
  return { procs, gantt };
}

function runNonPreemptivePriority(processes) {
  const procs = processes.map(p => ({ ...p }));
  let time = 0, done = 0, gantt = [];
  const completed = new Array(procs.length).fill(false);
  while (done < procs.length) {
    const available = procs.filter((p, i) => !completed[i] && p.arrival <= time);
    if (!available.length) { time++; continue; }
    available.sort((a, b) => a.priority - b.priority);
    const p = available[0];
    const idx = procs.indexOf(p);
    gantt.push({ pid: p.id, start: time, end: time + p.burst });
    p.start = time;
    p.finish = time + p.burst;
    p.wait = p.start - p.arrival;
    p.turnaround = p.finish - p.arrival;
    time += p.burst;
    completed[idx] = true;
    done++;
  }
  return { procs, gantt };
}

function runPreemptivePriority(processes) {
  const procs = processes.map(p => ({ ...p, remaining: p.burst, finish: 0, start: -1 }));
  let time = 0, done = 0, gantt = [], last = null;
  const totalProcesses = procs.length;
  
  while (done < totalProcesses) {
    const available = procs.filter(p => p.remaining > 0 && p.arrival <= time);
    if (!available.length) { time++; continue; }
    available.sort((a, b) => a.priority - b.priority);
    const p = available[0];
    
    if (p.start === -1) p.start = time;
    
    if (!last || last.pid !== p.id) {
      gantt.push({ pid: p.id, start: time, end: time + 1 });
      last = gantt[gantt.length - 1];
    } else {
      last.end++;
    }
    
    p.remaining--;
    time++;
    
    if (p.remaining === 0) {
      p.finish = time;
      p.wait = p.finish - p.arrival - p.burst;
      p.turnaround = p.finish - p.arrival;
      done++;
    }
  }
  return { procs, gantt };
}

function runRoundRobin(processes, quantum) {
  const procs = processes.map(p => ({ ...p, remaining: p.burst, finish: 0, start: -1 }));
  const gantt = [];
  const queue = [];
  let time = 0;
  let done = 0;
  
  // Track who has entered the queue to prevent duplicate pushes
  const enqueued = new Set();

  // Helper to push newly arrived processes into ready queue
  const checkArrivals = (currentTime) => {
    procs.forEach(p => {
      if (p.arrival <= currentTime && p.remaining > 0 && !enqueued.has(p.id)) {
        queue.push(p);
        enqueued.add(p.id);
      }
    });
  };

  // Find initial arrivals at time 0 (or whatever the earliest arrival time is)
  const minArrival = Math.min(...procs.map(p => p.arrival));
  time = Math.max(0, minArrival);
  checkArrivals(time);

  let safety = 0;
  while (done < procs.length && safety++ < 10000) {
    if (queue.length === 0) {
      time++;
      checkArrivals(time);
      continue;
    }

    const p = queue.shift();
    if (p.start === -1) p.start = time;

    const run = Math.min(quantum, p.remaining);
    gantt.push({ pid: p.id, start: time, end: time + run });
    
    // Increment time incrementally step-by-step to capture intermediate arrivals smoothly
    for (let i = 0; i < run; i++) {
      time++;
      checkArrivals(time);
    }
    
    p.remaining -= run;

    if (p.remaining > 0) {
      // Put back to the rear of ready queue after other intermediate arrivals have landed
      queue.push(p);
    } else {
      p.finish = time;
      p.wait = p.finish - p.arrival - p.burst;
      p.turnaround = p.finish - p.arrival;
      done++;
    }
  }
  return { procs, gantt };
}

function runAlgorithm(alg, processes, quantum) {
  switch (alg) {
    case 'FCFS':                   return runFCFS(processes);
    case 'PREEMPTIVE_SJF':         return runPreemptiveSJF(processes);
    case 'NON_PREEMPTIVE_SJF':     return runNonPreemptiveSJF(processes);
    case 'PREEMPTIVE_PRIORITY':    return runPreemptivePriority(processes);
    case 'NON_PREEMPTIVE_PRIORITY':return runNonPreemptivePriority(processes);
    case 'ROUND_ROBIN':            return runRoundRobin(processes, quantum);
    default: return null;
  }
}

// ── GanttChart ─────────────────────────────────────────────────────────────

const COLORS = ['#4A90D9','#E67E22','#2ECC71','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#3498DB'];

function GanttChart({ gantt }) {
  if (!gantt || gantt.length === 0) return null;
  const totalTime = gantt[gantt.length - 1].end;
  return (
    <div className="cpu-gantt-wrapper">
      <div className="cpu-gantt-bar">
        {gantt.map((seg, i) => {
          const width = ((seg.end - seg.start) / totalTime) * 100;
          const colorIdx = (parseInt(seg.pid.replace(/\D/g,''), 10) - 1) % COLORS.length;
          return (
            <div
              key={i}
              className="cpu-gantt-seg"
              style={{ width: `${width}%`, background: COLORS[colorIdx] }}
              title={`P${seg.pid}: ${seg.start}–${seg.end}`}
            >
              <span>P{seg.pid}</span>
            </div>
          );
        })}
      </div>
      <div className="cpu-gantt-labels">
        <span>0</span>
        <span>{totalTime}</span>
      </div>
    </div>
  );
}

// ── ResultPage ─────────────────────────────────────────────────────────────

function ResultPage({ result, algorithm, quantum, setCurrentPage }) {
  const [showComputation, setShowComputation] = useState(false);
  if (!result) return null;

  const { procs, gantt } = result;
  const totalBurst = procs.reduce((s, p) => s + p.burst, 0);
  const lastFinish = procs.reduce((m, p) => Math.max(m, p.finish || 0), 0);
  const firstArrival = procs.reduce((m, p) => Math.min(m, p.arrival), Infinity);
  const totalExec = lastFinish - firstArrival;
  const avgWait = (procs.reduce((s, p) => s + (p.wait || 0), 0) / procs.length).toFixed(2);
  const avgTA   = (procs.reduce((s, p) => s + (p.turnaround || 0), 0) / procs.length).toFixed(2);
  const cpuUtil = totalExec > 0 ? ((totalBurst / totalExec) * 100).toFixed(1) : 0;

  return (
    <div className="cpu-page cpu-result-page">
      <h1 className="cpu-title">CPU SIMULATION RESULTS</h1>

      <div className="cpu-section-label">GANTT CHART:</div>
      {algorithm === 'ROUND_ROBIN' && (
        <div className="cpu-tq-label">Time Quantum = {quantum}</div>
      )}
      <GanttChart gantt={gantt} />

      <div className="cpu-queue-box">PROCESSES EXECUTION SEQUENCE: {procs.map(p => `P${p.id}`).join(' → ')}</div>
      <div className="cpu-queue-box">WAITING QUEUE: {procs.filter(p => (p.wait||0) > 0).map(p => `P${p.id}`).join(', ') || 'None'}</div>

      <div className="cpu-stats-grid">
        <div className="cpu-stat">
          <span className="cpu-stat-label">AVERAGE WAITING TIME:</span>
          <span className="cpu-stat-value">{avgWait}MS</span>
        </div>
        <div className="cpu-stat">
          <span className="cpu-stat-label">AVERAGE TURNAROUND TIME:</span>
          <span className="cpu-stat-value">{avgTA}MS</span>
        </div>
        <div className="cpu-stat">
          <span className="cpu-stat-label">TOTAL EXECUTION TIME:</span>
          <span className="cpu-stat-value">{totalExec}MS</span>
        </div>
        <div className="cpu-stat">
          <span className="cpu-stat-label">CPU UTILIZATION:</span>
          <span className="cpu-stat-value">{cpuUtil}%</span>
        </div>
      </div>

      <button className="cpu-show-comp-btn" onClick={() => setShowComputation(v => !v)}>
        {showComputation ? 'HIDE COMPUTATION' : 'SHOW COMPUTATION'}
      </button>

      {showComputation && (
        <div className="cpu-computation">
          <div className="cpu-comp-title">COMPUTATION METRICS</div>
          <div className="cpu-comp-cols">
            <div className="cpu-comp-col">
              <div className="cpu-comp-head">Waiting Time (WT = TAT - Burst):</div>
              {procs.map(p => (
                <div key={p.id} className="cpu-comp-row">
                  P{p.id} : {p.finish} (Finish) - {p.arrival} (Arrival) - {p.burst} (Burst) = {p.wait}ms
                </div>
              ))}
            </div>
            <div className="cpu-comp-col">
              <div className="cpu-comp-head">Turnaround Time (TAT = Finish - Arrival):</div>
              {procs.map(p => (
                <div key={p.id} className="cpu-comp-row">
                  P{p.id} : {p.finish} (Finish) - {p.arrival} (Arrival) = {p.turnaround}ms
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="cpu-nav-row">
        <button className="cpu-nav-btn" onClick={() => setCurrentPage('CPU')}>&#60; Back to Config</button>
      </div>
    </div>
  );
}

// ── Main CPUPage ────────────────────────────────────────────────────────────

export default function CPUPage({ setCurrentPage }) {
  const [algorithm, setAlgorithm] = useState('');
  const [numProcesses, setNumProcesses] = useState('');
  const [burstTimes, setBurstTimes] = useState('');
  const [arrivalTimes, setArrivalTimes] = useState('');
  const [priorities, setPriorities] = useState('');
  const [quantumTime, setQuantumTime] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const needs = algorithm ? NEEDS[algorithm] : { burst: false, arrival: false, priority: false, quantum: false };

  // REMOVED .slice(0, n) so we can detect if the user typed too many numbers
  function parseList(str) {
    if (!str.trim()) return [];
    return str.trim().split(/[\s,]+/).map(Number);
  }

  function handleSimulate() {
    setError('');
    if (!algorithm) { setError('Please select an algorithm.'); return; }
    const n = parseInt(numProcesses, 10);
    if (!n || n < 1 || n > 8) { setError('Select number of processes (1–8).'); return; }

    const bursts   = parseList(burstTimes);
    const arrivals = parseList(arrivalTimes);
    const pris     = needs.priority ? parseList(priorities) : [];
    const qt       = needs.quantum  ? parseInt(quantumTime, 10) : 1;

    // UPDATED VALIDATION: Checks for both too few AND too many inputs
    if (needs.burst) {
      if (bursts.length < n) { setError(`Enter ${n} burst time(s).`); return; }
      if (bursts.length > n) { setError(`Too many inputs: Enter exactly ${n} burst time(s).`); return; }
    }
    
    if (needs.arrival) {
      if (arrivals.length < n) { setError(`Enter ${n} arrival time(s).`); return; }
      if (arrivals.length > n) { setError(`Too many inputs: Enter exactly ${n} arrival time(s).`); return; }
    }
    
    if (needs.priority) {
      if (pris.length < n) { setError(`Enter ${n} priority value(s).`); return; }
      if (pris.length > n) { setError(`Too many inputs: Enter exactly ${n} priority value(s).`); return; }
    }
    
    if (needs.quantum  && (!qt || qt < 1)) { 
      setError('Enter a valid quantum time.'); 
      return; 
    }

    const processes = Array.from({ length: n }, (_, i) => ({
      id:       String(i + 1),
      burst:    bursts[i]   || 0,
      arrival:  arrivals[i] || 0,
      priority: pris[i]     || 0,
    }));

    const res = runAlgorithm(algorithm, processes, qt);
    setResult(res);
    setShowResult(true);
  }

  if (showResult && result) {
    return (
      <ResultPage
        result={result}
        algorithm={algorithm}
        quantum={parseInt(quantumTime, 10)}
        setCurrentPage={(page) => {
          if (page === 'CPU') { setShowResult(false); setResult(null); }
          else setCurrentPage(page);
        }}
      />
    );
  }

  return (
    <div className="cpu-page">
      <h1 className="cpu-title">CPU</h1>

      {/* Algorithm */}
      <div className="cpu-field-group">
        <label className="cpu-field-label">
          ALGORITHM:
          <span className="cpu-badge">AUTO</span>
        </label>
        <select
          className="cpu-select"
          value={algorithm}
          onChange={e => { setAlgorithm(e.target.value); setError(''); }}
        >
          {ALGORITHMS.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Number of Processes */}
      <div className="cpu-field-group">
        <label className="cpu-field-label text-capitalize">
          Number Of Process
        </label>
        <select
          className="cpu-select text-center"
          value={numProcesses}
          onChange={e => setNumProcesses(e.target.value)}
          disabled={!algorithm}
        >
          <option value="">Select number from 1–8</option>
          {[1,2,3,4,5,6,7,8].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Burst Times */}
      <div className={`cpu-field-group ${!needs.burst ? 'cpu-field-disabled' : ''}`}>
        <label className="cpu-field-label">
          BURST TIME/S:
          <span className="cpu-toggle-badge">
            <span className="cpu-toggle-inactive">S</span>
            <span className="cpu-toggle-active">MS</span>
          </span>
        </label>
        <input
          className="cpu-input"
          type="text"
          placeholder="e.g., 4, 2, 7, 1..."
          value={burstTimes}
          onChange={e => setBurstTimes(e.target.value)}
          disabled={!needs.burst}
        />
      </div>

      {/* Arrival Times */}
      <div className={`cpu-field-group ${!needs.arrival ? 'cpu-field-disabled' : ''}`}>
        <label className="cpu-field-label">
          ARRIVAL TIME/S:
          <span className="cpu-badge">DEFAULT</span>
        </label>
        <input
          className="cpu-input"
          type="text"
          placeholder="e.g., 0, 1, 2, 3..."
          value={arrivalTimes}
          onChange={e => setArrivalTimes(e.target.value)}
          disabled={!needs.arrival}
        />
      </div>

      {/* Priority */}
      <div className={`cpu-field-group ${!needs.priority ? 'cpu-field-disabled' : ''}`}>
        <label className="cpu-field-label">
          PRIORITY:
          <span className="cpu-badge">DEFAULT</span>
        </label>
        <input
          className="cpu-input"
          type="text"
          placeholder="e.g., 1, 2, 3, 4..."
          value={priorities}
          onChange={e => setPriorities(e.target.value)}
          disabled={!needs.priority}
        />
      </div>

      {/* Quantum Time */}
      <div className={`cpu-field-group ${!needs.quantum ? 'cpu-field-disabled' : ''}`}>
        <label className="cpu-field-label">
          QUANTUM TIME:
        </label>
        <input
          className="cpu-input"
          type="number"
          min="1"
          value={quantumTime}
          onChange={e => setQuantumTime(e.target.value)}
          disabled={!needs.quantum}
        />
      </div>

      {error && <div className="cpu-error">{error}</div>}

      <div className="cpu-nav-row">
        <button className="cpu-simulate-text-btn" onClick={handleSimulate}>
          Start Simulation
        </button>
        <button className="cpu-back-pill-btn" onClick={() => setCurrentPage('second')}>
          Back
        </button>
      </div>
    </div>
  );
}