import { Link } from 'react-router-dom';
import { BarChart, Server, ShieldCheck, Filter } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-base text-gray-600">{description}</p>
  </div>
);

function HomePage() {
  const features = [
    {
      icon: <Server size={24} />,
      title: 'Real-Time Data Sync',
      description: 'Automatically syncs your master container list from Google Sheets every 15 minutes, ensuring your data is always up-to-date.',
    },
    {
      icon: <Filter size={24} />,
      title: 'Advanced Filtering & Search',
      description: 'Instantly find any container with powerful, multi-select filters and a global search that checks all relevant fields.',
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Role-Based Access Control',
      description: 'Secure your data with granular permissions. Assign roles to users and control who sees and does what within the system.',
    },
    {
      icon: <BarChart size={24} />,
      title: 'Automated Reporting',
      description: 'Generate and download professional sales cards for individual containers or export comprehensive data sets in PDF format.',
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* --- Hero Section --- */}
      <section className="relative bg-white pt-20 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-[50rem] w-[50rem] bg-indigo-100/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              The Smart CMS for Your Logistics Workflow
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Real-time tracking, advanced filtering, and role-based access to bring clarity and efficiency to your entire team.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go to Dashboard
              </Link>
              <Link to="/signup" className="text-sm font-semibold leading-6 text-gray-900">
                Get Started <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything You Need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              A Better Way to Manage Your Containers
            </p>
          </div>
          <div className="mt-16 max-w-2xl mx-auto sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA Section --- */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to streamline your workflow?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Create an account today and get instant access to your container dashboard.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="rounded-md bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
