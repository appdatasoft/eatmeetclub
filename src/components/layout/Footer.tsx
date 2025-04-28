
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-12 pb-8 text-gray-600">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-serif text-xl font-bold text-brand-500">
                Eat<span className="text-teal-500">Meet</span>Club
              </span>
            </Link>
            <p className="mt-3 text-sm">
              Transforming restaurants into vibrant community gathering spaces.
            </p>
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-brand-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-11c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1zm0 3c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1zm0 3c0-.55.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Links sections */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider">For Restaurants</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/restaurants/join" className="text-sm hover:text-brand-500">Join as Restaurant</Link>
              </li>
              <li>
                <Link to="/restaurants/create-event" className="text-sm hover:text-brand-500">Host an Event</Link>
              </li>
              <li>
                <Link to="/restaurants/pricing" className="text-sm hover:text-brand-500">Pricing</Link>
              </li>
              <li>
                <Link to="/restaurants/faq" className="text-sm hover:text-brand-500">FAQ</Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider">For Attendees</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/events" className="text-sm hover:text-brand-500">Browse Events</Link>
              </li>
              <li>
                <Link to="/events/breakfast" className="text-sm hover:text-brand-500">Breakfast Events</Link>
              </li>
              <li>
                <Link to="/events/lunch" className="text-sm hover:text-brand-500">Lunch Events</Link>
              </li>
              <li>
                <Link to="/events/dinner" className="text-sm hover:text-brand-500">Dinner Events</Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-brand-500">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-brand-500">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-brand-500">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-brand-500">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-center text-gray-400">
            &copy; {currentYear} EatMeetClub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
