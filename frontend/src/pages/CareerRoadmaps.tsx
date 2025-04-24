import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

interface RoadmapPhase {
  title: string;
  topics: string[];
}

interface CareerRoadmap {
  title: string;
  phases: RoadmapPhase[];
}

const CareerRoadmaps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roadmaps, setRoadmaps] = useState<Record<string, CareerRoadmap>>({});
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [filteredCareers, setFilteredCareers] = useState<string[]>([]);

  useEffect(() => {
    // Load the roadmaps data
    fetch('/final_detailed_career_roadmaps.json')
      .then(response => response.json())
      .then(data => {
        setRoadmaps(data);
        setFilteredCareers(Object.keys(data));
      })
      .catch(error => console.error('Error loading roadmaps:', error));
  }, []);

  useEffect(() => {
    // Filter careers based on search term
    if (searchTerm.trim() === '') {
      setFilteredCareers(Object.keys(roadmaps));
    } else {
      const filtered = Object.keys(roadmaps).filter(career =>
        career.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCareers(filtered);
    }
  }, [searchTerm, roadmaps]);

  return (
    <div className="min-h-screen bg-stone-50 mt-16">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="outline" size="default" className='bg-blue-200 shadow-sm'>
            <Link to="/Dashboard">Back</Link>
        </Button>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Career Roadmaps</h1>
          
          {/* Search Section */}
          <div className="mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search careers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Career List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredCareers.map((career) => (
              <Card 
                key={career}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedCareer(career)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{career}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Selected Career Roadmap */}
          {selectedCareer && roadmaps[selectedCareer] && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold mb-6">{selectedCareer} Roadmap</h2>
              <div className="space-y-6">
                {roadmaps[selectedCareer].phases.map((phase, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-xl">{phase.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-6 space-y-2">
                        {phase.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="text-gray-700">
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CareerRoadmaps; 