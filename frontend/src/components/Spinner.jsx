// import React from 'react';
// import styled, { keyframes } from 'styled-components';

// // Keyframe for spinner rotation
// const rotate = keyframes`
//   to {
//     transform: rotate(1turn);
//   }
// `;

// // Styled spinner
// const StyledSpinner = styled.div`
//   margin: 4.8rem auto;

//   width: 6.4rem;
//   aspect-ratio: 1;
//   border-radius: 50%;
//   background: radial-gradient(farthest-side, #1a237e 94%, #0000)
//       top/10px 10px no-repeat,
//     conic-gradient(#0000 30%, #4688c7);
//   -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 10px), #000 0);
//   animation: ${rotate} 1.5s infinite linear;
// `;

// function Spinner() {
//   return (
//     <div className='loadingSpinnerContainer'>
//       <StyledSpinner />
//     </div>
//   );
// }

// export default Spinner;

import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframe for spinner rotation
const rotate = keyframes`
  to {
    transform: rotate(1turn);
  }
`;

// Styled spinner
const StyledSpinner = styled.div`
  margin: 4.8rem auto;
  width: 6.4rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(farthest-side, #1a237e 94%, #0000)
      top/10px 10px no-repeat,
    conic-gradient(#0000 30%, #4688c7);
  -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 10px), #000 0);
  animation: ${rotate} 1.5s infinite linear;
`;

// Fullscreen container for overlay mode
const FullscreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
`;

// Standard container for regular inline display
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * Spinner component that can be displayed inline or as a fullscreen overlay
 * @param {boolean} fullscreen - Whether to display as fullscreen overlay
 */
function Spinner({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <FullscreenContainer>
        <StyledSpinner />
      </FullscreenContainer>
    );
  }

  return (
    <SpinnerContainer className='loadingSpinnerContainer'>
      <StyledSpinner />
    </SpinnerContainer>
  );
}

export default Spinner;