export class SymptomCheckerService {
  private static symptomDatabase = {
    'headache': {
      commonCauses: ['Tension', 'Dehydration', 'Stress', 'Eye strain'],
      recommendations: [
        'Rest in a quiet, dark room',
        'Stay hydrated by drinking water',
        'Apply a cold or warm compress to your head',
        'Consider over-the-counter pain relievers',
        'Practice relaxation techniques'
      ],
      whenToSeekHelp: 'Seek immediate medical attention if you have sudden severe headache, headache with fever, or headache after head injury.'
    },
    'fever': {
      commonCauses: ['Viral infection', 'Bacterial infection', 'Heat exhaustion'],
      recommendations: [
        'Rest and stay hydrated',
        'Take fever-reducing medications as directed',
        'Use cool compresses',
        'Wear light clothing',
        'Monitor temperature regularly'
      ],
      whenToSeekHelp: 'Seek medical care if fever is above 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe symptoms.'
    },
    'cough': {
      commonCauses: ['Common cold', 'Allergies', 'Dry air', 'Throat irritation'],
      recommendations: [
        'Stay hydrated with warm liquids',
        'Use a humidifier or breathe steam',
        'Try honey for throat soothing',
        'Avoid irritants like smoke',
        'Rest your voice'
      ],
      whenToSeekHelp: 'See a doctor if cough persists for more than 2 weeks, produces blood, or is accompanied by high fever.'
    },
    'stomach pain': {
      commonCauses: ['Indigestion', 'Gas', 'Food poisoning', 'Stress'],
      recommendations: [
        'Rest and avoid solid foods temporarily',
        'Stay hydrated with clear fluids',
        'Try the BRAT diet (bananas, rice, applesauce, toast)',
        'Apply heat to the abdomen',
        'Avoid dairy and fatty foods'
      ],
      whenToSeekHelp: 'Seek immediate care for severe pain, signs of dehydration, or if pain persists for more than 24 hours.'
    },
    'dizziness': {
      commonCauses: ['Dehydration', 'Low blood sugar', 'Inner ear problems', 'Medication side effects'],
      recommendations: [
        'Sit or lie down immediately',
        'Stay hydrated',
        'Avoid sudden movements',
        'Eat something if blood sugar is low',
        'Rest in a cool environment'
      ],
      whenToSeekHelp: 'Get medical help if dizziness is severe, persistent, or accompanied by chest pain, difficulty breathing, or fainting.'
    }
  };

  static analyzeSymptoms(symptoms: string[]): any {
    const results = [];
    
    for (const symptom of symptoms) {
      const lowerSymptom = symptom.toLowerCase();
      
      // Find matching conditions
      for (const [condition, data] of Object.entries(this.symptomDatabase)) {
        if (lowerSymptom.includes(condition) || condition.includes(lowerSymptom)) {
          results.push({
            condition: condition.charAt(0).toUpperCase() + condition.slice(1),
            ...data
          });
        }
      }
    }

    // If no specific matches, provide general advice
    if (results.length === 0) {
      results.push({
        condition: 'General Health Advice',
        commonCauses: ['Various factors'],
        recommendations: [
          'Monitor your symptoms',
          'Stay hydrated and rest',
          'Maintain a healthy diet',
          'Consider consulting a healthcare provider',
          'Keep track of when symptoms occur'
        ],
        whenToSeekHelp: 'Consult a healthcare provider if symptoms persist, worsen, or if you have concerns about your health.'
      });
    }

    return {
      timestamp: new Date().toISOString(),
      symptoms: symptoms,
      results: results,
      disclaimer: 'This is not a substitute for professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment.'
    };
  }

  static getCommonSymptoms(): string[] {
    return [
      'Headache',
      'Fever',
      'Cough',
      'Stomach pain',
      'Dizziness',
      'Nausea',
      'Fatigue',
      'Sore throat',
      'Runny nose',
      'Body aches'
    ];
  }
}