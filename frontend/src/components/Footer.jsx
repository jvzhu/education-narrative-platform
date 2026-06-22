import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">æè²åäºå¹³å°</h3>
            <p className="text-gray-400">åäº«æè²æäºï¼ä¼ æ­æè²æºæ§</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">å¿«éé¾æ¥</h4>
            <ul className="text-gray-400 space-y-2">
              <li><a href="/" className="hover:text-white">é¦é¡µ</a></li>
              <li><a href="/" className="hover:text-white">æäº</a></li>
              <li><a href="/" className="hover:text-white">ç¤¾åº</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">å³äº</h4>
            <ul className="text-gray-400 space-y-2">
              <li><a href="/" className="hover:text-white">å³äºæä»¬</a></li>
              <li><a href="/" className="hover:text-white">èç³»æ¹å¼</a></li>
              <li><a href="/" className="hover:text-white">éç§æ¿ç­</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">å³æ³¨æä»¬</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white"><FaGithub size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaTwitter size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><FaLinkedin size={24} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 æè²åäºå¹³å°. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
