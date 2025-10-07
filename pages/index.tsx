import Head from 'next/head'
import dynamic from 'next/dynamic'
import TodoList from '../components/TodoList'


const ParticlesBackground = dynamic(() => import('../components/ParticlesBackground'), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>LouayeG Tasks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="description" content="A clean task manager with drag-and-drop reordering" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <ParticlesBackground />
      <main className="container">
        <h1>LouayeG Tasks :</h1>
        <TodoList />
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>Made by LouayeG</p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/louaye-gafaiti/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/LouayeG" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
