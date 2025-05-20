import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">About EduLearn Hub</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                At EduLearn Hub, we're committed to revolutionizing education by providing an accessible, 
                engaging, and effective learning platform for students of all ages. Our mission is to 
                empower learners to achieve their academic goals through personalized education, 
                expert guidance, and innovative teaching methods.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-700 mb-3">Quality Education</h3>
                  <p className="text-gray-600">
                    We partner with experienced educators and subject matter experts to deliver 
                    high-quality educational content across a wide range of subjects.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-3">Personalized Learning</h3>
                  <p className="text-gray-600">
                    Our platform adapts to individual learning styles and paces, ensuring each 
                    student receives the support they need to succeed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, EduLearn Hub began with a simple idea: to create a bridge between 
                talented educators and students seeking quality education. What started as a small 
                tutoring service has grown into a comprehensive educational platform serving 
                thousands of students worldwide.
              </p>
              <p className="text-gray-600 mb-6">
                Our team of dedicated professionals works tirelessly to develop and refine our 
                educational offerings, ensuring they meet the highest standards of academic excellence.
              </p>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Values</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Excellence:</strong> We strive for excellence in everything we do.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Innovation:</strong> We continuously innovate to improve the learning experience.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Integrity:</strong> We operate with honesty and transparency.</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Inclusivity:</strong> We welcome learners from all backgrounds and abilities.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 mb-6">
                Our diverse team brings together expertise in education, technology, and design
                to create an exceptional learning experience for our students.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                         alt="Dr. James Wilson" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Dr. James Wilson</h3>
                  <p className="text-sm text-gray-500">Founder & CEO</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                         alt="Dr. Sarah Chen" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Dr. Sarah Chen</h3>
                  <p className="text-sm text-gray-500">Chief Academic Officer</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                         alt="Michael Rodriguez" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Michael Rodriguez</h3>
                  <p className="text-sm text-gray-500">Head of Technology</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
