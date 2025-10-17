import { useNavigate } from "react-router-dom";

function Landingpg() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: 'url("/dashboard_images/Background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingLeft: "80px",
   
      }}
    >
      <table style={{ borderSpacing: "80px 20px" }}>
        <tbody>
          <tr>
            {/* Left column */}
            <td>
              <h1
                style={{
                  fontFamily: "'Comic Sans MS'",
                  fontSize: "56px",
                  marginBottom: "10px",
                  color: "#A8E6A3", 
                }}
              >
                Seeds
              </h1>

              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Growing your ideas just got easier
              </h2>

              <p
                style={{
                  fontSize: "18px",
                  maxWidth: "500px",
                  lineHeight: "1.6",
                }}
              >
                The Seeds Idea Tracker is a web application platform aiming to enable higher-ups within a business to create and share new project ideas with other colleagues. It aims to enable them to more easily keep track of these project ideas and compare their business benefits with one another through the use of a metrics system. Additionally, it also aims to enable regular employees to easily add and express their own ideas to these projects ideas like those concerning potential improvements, additions or changes which could be made to them.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  marginTop: "20px",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  backgroundColor: "#A8E6A3",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  
                }}
                
              >
                PLANT A SEED
              </button>
            </td>

            {/* Right column*/}
            <td style={{ paddingLeft: "100px" }}>
              <div>Placeholder</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* below the table */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginTop: "50px",
        }}
      >
        <b
          style={{
            fontSize: "26px",
          }}
        >
          Why Seeds?
        </b>
        <p
          style={{
            marginTop: "10px",
            fontSize: "18px",
            maxWidth: "700px",
            marginInline: "auto",
            lineHeight: "1.6",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
          facilisis, sapien at congue laoreet, lectus ex consequat orci, sed
          dapibus justo purus non elit. Praesent a metus id mi sodales cursus.
        </p>
      </div>
    </div>
  );
}

export default Landingpg;
