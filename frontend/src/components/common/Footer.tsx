import { AiOutlineGithub, AiOutlineLinkedin } from "react-icons/ai";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex flex-col items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
      <div className="container mx-auto px-4 flex flex-wrap justify-center sm:justify-between items-center text-sm">
        <p className="ml-4">
          &copy; {currentYear} PACIFIC KNOWLEDGE. All rights reserved.
        </p>
        <div
          aria-label="footer-links"
          className="flex space-x-4 mt-2 mr-4 sm:mt-0"
        >
          <a href="/terms-and-conditions">Terms and conditions</a>
          <a href="/privacy-policy">Privacy policy</a>
        </div>
        <div
          aria-label="footer-social-links"
          className="flex space-x-4 mt-2 mr-4 sm:mt-0"
        >
          <a
            href="https://www.linkedin.com/in/naiki-brotherson987"
            aria-label="LinkedIn"
            className="hover:text-gray-300"
          >
            <AiOutlineLinkedin className="w-5 h-5" />
          </a>

          <a
            href="https://github.com/naikibro"
            aria-label="GitHub"
            className="hover:text-gray-300"
          >
            <AiOutlineGithub className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
