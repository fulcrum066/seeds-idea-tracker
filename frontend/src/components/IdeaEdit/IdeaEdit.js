import React, { useState, useEffect } from "react";

const METRICS = [
  { name: "maintainingCompliance", label: "Maintaining Compliance" },
  { name: "reducingCost", label: "Reducing Cost" },
  { name: "reducingRisk", label: "Reducing Risk" },
  { name: "improvingProductivity", label: "Improving Productivity" },
  { name: "improvingProcesses", label: "Improving Processes" },
  { name: "creatingNewRevenueStreams", label: "Creating New Revenue Streams" },
];

const RATING_OPTIONS = ["very high", "high", "medium", "low", "very low"];

function IdeaEdit({ setFormData, initialSeed }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [metrics, setMetrics] = useState({
    maintainingCompliance: "medium",
    reducingCost: "medium",
    reducingRisk: "medium",
    improvingProductivity: "medium",
    improvingProcesses: "medium",
    creatingNewRevenueStreams: "medium",
  });

  useEffect(() => {
    if (initialSeed) {
      setTitle(initialSeed.title || "");
      setDescription(initialSeed.description ?? initialSeed.content ?? "");
      setPriority((initialSeed.priority || "low").toLowerCase());
      setMetrics((prev) => ({
        ...prev,
        maintainingCompliance:
          initialSeed.maintainingCompliance || prev.maintainingCompliance,
        reducingCost: initialSeed.reducingCost || prev.reducingCost,
        reducingRisk: initialSeed.reducingRisk || prev.reducingRisk,
        improvingProductivity:
          initialSeed.improvingProductivity || prev.improvingProductivity,
        improvingProcesses:
          initialSeed.improvingProcesses || prev.improvingProcesses,
        creatingNewRevenueStreams:
          initialSeed.creatingNewRevenueStreams || prev.creatingNewRevenueStreams,
      }));
    }
  }, [initialSeed]);

  // Send data to SeedsHome whenever something changes
  useEffect(() => {
    setFormData({
      title,
      description,
      priority,
      ...metrics,
    });
  }, [title, description, priority, metrics, setFormData]);

  // --- Same styles as before ---
  const containerStyle = {
    position: 'relative',
    display: 'flex',
    border: '1px solid #ccc',
    padding: '10px',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  };

  const halfStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
  };

  const leftHalfStyle = {
    ...halfStyle,
    borderRight: '1px solid #ccc',
    justifyContent: 'center',
  };

  const rightHalfStyle = {
    ...halfStyle,
    justifyContent: 'flex-start',
  };

  const headingStyle = {
    color: 'green',
    margin: 0,
    fontFamily: 'Comic Sans MS',
  };

  const labelStyle = {
    color: 'black',
    marginTop: '12px',
    marginBottom: '8px',
    fontSize: '16px',
    alignSelf: 'flex-start',
  };

  const inputStyle = {
    padding: '8px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  const uploadBoxStyle = {
    border: '2px dashed #aaa',
    borderRadius: '6px',
    padding: '20px',
    width: '100%',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#fff',
  };

  return (
    <div style={containerStyle}>
      <div style={leftHalfStyle}>
        <h2 style={headingStyle}>{initialSeed ? "Edit Idea" : "Create an Idea"}</h2>

        <label style={labelStyle}>{initialSeed ? "Update the Title" : "Give your Seed a Title!"}</label>
        <input
          type="text"
          placeholder="Enter your idea title..."
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={labelStyle}>{initialSeed ? "Update the Description" : "Describe your Seed"}</label>
        <input
          type="text"
          placeholder="Description..."
          style={inputStyle}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px', alignSelf: 'stretch' }}>
          <div style={{ width: '100%' }}>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>Priority:</label>
            <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Metric Data Fields */}
        <div style={{ width: '100%', marginTop: '12px' }}>
          {METRICS.map((metric) => (
            <div key={metric.name} style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{metric.label}</label>
              <select
                style={inputStyle}
                value={metrics[metric.name]}
                onChange={(e) =>
                  setMetrics((prev) => ({ ...prev, [metric.name]: e.target.value }))
                }
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option} value={option} style={{ textTransform: 'capitalize' }}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Right half stays exactly the same */}
      <div style={rightHalfStyle}>
        <h3 style={labelStyle}>Seed Idea Number One</h3>
        <label style={uploadBoxStyle}>
          <input type="file" style={{ display: 'none' }} />
          Click to upload media
        </label>
      </div>
    </div>
  );
}

export default IdeaEdit;