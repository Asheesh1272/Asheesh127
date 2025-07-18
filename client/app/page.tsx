"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, Shield, Users, Zap, ChevronDown, Play, Check, MessageCircle, Vote, Eye, Lock, Globe, AlertTriangle } from 'lucide-react';
import Footer from '@/components/Footer';
import WalletConnectButton from '@/components/WalletConnectButton';

const VoiceChainLanding = () => {
  const [address, setAddress] = useState('');

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Immutable Records",
      description: "Every report is permanently stored on blockchain, ensuring transparency and preventing tampering or deletion."
    },
    {
      icon: <Eye className="w-8 h-8 text-red-600" />,
      title: "Complete Transparency",
      description: "All platform activities are publicly verifiable on the blockchain, creating unprecedented accountability."
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: "Community Verification",
      description: "Reports are validated through decentralized consensus, ensuring accuracy and preventing false accusations."
    },
    {
      icon: <Lock className="w-8 h-8 text-red-600" />,
      title: "Privacy Protection",
      description: "Advanced cryptographic techniques protect whistleblower identities while maintaining report integrity."
    },
    {
      icon: <Globe className="w-8 h-8 text-red-600" />,
      title: "Global Network",
      description: "Connect with anti-corruption efforts worldwide through a decentralized, borderless platform."
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      title: "Real-time Monitoring",
      description: "Advanced algorithms detect patterns and provide instant alerts about potential corruption activities."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Ethics Researcher",
      company: "International Transparency Council",
      content: "VoiceChain represents a paradigm shift in how we combat corruption. The blockchain foundation ensures evidence integrity while protecting sources.",
      avatar: "SJ"
    },
    {
      name: "Anonymous Contributor",
      role: "Government Whistleblower",
      company: "Protected Identity",
      content: "For the first time, I can report misconduct without fear of retaliation. The platform's security measures are revolutionary.",
      avatar: "AC"
    },
    {
      name: "Prof. Michael Chen",
      role: "Blockchain Specialist",
      company: "Digital Rights Institute",
      content: "The technical architecture is impressive. Immutable records combined with privacy protection creates the perfect anti-corruption tool.",
      avatar: "MC"
    }
  ];

  const stats = [
    { number: "47,312", label: "Reports Documented" },
    { number: "2.3M", label: "Community Members" },
    { number: "89", label: "Countries Active" },
    { number: "1,247", label: "Cases Resolved" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 h-screen sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="space-y-6">
              <Badge className="bg-red-600 text-white border-red-600">
                Blockchain-Powered Transparency
              </Badge>
              <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                Combat Corruption
                <span className="block text-red-600"> Through Technology </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Voice Chain is a decentralized platform that leverages blockchain technology to create
                an immutable record of corruption reports while protecting whistleblower identities.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <WalletConnectButton />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              Platform Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced blockchain technology ensures transparency, security, and immutability
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700 hover:bg-gray-700">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto p-4 bg-gray-700 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="onboard" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-white">Document Evidence</h3>
              <p className="text-gray-300 leading-relaxed">
                Securely upload documents, photos, and testimonies with cryptographic verification to ensure authenticity.
              </p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-white">Community Verification</h3>
              <p className="text-gray-300 leading-relaxed">
                Reports undergo decentralized verification through community consensus mechanisms and expert review.
              </p>
            </div>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-white">Immutable Record</h3>
              <p className="text-gray-300 leading-relaxed">
                Verified reports are permanently stored on blockchain, creating an unchangeable record for accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

    
      {/* Call to Action */}
      <section id="join" className="py-20 px-4 sm:px-6 lg:px-8 bg-red-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white">
            Join the Movement
          </h2>
          <p className="text-xl text-red-100">
            Help build a more transparent world through blockchain technology and community action.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Enter your wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-white text-black border-none placeholder-gray-500 focus:ring-2 focus:ring-white"
            />
            <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 font-semibold whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VoiceChainLanding;