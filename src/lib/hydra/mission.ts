import { runCampaign } from "./engine.ts";
import { useHydra } from "./store.ts";

let booting = false;

export async function startMission() {
  const s = useHydra.getState();
  if (booting || s.running || s.runs.length > 0) return;
  booting = true;
  s.setRunning(true);
  s.setProgress(0, 1);
  try {
    const result = await runCampaign(
      "smoke",
      (done, total, cell) => {
        s.setProgress(done, total);
        if (done % 6 === 0 || done === total) s.pushStream(cell);
      },
      undefined,
      s.fixtures ?? {},
      s.runs[0],
    );
    s.addRun(result);
  } catch {
    /* fail closed */
  } finally {
    s.setRunning(false);
    booting = false;
  }
}
