import logo from '@/assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Dimataling Seal" className="h-12 w-12 object-contain" />
        </div>
        <p className="text-sm mb-2">© {new Date().getFullYear()} Municipality of Dimataling. All rights reserved.</p>
        <p className="text-xs text-stone-600">DAIPS (MVP v1.0)</p>
      </div>
    </footer>
  );
}
