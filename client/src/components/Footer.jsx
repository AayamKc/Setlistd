import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-primary py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="footer-section">
            <h3 className="text-lg font-bold mb-4">Setlisd</h3>
            <p>Discover and review your favorite concerts and artists.</p>
          </div>
          
          <div className="footer-section">
            <h4 className="text-lg font-bold mb-4">Developers</h4>
            <p>Developed by <strong>Aayam Kc</strong> and <strong>Eston Kuwahara</strong></p>
            <p>
              <a href="mailto:kcaayam04@gmail.com" className="hover:text-white">
                kcaayam04@gmail.com
              </a>
            </p>
            <p>
              <a href="mailto:eston.kuwahara@emory.edu" className="hover:text-white">
                eston.kuwahara@emory.edu
              </a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary mt-8 pt-4 flex justify-between items-center">
          <div className="text-sm">
            <p>&copy; {currentYear} Setlisd. All rights reserved.</p>
          </div>
          
          <div className="text-sm">
            <p>Concert data powered by SeatGeek API</p>
          </div>
        </div>
      </div>1
    </footer>
  )
}

export default Footer