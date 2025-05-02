import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GameDetail from './pages/GameDetail'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App