"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
    FaGavel,
    FaGenderless,
    FaUsers,
    FaUser,
    FaClock,
    FaStar,
    FaEnvelope,
    FaAward,
    FaBolt,
    FaExclamationTriangle,
    FaSpinner,
    FaBalanceScale
} from 'react-icons/fa';

interface AdvocateResult {
    sl_no: string;
    name: string;
    age: number;
    gender: string;
    experience: number;
    rating: number;
    email: string;
    skills: string;
    short_description: string;
    matchAccuracy?: string;
    matchType?: string;
    message?: string;
    reason?: string;
}

export default function Home() {
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<AdvocateResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!description.trim() || description.trim().length < 20) {
            setError('Please provide a detailed case description (minimum 20 characters).');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/match-advocate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to match advocate');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getMatchQualityColor = (accuracy?: string) => {
        if (!accuracy) return 'text-white';
        const percent = parseInt(accuracy);
        if (percent >= 90) return 'text-red-400';
        if (percent >= 75) return 'text-red-300';
        if (percent >= 60) return 'text-red-200';
        return 'text-gray-400';
    };

    const getMatchQualityBg = (accuracy?: string) => {
        if (!accuracy) return 'bg-gray-800 border-gray-700';
        const percent = parseInt(accuracy);
        if (percent >= 90) return 'bg-red-900/50 border-red-500 shadow-red-500/20';
        if (percent >= 75) return 'bg-red-800/50 border-red-400 shadow-red-400/20';
        if (percent >= 60) return 'bg-red-700/50 border-red-300 shadow-red-300/20';
        return 'bg-gray-800 border-gray-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-20">
            {/* Animated Background Pattern */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Protestive Header */}
                    <div className="text-center mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="relative">
                                <FaBalanceScale className="h-12 w-12 text-red-500 animate-pulse" />
                                <div className="absolute inset-0 h-12 w-12 bg-red-500 rounded-full blur-xl opacity-30 animate-ping"></div>
                            </div>
                            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 uppercase tracking-wider">
                                Justice<span className="text-white">Match</span>
                            </h1>
                        </div>
                        <div className="space-y-2">
                            <p className="text-red-400 text-2xl font-bold uppercase tracking-widest">
                                FIGHT • RESIST • DEFEND
                            </p>
                            <p className="text-gray-300 capitalize text-lg max-w-2xl mx-auto">
                                When the system fails you, we connect you with advocates who never back down.
                                <span className="text-red-400 font-semibold"> Justice is not negotiable.</span>
                            </p>
                        </div>
                    </div>

                    {/* Main Form */}
                    <Card className="bg-black/80 border-red-900/50 backdrop-blur-lg mb-12 shadow-2xl shadow-red-900/20 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
                        <CardHeader className="border-b border-red-900/30">
                            <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                                <FaGavel className="h-6 w-6 text-red-500" />
                                YOUR CASE DESERVES JUSTICE
                            </CardTitle>
                            <CardDescription className="text-gray-300 capitalize text-lg">
                                Tell us your story. We'll find the fighter who will stand with you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your case in detail. What injustice needs to be fought? What rights have been violated? Include case type, complexity, and any specific requirements..."
                                        rows={5}
                                        className="border-red-800/50 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500 focus:ring-2 resize-none transition-all duration-300 text-lg leading-relaxed"
                                        disabled={loading}
                                    />
                                    <div className="flex items-center justify-between text-sm">
                                        <p className="text-gray-400">
                                            Characters: <span className={description.length >= 20 ? 'text-red-400' : 'text-gray-500'}>{description.length}</span>/20 minimum
                                        </p>
                                        <p className="text-red-400 font-medium">
                                            Every word matters in the fight for justice
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || description.trim().length < 20}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-6 text-xl uppercase tracking-wider transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <FaSpinner className="h-6 w-6 animate-spin" />
                                            <span>MOBILIZING JUSTICE...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <FaGenderless className="h-6 w-6" />
                                            <span>FIND MY ADVOCATE</span>
                                            <FaBolt className="h-6 w-6" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Display */}
                    {error && (
                        <Alert className="bg-red-950/80 border-red-800 text-red-200 mb-8 backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-4 duration-500">
                            <FaExclamationTriangle className="h-5 w-5" />
                            <AlertDescription className="text-lg font-medium">{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading Skeleton */}
                    {loading && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000">
                            <Card className="bg-gradient-to-br from-black via-gray-900 to-black border-red-500/50 shadow-2xl shadow-red-900/30 backdrop-blur-lg">
                                <CardHeader className="border-b border-red-900/30 pb-6">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-8 w-8 rounded-full bg-red-900/30" />
                                            <div>
                                                <Skeleton className="h-8 w-48 mb-2 bg-red-900/30" />
                                                <Skeleton className="h-4 w-32 bg-red-900/30" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-10 w-32 bg-red-900/30" />
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-8">
                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            <Card className="bg-red-950/30 border-red-800/50 backdrop-blur-sm">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-4 mb-6">
                                                        <Skeleton className="w-16 h-16 rounded-full bg-red-900/30" />
                                                        <div className="flex-1">
                                                            <Skeleton className="h-6 w-48 mb-2 bg-red-900/30" />
                                                            <Skeleton className="h-4 w-full mb-2 bg-red-900/30" />
                                                            <Skeleton className="h-4 w-3/4 bg-red-900/30" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {[...Array(4)].map((_, i) => (
                                                            <div key={i} className="text-center p-4 bg-black/50 rounded-lg border border-red-900/30">
                                                                <Skeleton className="h-6 w-6 mx-auto mb-2 bg-red-900/30" />
                                                                <Skeleton className="h-3 w-12 mx-auto mb-1 bg-red-900/30" />
                                                                <Skeleton className="h-5 w-8 mx-auto bg-red-900/30" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-red-950/50 border-red-800/50 backdrop-blur-sm">
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-5 w-5 bg-red-900/30" />
                                                        <Skeleton className="h-5 w-20 bg-red-900/30" />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-red-900/30">
                                                        <Skeleton className="h-4 w-4 bg-red-900/30" />
                                                        <div className="flex-1">
                                                            <Skeleton className="h-3 w-12 mb-1 bg-red-900/30" />
                                                            <Skeleton className="h-4 w-32 bg-red-900/30" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-5 w-5 bg-red-900/30" />
                                                    <Skeleton className="h-5 w-40 bg-red-900/30" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Skeleton key={i} className="h-8 w-24 bg-red-900/30" />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-black/70 border-gray-700/50 backdrop-blur-sm">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-5 w-5 bg-red-900/30" />
                                                    <Skeleton className="h-5 w-24 bg-red-900/30" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg">
                                                            <Skeleton className="w-6 h-6 rounded-full bg-red-900/30 flex-shrink-0 mt-0.5" />
                                                            <Skeleton className="h-4 w-full bg-red-900/30" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {result && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-1000">
                            <Card className="bg-gradient-to-br from-black via-gray-900 to-black border-red-500/50 shadow-2xl shadow-red-900/30 backdrop-blur-lg">
                                <CardHeader className="border-b border-red-900/30 pb-6">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <FaUsers className="h-8 w-8 text-red-500" />
                                                <div className="absolute inset-0 h-8 w-8 bg-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                            </div>
                                            <div>
                                                <CardTitle className="text-white text-3xl font-black uppercase">
                                                    YOUR ADVOCATE
                                                </CardTitle>
                                            </div>
                                        </div>
                                        {result.matchAccuracy && (
                                            <Badge className={`${getMatchQualityBg(result.matchAccuracy)} ${getMatchQualityColor(result.matchAccuracy)} border-2 px-4 py-2 text-lg font-bold shadow-lg hover:bg-red-800 hover:text-white`}>
                                                {result.matchAccuracy} MATCH
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        {result.matchType && (
                                            <Badge className="bg-red-900 border-red-600 hover:bg-red-800 hover:text-white text-red-200 px-3 py-1 text-sm font-bold">
                                                {result.matchType}
                                            </Badge>
                                        )}
                                        
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-8">
                                    <div className="space-y-8">
                                        {/* Advocate Profile and Contact Cards in Same Row */}
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            {/* Advocate Profile */}
                                            <Card className="bg-red-950/30 border-red-800/50 backdrop-blur-sm">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-4 mb-6">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                            {result.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-2xl font-bold text-white mb-2 uppercase">
                                                                {result.name.toUpperCase()}
                                                            </h3>
                                                            <p className="text-gray-300 text-lg leading-relaxed uppercase">
                                                                {result.short_description.toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/30">
                                                            <FaUser className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                                            <p className="text-sm font-medium text-gray-400 uppercase">Age</p>
                                                            <p className="text-xl font-bold text-white">{result.age}</p>
                                                        </div>
                                                        <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/30">
                                                            <FaClock className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                                            <p className="text-sm font-medium text-gray-400 uppercase">Experience</p>
                                                            <p className="text-xl font-bold text-white">{result.experience}Y</p>
                                                        </div>
                                                        <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/30">
                                                            <FaStar className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                                            <p className="text-sm font-medium text-gray-400 uppercase">Rating</p>
                                                            <p className="text-xl font-bold text-white">{result.rating}</p>
                                                        </div>
                                                        <div className="text-center p-4 bg-black/50 rounded-lg border border-red-900/30">
                                                            <FaGenderless className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                                            <p className="text-sm font-medium text-gray-400 uppercase">Gender</p>
                                                            <p className="text-xl font-bold text-white uppercase">{result.gender.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Contact Card */}
                                            <Card className="bg-red-950/50 border-red-800/50 backdrop-blur-sm">
                                                <CardHeader>
                                                    <CardTitle className="text-red-200 text-xl flex items-center gap-3">
                                                        <FaEnvelope className="h-5 w-5 text-red-400" />
                                                        CONTACT
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-red-900/30">
                                                        <FaEnvelope className="h-4 w-4 text-red-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-400 uppercase">Email</p>
                                                            <p className="text-red-200 font-medium">{result.email}</p>
                                                        </div>
                                                    </div>

                                                    {result.reason && (
                                                        <div className="mt-6 p-4 bg-gradient-to-br from-red-950/70 to-red-900/50 border border-red-700/50 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <FaBolt className="h-4 w-4 text-red-400" />
                                                                <h4 className="text-red-200 font-bold uppercase">Why This Advocate?</h4>
                                                            </div>
                                                            <p className="text-red-100 text-sm leading-relaxed uppercase">{result.reason.toUpperCase()}</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Skills Card */}
                                        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                                            <CardHeader>
                                                <CardTitle className="text-white text-xl flex items-center gap-3">
                                                    <FaAward className="h-5 w-5 text-red-500" />
                                                    AREAS OF EXPERTISE
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-3">
                                                    {result.skills.split(',').map((skill, index) => (
                                                        <Badge
                                                            key={index}
                                                            className="bg-red-900/30 hover:bg-red-800 hover:text-white border-red-600/50 text-red-200 px-3 py-1 text-sm font-medium uppercase"
                                                        >
                                                            {skill.trim().toUpperCase()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>                                        
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}