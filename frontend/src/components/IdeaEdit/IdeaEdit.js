import React, { useState, useEffect } from "react";

function IdeaEdit({ setFormData, user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [metric1, setMetric1] = useState("");
  const [metric2, setMetric2] = useState("");
  const [metric3, setMetric3] = useState("");
  const [metric4, setMetric4] = useState("");
  const [metric5, setMetric5] = useState("");
  const [metric6, setMetric6] = useState("");
  const [metric7, setMetric7] = useState("");
  const [metric8, setMetric8] = useState("");

  // Send data to SeedsHome whenever something changes
  useEffect(() => {
    setFormData({
      title,
      description,
      priority,
      metric1,
      metric2,
      metric3,
      metric4,
      metric5,
      metric6,
      metric7,
      metric8

    });
  }, [title, description, priority, metric1, metric2, metric3, metric4, metric5, metric6, metric7, metric8, setFormData]);

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
        <h2 style={headingStyle}>Create an Idea</h2>

        <label style={labelStyle}>Give your Seed a Title!</label>
        <input
          type="text"
          placeholder="Enter your idea title..."
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label style={labelStyle}>Describe your Seed</label>
        <input
          type="text"
          placeholder="Description..."
          style={inputStyle}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px', alignSelf: 'flex-start' }}>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            Add Label
          </button>

          <div>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>Priority:</label>
            <select style={inputStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* Metric Data Fields */}
        <label style={labelStyle}>Estimated Increase in Revenue</label>
        <input
          type="text"
          placeholder="Enter estimated increase in revenue..."
          style={inputStyle}
          value={metric1}
          onChange={(e) => setMetric1(e.target.value)}
        />

        <label style={labelStyle}>Cost of Implementation</label>
        <input
          type="text"
          placeholder="Enter cost of implementation..."
          style={inputStyle}
          value={metric2}
          onChange={(e) => setMetric2(e.target.value)}
        />

        <label style={labelStyle}>Maintaining Compliance</label>
        <input
          type="text"
          placeholder="Enter metric data 3..."
          style={inputStyle}
          value={metric3}
          onChange={(e) => setMetric3(e.target.value)}
        />

        <label style={labelStyle}>Reducing Cost</label>
        <input
          type="text"
          placeholder="Enter metric data 4..."
          style={inputStyle}
          value={metric4}
          onChange={(e) => setMetric4(e.target.value)}
        />

        <label style={labelStyle}>Reducing Risk</label>
        <input
          type="text"
          placeholder="Enter metric data 5..."
          style={inputStyle}
          value={metric5}
          onChange={(e) => setMetric5(e.target.value)}
        />

        <label style={labelStyle}>Improving Productivity</label>
        <input
          type="text"
          placeholder="Enter metric data 6..."
          style={inputStyle}
          value={metric6}
          onChange={(e) => setMetric6(e.target.value)}
        />

        <label style={labelStyle}>Improving Processes</label>
        <input
          type="text"
          placeholder="Enter metric data 7..."
          style={inputStyle}
          value={metric7}
          onChange={(e) => setMetric7(e.target.value)}
        />

        <label style={labelStyle}>Creating new Revenue Streams</label>
        <input
          type="text"
          placeholder="Enter metric data 8..."
          style={inputStyle}
          value={metric8}
          onChange={(e) => setMetric8(e.target.value)}
        />
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