import React from 'react';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="container mx-auto p-6">
      <motion.div 
        className="my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
        <p className="text-gray-600">
          This page is under development. Content will be available soon.
        </p>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
