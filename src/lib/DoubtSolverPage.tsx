import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DoubtSolver from '@/lib/DoubtSolver';

const DoubtSolverPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>AI Doubt Solver | MARGDARSHAK</title>
        <meta name="description" content="Upload an image of a complex problem and get a step-by-step solution from our AI tutor." />
      </Helmet>
      
      <div className="mb-6">
        {/* This link assumes you have a central dashboard at '/dashboard' */}
        <Link to="/dashboard">
          <Button variant="outline" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <DoubtSolver />
    </div>
  );
};

export default DoubtSolverPage;