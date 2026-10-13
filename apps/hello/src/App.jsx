const mainAppUrl = import.meta.env.VITE_APP_MAIN_URL || 'http://lvh.me:5173';

function App() {
    return (
        <main className="page-shell">
            <section className="hello-card">
                <span className="eyebrow">hello.chlktheo.com</span>
                <h1>Hello, world!</h1>
                <p>The first standalone sub app is up and running.</p>
                <a href={`${mainAppUrl}/apps`}>Back to apps</a>
            </section>
        </main>
    );
}

export default App;