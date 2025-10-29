import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface AccueilConnecteProps {
    user: User;
}

const StatCard = ({ value, label }: { value: string, label: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg border text-center">
        <p className="text-3xl font-bold text-green-600">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </div>
);

export default function AccueilConnecte({ user }: AccueilConnecteProps) {
    return (
        <div className="space-y-12">
            <section className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2 tracking-tight">
                    Bon retour, {user.name} !
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Prêt à relever de nouveaux défis ? Continuez votre parcours d'apprentissage.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link to="/dashboard" className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        Explorer les Quiz
                    </Link>
                    <Link to="/dashboard/progression" className="bg-white text-gray-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border">
                        Voir ma progression
                    </Link>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-center mb-10">Que souhaitez-vous faire ?</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Link to="/quiz" className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
                        <h3 className="text-xl font-semibold mb-2 text-green-700">Passer un Quiz</h3>
                        <p className="text-gray-600">Mettez vos connaissances à l'épreuve avec notre collection de quiz dans diverses matières.</p>
                    </Link>
                     <Link to="/dashboard/resultats" className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
                        <h3 className="text-xl font-semibold mb-2 text-green-700">Consulter mes Notes</h3>
                        <p className="text-gray-600">Accédez à vos résultats universitaires officiels et suivez vos performances académiques.</p>
                    </Link>
                     <Link to="/dashboard/classement" className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-200">
                        <h3 className="text-xl font-semibold mb-2 text-green-700">Voir le Classement</h3>
                        <p className="text-gray-600">Comparez vos scores avec ceux des autres étudiants et visez le sommet du classement.</p>
                    </Link>
                </div>
            </section>
        </div>
    );
}
