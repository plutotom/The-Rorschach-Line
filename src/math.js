// Cosine Interpolation
// Extremely smooth, guaranteed to pass through all nodes, and guaranteed
// never to overshoot the Y bounds of the nodes (unlike Catmull-Rom or cubic).
export function getInterpolatedData(nodes) {
  // Ensure nodes are sorted by age (x)
  const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

  const data = new Array(101).fill(50);

  if (sortedNodes.length === 0) return data;
  if (sortedNodes.length === 1) return data.fill(sortedNodes[0].y);

  for (let age = 0; age <= 100; age++) {
    // Before first node
    if (age <= sortedNodes[0].x) {
      data[age] = sortedNodes[0].y;
      continue;
    }
    // After last node
    if (age >= sortedNodes[sortedNodes.length - 1].x) {
      data[age] = sortedNodes[sortedNodes.length - 1].y;
      continue;
    }

    // Find the segment this age falls into
    let p0, p1;
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      if (age >= sortedNodes[i].x && age <= sortedNodes[i + 1].x) {
        p0 = sortedNodes[i];
        p1 = sortedNodes[i + 1];
        break;
      }
    }

    // Cosine Interpolation math
    const mu = (age - p0.x) / (p1.x - p0.x);
    const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;

    let y = p0.y * (1 - mu2) + p1.y * mu2;
    data[age] = Math.round(y);
  }

  return data;
}
