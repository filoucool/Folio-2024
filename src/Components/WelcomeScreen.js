function WelcomeScreen({ onStart }) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Welcome to My Portfolio!</h1>
          <button onClick={onStart} style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer' }}>Enter</button>
        </div>
      </div>
    );
  }

  export default WelcomeScreen