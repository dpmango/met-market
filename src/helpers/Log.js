export function ProfilerLog(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  console.log('PROFILER::', {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  });
}

let lastTime = new Date().getTime();

export const PerformanceLog = (DEV_perf, name) => {
  const DEV_perf_end = performance.now();
  console.log(
    `PERF :: ${name} :: ${(DEV_perf_end - DEV_perf).toFixed(2)} ms :: fromstart ${(
      new Date().getTime() - lastTime
    ).toFixed(2)} ms`
  );
};
