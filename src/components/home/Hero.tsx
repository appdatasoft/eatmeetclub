
import { Button } from "@/components/common/Button";

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Discover Unique Dining
              <span className="text-brand-500"> Experiences</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              Join local food events at your favorite restaurants. 
              Connect with community over breakfast, lunch, or dinner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button href="/events" size="lg">
                Find Events
              </Button>
              <Button href="/restaurants/join" variant="outline" size="lg">
                Register Restaurant
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" 
                alt="People enjoying a meal together" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-brand-100 p-2 rounded-full">
                    <svg className="w-5 h-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Next Event</p>
                    <h3 className="font-medium">Farm-to-Table Dinner</h3>
                    <p className="text-sm text-gray-600">Tomorrow, 7:00 PM</p>
                  </div>
                  <Button href="/event/farm-to-table" size="sm">
                    Join
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 bg-teal-500 text-white p-3 rounded-lg shadow-lg transform rotate-6 hidden md:block">
              <p className="text-sm font-medium">Over 200+ Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
