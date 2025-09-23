import React, { useState, useEffect } from "react";

function BoardCreate({ setFormData, user }) {
  const [projectName, setProjectName] = useState("");

  const LABELS = [
    "Estimated Increase in Revenue",
    "Maintaining Compliance",
    "Reducing Cost",
    "Reducing Risk",
    "Improving Productivity",
    "Improving Processes",
    "Creating new Revenue Streams",
  ];

  const DEFAULT_WEIGHTS = [15, 15, 14, 14, 14, 14, 14];

  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  //helpers
  const clampInt = (v, lo = 0, hi = 100) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return lo;
    return Math.max(lo, Math.min(hi, Math.round(n)));
  };

  /**
   * Adjust only when the new total would exceed 100.
   * If over, subtract the excess from the single highest other weight first;
   * if that's not enough, continue with the next highest, etc.
   */
  const setWeightWithCap = (index, newValue) => {
    let target = clampInt(newValue, 0, 100);

    const current = [...weights];
    const sumOthers = current.reduce((a, b, i) => (i === index ? a : a + b), 0);
    const proposedTotal = sumOthers + target;

    //if we are not exceeding 100, just set it and keep others as is
    if (proposedTotal <= 100) {
      current[index] = target;
      setWeights(current);
      return;
    }

    //we are exceeding 100 figure out how much to shave
    let over = proposedTotal - 100;

    const otherIndices = Array.from({ length: 7 }, (_, i) => i)
      .filter((i) => i !== index)
      .sort((a, b) => current[b] - current[a]); // highest first

    for (const i of otherIndices) {
      if (over <= 0) break;
      const take = Math.min(over, current[i]);
      current[i] -= take;
      over -= take;
    }

    // If we STILL have over (others were all zeros), reduce the target itself.
    if (over > 0) {
      target = Math.max(0, target - over);
      over = 0;
    }

    current[index] = target;

    // Final safety clamp (keep ints, 0..100)
    for (let i = 0; i < current.length; i++) {
      current[i] = clampInt(current[i], 0, 100);
    }

    setWeights(current);
  };

  // Push data up when anything changes
  useEffect(() => {
    setFormData({
      projectName,
      weight1: weights[0],
      weight2: weights[1],
      weight3: weights[2],
      weight4: weights[3],
      weight5: weights[4],
      weight6: weights[5],
      weight7: weights[6],
    });
  }, [projectName, weights, setFormData]);

  const containerStyle = {
    position: "relative",
    display: "flex",
    border: "1px solid #ccc",
    padding: "10px",
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  };

  const headingStyle = {
    color: "green",
    margin: 0,
    fontFamily: "Comic Sans MS",
  };

  const labelStyle = {
    color: "black",
    marginTop: "12px",
    marginBottom: "8px",
    fontSize: "16px",
    alignSelf: "flex-start",
  };

  const inputStyle = {
    padding: "8px",
    width: "100%",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  };

  const rowStyle = {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 120px",
    gap: "12px",
    alignItems: "center",
  };

  const summaryStyle = {
    marginTop: 12,
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#333",
  };

  const total = weights.reduce((a, b) => a + b, 0);

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Create a Project Board</h2>

      <label style={labelStyle}>Give your Project Board a Title!</label>
      <input
        type="text"
        placeholder="Enter name of project board..."
        style={inputStyle}
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      {LABELS.map((label, idx) => (
        <div key={label} style={{ width: "100%" }}>
          <label style={labelStyle}>{label}</label>
          <div style={rowStyle}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={weights[idx]}
              onChange={(e) => setWeightWithCap(idx, e.target.value)}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                style={{ ...inputStyle, width: "70px" }}
                value={weights[idx]}
                onChange={(e) => setWeightWithCap(idx, e.target.value)}
              />
              <span>%</span>
            </div>
          </div>
        </div>
      ))}

      <div style={summaryStyle}>
        Total: <b>{total}</b>% / 100%
      </div>
    </div>
  );
}

export default BoardCreate;
