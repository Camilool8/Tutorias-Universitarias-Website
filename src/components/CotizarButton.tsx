import React from 'react'
import { Link } from 'react-router-dom'
import { Calculator } from 'lucide-react'

const CotizarButton: React.FC = () => {
  return (
    <Link
      to="/cotizar"
      className="flex items-center space-x-1 bg-yellow-400 text-blue-800 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors"
    >
      <Calculator size={18} />
      <span>Cotiza Con Nosotros</span>
    </Link>
  )
}

export default CotizarButton