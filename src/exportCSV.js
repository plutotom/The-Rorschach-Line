/**
 * Walks from fromIndex in direction step (-1 or +1) until the value changes.
 * Returns the sign of the direction: 1 (up), -1 (down), or 0 if we hit the end with no change.
 * For step -1 (looking back): direction of segment from found index to fromIndex (past → present).
 * For step +1 (looking forward): direction of segment from fromIndex to found index (present → future).
 */
function getDirection(data, fromIndex, step) {
  const curr = data[fromIndex];
  let i = fromIndex + step;
  while (i >= 0 && i < data.length && data[i] === curr) {
    i += step;
  }
  if (i < 0 || i >= data.length) return 0;
  const otherVal = data[i];
  const direction = step === -1 ? curr - otherVal : otherVal - curr;
  if (direction > 0) return 1;
  if (direction < 0) return -1;
  return 0;
}

/**
 * Detects turns in the happiness curve: where the line changes direction.
 * Looks through flat segments to get the last real direction before/after.
 * Returns a map of age -> "turned_up" | "turned_down" | "flat".
 * turned_down = was going up, now going down (peak); marked at last index of any flat.
 * turned_up = was going down, now going up (valley), OR flat then up; marked at last index of any flat.
 * flat = start of a plateau (run of length >= 2); marked at first index of the run.
 */
export function getTurns(data) {
  const turns = new Map();
  if (!data || data.length < 3) return turns;

  for (let age = 1; age < data.length - 1; age++) {
    const prevDir = getDirection(data, age, -1);
    const nextDir = getDirection(data, age, 1);
    const atEndOfFlat = data[age + 1] !== data[age];
    const wasFlat = data[age - 1] === data[age];

    if (prevDir > 0 && nextDir < 0) {
      if (atEndOfFlat) {
        turns.set(age, "turned_down");
      }
    } else if (prevDir < 0 && nextDir > 0) {
      if (atEndOfFlat) {
        turns.set(age, "turned_up");
      }
    } else if (wasFlat && atEndOfFlat && nextDir > 0) {
      // Flat then up: mark turned_up when the line leaves a plateau and starts rising
      turns.set(age, "turned_up");
    } else if (wasFlat && atEndOfFlat && nextDir < 0) {
      // Flat then down: mark turned_down when the line leaves a plateau and starts falling
      turns.set(age, "turned_down");
    }
  }

  // Mark "flat" at the first index of each flat run (length >= 2). Skip if whole array is one plateau.
  let i = 0;
  while (i < data.length) {
    const runVal = data[i];
    let end = i;
    while (end + 1 < data.length && data[end + 1] === runVal) end++;
    const runLength = end - i + 1;
    if (runLength >= 2 && (i > 0 || end < data.length - 1)) {
      turns.set(i, "flat");
    }
    i = end + 1;
  }

  return turns;
}

/**
 * Single export for all graph types. Data is always age-indexed happiness [0..100].
 * CSV includes Age, Happiness, and Turn (turned_up | turned_down | flat, or empty).
 */
export function exportToCSV(data) {
  const turns = getTurns(data);
  const header = "Age,Happiness,Turn\n";
  const csvContent = data
    .map((happiness, age) => {
      const turn = turns.get(age) ?? "";
      return `${age},${happiness},${turn}`;
    })
    .join("\n");
  const fullContent = header + csvContent;

  const blob = new Blob([fullContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "happiness_timeline.csv");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
