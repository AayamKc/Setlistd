import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Setlisd</h3>
            <p>Discover and review your favorite concerts and artists.</p>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/cookies">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/feedback">Feedback</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Developer</h4>
            <p>Developed by <strong>Aayam Kc</strong></p>
            <p>
              <a href="mailto:kcaayam04@gmail.com" className="developer-email">
                kcaayam04@gmail.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {currentYear} Setlisd. All rights reserved.</p>
          </div>
          
          <div className="data-attribution">
            <p>Concert data powered by SeatGeek API</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer