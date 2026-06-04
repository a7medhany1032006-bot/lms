import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} هاني دويدار - عربي بالأرقام. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;
