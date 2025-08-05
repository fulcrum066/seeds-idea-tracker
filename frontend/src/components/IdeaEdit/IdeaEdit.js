import React, { useState } from "react";

function IdeaEdit() {
  const [visible, setVisible] = useState(true);



  const containerStyle = {
    position: 'relative',
    display: 'flex',
    border: '1px solid #ccc',
    padding: '10px',
    width: '600px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  };

  const exit = {
    position: 'absolute',
    top: '8px',
    right: '12px',
    fontSize: '20px',
    color: '#888',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
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
    border: '1px #ccc',
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

  if (!visible) {
    return null;
  }

  return (

      <div style={containerStyle}>
        <button
          style={exit}
          onClick={() => setVisible(false)}
          aria-label="Close"
        >
          ×
        </button>
        <div style={leftHalfStyle}>
          <h2 style={headingStyle}>Create an Idea</h2>
          <label htmlFor="seedTitle" style={labelStyle}>
            Give your Seed a Title!
          </label>
          <input
            type="text"
            id="seedTitle"
            name="seedTitle"
            placeholder="Enter your idea title..."
            style={inputStyle}
          />
           <label htmlFor="seedTitle" style={labelStyle}>
            Describe your Seed
          </label>
          <input
            type="text"
            id="seedTitle"
            name="seedTitle"
            placeholder="Description..."
            style={inputStyle}
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
    <label style={{ ...labelStyle, marginBottom: '4px' }}>Select Project:</label>
    <select style={inputStyle} defaultValue="Project 1">
      <option value="Project 1">Project 1</option>
      <option value="Project 2">Project 2</option>
      <option value="Project 3">Project 3</option>
    </select>
  </div>
</div>

            <label htmlFor="seedTitle" style={labelStyle}>
            Metric Data 1
          </label>
          <input
            type="text"
            id="seedTitle"
            name="seedTitle"
            placeholder="Enter metric data 1..."
            style={inputStyle}
          />
            <label htmlFor="seedTitle" style={labelStyle}>
            Metric Data 2
          </label>
          <input
            type="text"
            id="seedTitle"
            name="seedTitle"
            placeholder="Enter metric data 2..."
            style={inputStyle}
          />
            <label htmlFor="seedTitle" style={labelStyle}>
            Metric Data 3
          </label>
          <input
            type="text"
            id="seedTitle"
            name="seedTitle"
            placeholder="Enter metric data 3..."
            style={inputStyle}
          />
          
           
        </div>
      
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
