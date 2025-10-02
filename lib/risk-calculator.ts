
interface RiskFactors {
  cost: number;
  duration: number;
  projectType: string;
  technicalComplexity: number;
}

export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;

  if (factors.cost < 5000) {
    score += 5;
  } else if (factors.cost < 20000) {
    score += 15;
  } else if (factors.cost < 50000) {
    score += 25;
  } else if (factors.cost < 100000) {
    score += 35;
  } else {
    score += 40;
  }

  if (factors.duration < 30) {
    score += 5;
  } else if (factors.duration < 90) {
    score += 12;
  } else if (factors.duration < 180) {
    score += 20;
  } else {
    score += 30;
  }

  const typeRisk: Record<string, number> = {
    WEB_DEVELOPMENT: 8,
    MOBILE_APP: 12,
    DATA_ANALYSIS: 10,
    INFRASTRUCTURE: 18,
    SECURITY: 20,
    RESEARCH: 15,
    OTHER: 10,
  };
  score += typeRisk[factors.projectType] || 10;

  score += Math.min(factors.technicalComplexity * 2, 10);

  return Math.min(Math.max(Math.round(score), 0), 100);
}

/**
 * Teknik karmaşıklık skorunu hesapla
 */
export function calculateTechnicalComplexity(technicalDesc: string): number {
  const length = technicalDesc.length;
  
  const technicalTerms = [
    'api', 'database', 'authentication', 'integration', 'microservice',
    'cloud', 'deployment', 'architecture', 'scalability', 'security',
    'algorithm', 'optimization', 'framework', 'library', 'backend',
    'frontend', 'devops', 'ci/cd', 'docker', 'kubernetes'
  ];
  
  const termCount = technicalTerms.filter(term => 
    technicalDesc.toLowerCase().includes(term)
  ).length;

  let complexityScore = 0;
  if (length > 1000) complexityScore = 3;
  else if (length > 500) complexityScore = 2;
  else if (length > 200) complexityScore = 1;

  if (termCount >= 5) complexityScore += 2;
  else if (termCount >= 3) complexityScore += 1;

  return Math.min(complexityScore, 5);
}

/**
 * Risk seviyesini string olarak döndür
 */
export function getRiskLevel(score: number): {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  label: string;
  color: string;
} {
  if (score < 30) {
    return {
      level: 'LOW',
      label: 'Düşük Risk',
      color: 'green'
    };
  } else if (score < 60) {
    return {
      level: 'MEDIUM',
      label: 'Orta Risk',
      color: 'yellow'
    };
  } else if (score < 80) {
    return {
      level: 'HIGH',
      label: 'Yüksek Risk',
      color: 'orange'
    };
  } else {
    return {
      level: 'CRITICAL',
      label: 'Kritik Risk',
      color: 'red'
    };
  }
}