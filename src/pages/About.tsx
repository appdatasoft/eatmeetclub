
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Eat Meet Club</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg mb-4">
              Eat Meet Club is on a mission to transform restaurants into vibrant community gathering spaces. 
              We believe that food has the power to bring people together, and our platform helps create 
              meaningful connections through shared dining experiences.
            </p>
            <p className="text-lg">
              By connecting food lovers with local restaurants hosting community dining events, 
              we're building a world where no one eats alone and restaurants thrive as social hubs.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-brand-500 font-bold text-xl mb-2">For Diners</div>
                <p>Browse and join community dining events at local restaurants. Meet new people who share your 
                interest in food and community.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-brand-500 font-bold text-xl mb-2">For Restaurants</div>
                <p>Host community dining events during off-peak hours to fill empty seats and create loyal customers 
                who see your establishment as more than just a place to eat.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-brand-500 font-bold text-xl mb-2">For Communities</div>
                <p>Foster stronger local connections as neighbors meet over meals, supporting local businesses 
                while building meaningful relationships.</p>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg mb-4">
              Eat Meet Club was founded in 2024 by a group of food enthusiasts who noticed two problems: 
              people were increasingly eating alone, and restaurants were struggling with empty tables during off-peak hours.
            </p>
            <p className="text-lg mb-4">
              The idea was simple but powerful: create a platform that helps restaurants host community dining events 
              where strangers can come together to enjoy a meal, conversation, and connection.
            </p>
            <p className="text-lg">
              Since our launch, we've facilitated thousands of connections over meals, helping both diners find community 
              and restaurants thrive as social spaces.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
            <p className="text-lg mb-6">
              Whether you're looking to meet new people, find a dining companion, or simply enjoy a meal in good company, 
              Eat Meet Club has a seat for you at the table.
            </p>
            <div className="flex justify-center">
              <a href="/signup" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Sign Up Today
              </a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
