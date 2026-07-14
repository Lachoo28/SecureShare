
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FileAccess from './pages/FileAccess'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="file/:id" element={<FileAccess />} />
      </Route>
    </Routes>
  )
}

export default App
  